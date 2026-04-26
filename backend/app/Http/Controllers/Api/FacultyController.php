<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FacultyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Faculty::query()->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:faculties,email'],
            'employee_id' => ['required', 'string', 'max:64', 'unique:faculties,employee_id'],
            'department' => ['required', 'string', 'in:BSIT,BSCS'],
        ]);

        $faculty = Faculty::query()->create($data);

        return response()->json($faculty, Response::HTTP_CREATED);
    }

    public function show(Faculty $faculty): JsonResponse
    {
        return response()->json($faculty);
    }

    public function update(Request $request, Faculty $faculty): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:faculties,email,'.$faculty->id],
            'employee_id' => ['sometimes', 'string', 'max:64', 'unique:faculties,employee_id,'.$faculty->id],
            'department' => ['sometimes', 'string', 'in:BSIT,BSCS'],
        ]);

        $faculty->update($data);

        return response()->json($faculty->fresh());
    }

    public function destroy(Faculty $faculty): Response
    {
        $faculty->delete();

        return response()->noContent();
    }
}
