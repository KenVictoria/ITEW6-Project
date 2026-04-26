<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $authenticatable = User::query()->where('email', $credentials['email'])->first();

        if ($authenticatable === null) {
            $authenticatable = Student::query()->where('email', $credentials['email'])->first();
        }

        if ($authenticatable === null || ! Hash::check($credentials['password'], $authenticatable->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $authenticatable->tokens()->delete();

        $token = $authenticatable->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $authenticatable->id,
                'name' => $authenticatable->name,
                'email' => $authenticatable->email,
                'role' => $authenticatable->role,
                'department' => $authenticatable->department ?? null,
                'student_id' => $authenticatable->student_id ?? null,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department ?? null,
            'student_id' => $user->student_id ?? null,
        ];

        if ($user instanceof Student) {
            $payload['affiliations'] = $user->affiliations;
            $payload['skills'] = $user->skills;
            $payload['hobby'] = $user->hobby;
            $payload['grade_remarks'] = $user->grade_remarks;
            $payload['violations'] = $user->violations;
        }

        return response()->json($payload);
    }

    public function updateStudentAccount(Request $request): JsonResponse
    {
        $student = $request->user();
        if (! $student instanceof Student) {
            abort(403, 'Only students can access this endpoint.');
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:students,email,' . $student->id],
            'student_id' => ['sometimes', 'string', 'max:64', 'unique:students,student_id,' . $student->id],
            'department' => ['sometimes', 'string', 'in:BSIT,BSCS'],
            'affiliations' => ['nullable', 'array'],
            'affiliations.*' => ['string', 'max:255'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:255'],
            'hobby' => ['nullable', 'string', 'max:255'],
            'grade_remarks' => ['nullable', 'string', 'max:255'],
            'violations' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if (array_key_exists('password', $data) && empty($data['password'])) {
            unset($data['password']);
        }

        $student->update($data);

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'role' => $student->role,
            'department' => $student->department,
            'student_id' => $student->student_id,
            'affiliations' => $student->affiliations,
            'skills' => $student->skills,
            'hobby' => $student->hobby,
            'grade_remarks' => $student->grade_remarks,
            'violations' => $student->violations,
        ]);
    }
}
