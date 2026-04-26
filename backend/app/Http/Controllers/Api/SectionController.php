<?php
// app/Http/Controllers/Api/SectionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SectionController extends Controller
{
    /**
     * Display a listing of sections with pagination
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->integer('per_page', 15);
            $perPage = max(5, min(100, $perPage));
            
            $query = Section::with(['course']);
            
            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('course', function($cq) use ($search) {
                          $cq->where('code', 'like', "%{$search}%")
                             ->orWhere('title', 'like', "%{$search}%");
                      });
                });
            }
            
            if ($request->filled('course_id')) {
                $query->where('course_id', $request->course_id);
            }
            
            if ($request->filled('semester')) {
                $query->where('semester', $request->semester);
            }
            
            if ($request->filled('year_level')) {
                $query->where('year_level', $request->year_level);
            }
            
            $sections = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            // Transform data for frontend
            $transformed = $sections->getCollection()->map(function($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'course_id' => $section->course_id,
                    'course_code' => $section->course?->code ?? 'N/A',
                    'course_name' => $section->course?->title ?? 'N/A',
                    'academic_year' => $section->academic_year,
                    'semester' => $section->semester,
                    'year_level' => $section->year_level,
                    'max_capacity' => $section->max_capacity,
                    'current_enrolled' => $section->current_enrolled,
                    'available_slots' => $section->max_capacity - $section->current_enrolled,
                    'is_full' => $section->current_enrolled >= $section->max_capacity,
                    'students_count' => $section->students()->count(),
                    'created_at' => $section->created_at,
                    'updated_at' => $section->updated_at,
                ];
            });
            
            return response()->json([
                'data' => $transformed,
                'current_page' => $sections->currentPage(),
                'per_page' => $sections->perPage(),
                'total' => $sections->total(),
                'last_page' => $sections->lastPage(),
                'first_page_url' => $sections->url(1),
                'last_page_url' => $sections->url($sections->lastPage()),
                'next_page_url' => $sections->nextPageUrl(),
                'prev_page_url' => $sections->previousPageUrl(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Section index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check for duplicate section
     */
    private function checkDuplicate(array $data, ?int $excludeId = null): ?array
    {
        $query = Section::where('course_id', $data['course_id'])
            ->where('name', $data['name'])
            ->where('academic_year', $data['academic_year'])
            ->where('semester', $data['semester']);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        $existing = $query->first();
        
        if ($existing) {
            return [
                'message' => 'A section with this name already exists for the same course, academic year, and semester.',
                'existing_section' => [
                    'id' => $existing->id,
                    'name' => $existing->name,
                    'course_code' => $existing->course?->code,
                    'academic_year' => $existing->academic_year,
                    'semester' => $existing->semester,
                ]
            ];
        }
        
        return null;
    }

    /**
     * Store a newly created section
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'course_id' => 'required|exists:courses,id',
                'name' => 'required|string|max:255',
                'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
                'semester' => 'required|in:1st,2nd,Summer',
                'year_level' => 'required|integer|min:1|max:4',
                'max_capacity' => 'required|integer|min:1|max:100',
            ]);
            
            // Check for duplicate
            $duplicate = $this->checkDuplicate($validated);
            if ($duplicate) {
                return response()->json([
                    'message' => $duplicate['message'],
                    'duplicate' => $duplicate['existing_section'],
                    'errors' => [
                        'name' => ['A section with this name already exists for this course, academic year, and semester.']
                    ]
                ], 422);
            }
            
            $validated['current_enrolled'] = 0;
            
            $section = Section::create($validated);
            
            return response()->json([
                'message' => 'Section created successfully',
                'section' => $section->load('course')
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified section
     */
    public function show(Section $section): JsonResponse
    {
        try {
            $section->load(['course', 'students']);
            
            return response()->json([
                'id' => $section->id,
                'name' => $section->name,
                'course_id' => $section->course_id,
                'course_code' => $section->course?->code ?? 'N/A',
                'course_name' => $section->course?->title ?? 'N/A',
                'academic_year' => $section->academic_year,
                'semester' => $section->semester,
                'year_level' => $section->year_level,
                'max_capacity' => $section->max_capacity,
                'current_enrolled' => $section->current_enrolled,
                'available_slots' => $section->max_capacity - $section->current_enrolled,
                'is_full' => $section->current_enrolled >= $section->max_capacity,
                'students' => $section->students,
                'created_at' => $section->created_at,
                'updated_at' => $section->updated_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified section
     */
    public function update(Request $request, Section $section): JsonResponse
    {
        try {
            $validated = $request->validate([
                'course_id' => 'sometimes|exists:courses,id',
                'name' => 'sometimes|string|max:255',
                'academic_year' => 'sometimes|string|regex:/^\d{4}-\d{4}$/',
                'semester' => 'sometimes|in:1st,2nd,Summer',
                'year_level' => 'sometimes|integer|min:1|max:4',
                'max_capacity' => 'sometimes|integer|min:1|max:100',
            ]);
            
            // Check for duplicate (excluding current section)
            $merged = array_merge($section->toArray(), $validated);
            $duplicate = $this->checkDuplicate($merged, $section->id);
            if ($duplicate) {
                return response()->json([
                    'message' => $duplicate['message'],
                    'duplicate' => $duplicate['existing_section'],
                    'errors' => [
                        'name' => ['A section with this name already exists for this course, academic year, and semester.']
                    ]
                ], 422);
            }
            
            // Check if new capacity is less than current enrolled
            if (isset($validated['max_capacity']) && $validated['max_capacity'] < $section->current_enrolled) {
                return response()->json([
                    'message' => 'Cannot reduce capacity below current enrollment count',
                    'current_enrolled' => $section->current_enrolled
                ], 422);
            }
            
            $section->update($validated);
            
            return response()->json([
                'message' => 'Section updated successfully',
                'section' => $section->fresh()->load('course')
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified section
     */
    public function destroy(Section $section): Response
    {
        try {
            // Check if section has students
            if ($section->students()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete section that has enrolled students'
                ], 422);
            }
            
            $section->delete();
            return response()->noContent();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get students that can be added to a section
     */
    public function getAvailableStudents(Section $section): JsonResponse
    {
        try {
            $students = Student::whereDoesntHave('sections', function($query) use ($section) {
                $query->where('section_id', $section->id);
            })->orderBy('name')->get(['id', 'name', 'student_id']);
            
            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Add students to section
     */
    public function addStudents(Request $request, Section $section): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_ids' => 'required|array',
                'student_ids.*' => 'exists:students,id'
            ]);
            
            $newCount = $section->current_enrolled + count($validated['student_ids']);
            
            if ($newCount > $section->max_capacity) {
                return response()->json([
                    'message' => 'Adding these students would exceed the section capacity',
                    'available_slots' => $section->max_capacity - $section->current_enrolled
                ], 422);
            }
                   
            DB::transaction(function() use ($section, $validated) {
                $section->students()->syncWithoutDetaching($validated['student_ids']);
                $section->increment('current_enrolled', count($validated['student_ids']));
            });

            // Return the updated section with fresh data
            return response()->json([
                'message' => count($validated['student_ids']) . ' students added successfully',
                'section' => $section->fresh()->load(['course', 'students'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove student from section
     */
    public function removeStudent(Section $section, Student $student): JsonResponse
    {
        try {
            DB::transaction(function() use ($section, $student) {
                $section->students()->detach($student->id);
                $section->decrement('current_enrolled');
            });
            
            return response()->json([
                'message' => 'Student removed from section successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get filter options
     */
    public function filterOptions(): JsonResponse
    {
        try {
            $courses = Course::select('id', 'code', 'title')->orderBy('code')->get();
            $semesters = ['1st', '2nd', 'Summer'];
            $yearLevels = [1, 2, 3, 4];
            
            return response()->json([
                'courses' => $courses,
                'semesters' => $semesters,
                'year_levels' => $yearLevels,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}