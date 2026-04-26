<?php
// app/Http/Controllers/Api/CourseController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CourseController extends Controller
{
    // GET /api/courses - This should just return all courses
    public function index(): JsonResponse
    {
        try {
            $courses = Course::all();
            return response()->json($courses);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:courses,code'],
            'title' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string', 'in:BSIT,BSCS'],
            'units' => ['nullable', 'integer', 'min:1', 'max:12'],
            'curriculum' => ['required', 'string', 'max:64'],
            'semester' => ['required', 'integer', 'in:1,2'],
            'year_level' => ['required', 'integer', 'between:1,4'],
        ]);

        $course = Course::create($data);
        return response()->json($course, Response::HTTP_CREATED);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json($course);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:32', 'unique:courses,code,' . $course->id],
            'title' => ['sometimes', 'string', 'max:255'],
            'department' => ['sometimes', 'string', 'in:BSIT,BSCS'],
            'units' => ['nullable', 'integer', 'min:1', 'max:12'],
            'curriculum' => ['sometimes', 'string', 'max:64'],
            'semester' => ['sometimes', 'integer', 'in:1,2'],
            'year_level' => ['sometimes', 'integer', 'between:1,4'],
        ]);

        $course->update($data);
        return response()->json($course);
    }

    public function destroy(Course $course): Response
    {
        $course->delete();
        return response()->noContent();
    }
}