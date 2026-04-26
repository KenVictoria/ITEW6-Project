<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Syllabus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SyllabusController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Syllabus::query()->with('course')->orderBy('title')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'version' => ['nullable', 'string', 'max:32'],
        ]);

        $syllabus = Syllabus::query()->create($data);

        return response()->json($syllabus->load('course'), Response::HTTP_CREATED);
    }

    public function show(Syllabus $syllabus): JsonResponse
    {
        return response()->json($syllabus->load(['course', 'lessons']));
    }

    public function update(Request $request, Syllabus $syllabus): JsonResponse
    {
        $data = $request->validate([
            'course_id' => ['sometimes', 'exists:courses,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'version' => ['nullable', 'string', 'max:32'],
        ]);

        $syllabus->update($data);

        return response()->json($syllabus->fresh()->load('course'));
    }

    public function destroy(Syllabus $syllabus): Response
    {
        $syllabus->delete();

        return response()->noContent();
    }
}
