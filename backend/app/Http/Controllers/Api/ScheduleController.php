<?php
// app/Http/Controllers/Api/ScheduleController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\Section;
use App\Services\ScheduleConflictService;
use App\Services\ScheduleCalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function __construct(
        private readonly ScheduleConflictService $scheduleConflictService,
        private readonly ScheduleCalendarService $calendarService
    ) {}

    public function index(): JsonResponse
    {
        $schedules = Schedule::query()
            ->with(['course', 'section', 'room', 'faculty'])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
        
        return response()->json([
            'schedules' => $schedules,
            'calendar_events' => $this->calendarService->formatForCalendar($schedules),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        
        // Set defaults if not provided
        $data['semester'] = $data['semester'] ?? '1st';
        $data['school_year'] = $data['school_year'] ?? date('Y');
        $data['status'] = $data['status'] ?? 'scheduled';

        $this->scheduleConflictService->assertNoConflict([
            'room_id' => $data['room_id'],
            'faculty_id' => $data['faculty_id'],
            'day_of_week' => $data['day_of_week'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'semester' => $data['semester'],
            'school_year' => $data['school_year'],
        ]);

        $schedule = DB::transaction(function () use ($data) {
            return Schedule::query()->create($data);
        });

        return response()->json([
            'message' => 'Schedule created successfully',
            'schedule' => $schedule->load(['course', 'section', 'room', 'faculty'])
        ], Response::HTTP_CREATED);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json($schedule->load(['course', 'section', 'room', 'faculty']));
    }

    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $data = $this->validated($request, partial: true);

        $merged = array_merge($schedule->only([
            'course_id', 'section_id', 'room_id', 'faculty_id',
            'day_of_week', 'start_time', 'end_time', 'semester', 'school_year'
        ]), $data);

        $this->scheduleConflictService->assertNoConflict([
            'room_id' => (int) $merged['room_id'],
            'faculty_id' => (int) $merged['faculty_id'],
            'day_of_week' => (string) $merged['day_of_week'],
            'start_time' => $this->formatTimeForConflict($merged['start_time']),
            'end_time' => $this->formatTimeForConflict($merged['end_time']),
            'semester' => $merged['semester'] ?? $schedule->semester,
            'school_year' => $merged['school_year'] ?? $schedule->school_year,
        ], $schedule->id);

        $schedule->update($data);

        return response()->json([
            'message' => 'Schedule updated successfully',
            'schedule' => $schedule->fresh()->load(['course', 'section', 'room', 'faculty'])
        ]);
    }

    public function destroy(Schedule $schedule): Response
    {
        $schedule->delete();
        return response()->noContent();
    }

    /**
     * Get available time slots for a room
     */
    public function getAvailableTimeSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'semester' => 'nullable|string|in:1st,2nd,Summer',
            'school_year' => 'nullable|integer|digits:4',
        ]);

        $availableSlots = $this->calendarService->getAvailableTimeSlots(
            $validated['room_id'],
            $validated['day_of_week'],
            $validated['semester'] ?? null,
            $validated['school_year'] ?? null
        );

        return response()->json(['available_slots' => $availableSlots]);
    }

    /**
     * Get faculty schedule
     */
    public function getFacultySchedule(int $facultyId): JsonResponse
    {
        $schedules = Schedule::with(['course', 'room', 'section'])
            ->where('faculty_id', $facultyId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
        
        return response()->json([
            'schedules' => $schedules,
            'calendar_events' => $this->calendarService->formatForCalendar($schedules),
        ]);
    }

    /**
     * Get schedule statistics
     */
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'total_schedules' => Schedule::count(),
            'active_schedules' => Schedule::where('status', 'scheduled')->count(),
            'ongoing_schedules' => Schedule::where('status', 'ongoing')->count(),
            'completed_schedules' => Schedule::where('status', 'completed')->count(),
            'cancelled_schedules' => Schedule::where('status', 'cancelled')->count(),
            'total_courses' => Course::count(),
            'total_faculties' => Faculty::count(),
            'total_rooms' => Room::count(),
        ];
        
        return response()->json($stats);
    }

    /**
     * Bulk create schedules
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'schedules' => 'required|array',
            'schedules.*.course_id' => 'required|exists:courses,id',
            'schedules.*.faculty_id' => 'required|exists:faculties,id',
            'schedules.*.room_id' => 'required|exists:rooms,id',
            'schedules.*.section_id' => 'nullable|exists:sections,id',
            'schedules.*.day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
            'semester' => 'required|in:1st,2nd,Summer',
            'school_year' => 'required|digits:4',
        ]);

        $created = [];
        $conflicts = [];

        foreach ($validated['schedules'] as $scheduleData) {
            $scheduleData['semester'] = $validated['semester'];
            $scheduleData['school_year'] = $validated['school_year'];
            $scheduleData['status'] = 'scheduled';

            try {
                $this->scheduleConflictService->assertNoConflict([
                    'room_id' => $scheduleData['room_id'],
                    'faculty_id' => $scheduleData['faculty_id'],
                    'day_of_week' => $scheduleData['day_of_week'],
                    'start_time' => $scheduleData['start_time'],
                    'end_time' => $scheduleData['end_time'],
                    'semester' => $scheduleData['semester'],
                    'school_year' => $scheduleData['school_year'],
                ]);
                
                $created[] = Schedule::create($scheduleData);
            } catch (\Exception $e) {
                $conflicts[] = [
                    'data' => $scheduleData,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => count($created) . ' schedules created, ' . count($conflicts) . ' conflicts detected',
            'created' => $created,
            'conflicts' => $conflicts
        ]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'course_id' => [$partial ? 'sometimes' : 'required', 'exists:courses,id'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'room_id' => [$partial ? 'sometimes' : 'required', 'exists:rooms,id'],
            'faculty_id' => [$partial ? 'sometimes' : 'required', 'exists:faculties,id'],
            'day_of_week' => [$partial ? 'sometimes' : 'required', 'string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'],
            'start_time' => [$partial ? 'sometimes' : 'required', 'date_format:H:i'],
            'end_time' => [$partial ? 'sometimes' : 'required', 'date_format:H:i', 'after:start_time'],
            'semester' => ['sometimes', 'in:1st,2nd,Summer'],
            'school_year' => ['sometimes', 'digits:4'],
            'status' => ['sometimes', 'in:scheduled,ongoing,completed,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        return $request->validate($rules);
    }

    private function formatTimeForConflict(mixed $value): string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('H:i');
        }
        $str = (string) $value;
        return strlen($str) >= 5 ? substr($str, 0, 5) : $str;
    }

    
}