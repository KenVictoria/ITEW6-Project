<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LessonController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Lesson::query()->with('syllabus')->orderBy('week_number')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'syllabus_id' => ['required', 'exists:syllabi,id'],
            'title' => ['required', 'string', 'max:255'],
            'week_number' => ['nullable', 'integer', 'min:1'],
            'summary' => ['nullable', 'string'],
        ]);

        $lesson = Lesson::query()->create($data);

        return response()->json($lesson->load('syllabus'), Response::HTTP_CREATED);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        return response()->json($lesson->load('syllabus'));
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $data = $request->validate([
            'syllabus_id' => ['sometimes', 'exists:syllabi,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'week_number' => ['nullable', 'integer', 'min:1'],
            'summary' => ['nullable', 'string'],
        ]);

        $lesson->update($data);

        return response()->json($lesson->fresh()->load('syllabus'));
    }

    public function destroy(Lesson $lesson): Response
    {
        $lesson->delete();

        return response()->noContent();
    }
}
