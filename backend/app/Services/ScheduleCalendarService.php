<?php
// app/Services/ScheduleCalendarService.php

namespace App\Services;

use App\Models\Schedule;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class ScheduleCalendarService
{
    /**
     * Format schedules for FullCalendar integration
     * Shows schedules on their specific days for each month
     */
    public function formatForCalendar(Collection $schedules): array
    {
        $events = [];
        
        foreach ($schedules as $schedule) {
            // Get all dates for this schedule across multiple months
            $dates = $this->getScheduleDates($schedule);
            
            foreach ($dates as $date) {
                $events[] = [
                    'id' => $schedule->id,
                    'title' => $this->getEventTitle($schedule),
                    'start' => $date->format('Y-m-d') . 'T' . $this->formatTime($schedule->start_time),
                    'end' => $date->format('Y-m-d') . 'T' . $this->formatTime($schedule->end_time),
                    'backgroundColor' => $this->getEventColor($schedule->status),
                    'borderColor' => $this->getEventColor($schedule->status),
                    'textColor' => '#ffffff',
                    'extendedProps' => [
                        'id' => $schedule->id,
                        // Fixed: Use correct field names from Course model
                        'course_code' => $schedule->course->code ?? 'N/A',
                        'course_name' => $schedule->course->title ?? 'N/A',
                        'faculty_name' => $schedule->faculty->name ?? 'N/A',
                        // Fixed: Use correct field name from Room model
                        'room_code' => $schedule->room->code ?? 'N/A',
                        'room_name' => $schedule->room->name ?? 'N/A',
                        'section_name' => $schedule->section?->section_name ?? 'N/A',
                        'status' => $schedule->status ?? 'scheduled',
                        'semester' => $schedule->semester ?? 'N/A',
                        'school_year' => $schedule->school_year ?? 'N/A',
                        'notes' => $schedule->notes ?? '',
                        'day_of_week' => $schedule->day_of_week ?? 'N/A',
                        'time_slot' => $schedule->time_slot ?? 'N/A',
                        'start_time' => $this->formatTime($schedule->start_time),
                        'end_time' => $this->formatTime($schedule->end_time),
                    ],
                    'allDay' => false,
                ];
            }
        }
        
        return $events;
    }

    /**
     * Get all dates for a schedule based on its day_of_week
     * Shows schedules for the current year (past 3 months and future 9 months)
     */
    private function getScheduleDates(Schedule $schedule, int $monthsRange = 12): array
    {
        $dates = [];
        $targetDayOfWeek = $this->mapDayToNumber($schedule->day_of_week);
        
        // Show schedules from 3 months ago to 9 months ahead (total 12 months range)
        $startDate = Carbon::now()->subMonths(3)->startOfMonth();
        $endDate = Carbon::now()->addMonths(9)->endOfMonth();
        
        // Iterate through each month in the range
        $currentDate = $startDate->copy()->startOfMonth();
        
        while ($currentDate <= $endDate) {
            // Get the first occurrence of the target day in this month
            $monthStart = $currentDate->copy();
            $monthEnd = $currentDate->copy()->endOfMonth();
            
            // Find all dates in this month that match the day of week
            $checkDate = $monthStart->copy();
            while ($checkDate <= $monthEnd) {
                if ($checkDate->dayOfWeekIso === $targetDayOfWeek) {
                    $dates[] = $checkDate->copy();
                }
                $checkDate->addDay();
            }
            
            $currentDate->addMonth();
        }
        
        return $dates;
    }

    /**
     * Map day name to ISO day number (1 = Monday, 7 = Sunday)
     */
    private function mapDayToNumber(string $day): int
    {
        $days = [
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6,
            'Sunday' => 7,
        ];
        
        return $days[$day] ?? 1;
    }

    /**
     * Format time consistently
     */
    private function formatTime($time): string
    {
        if ($time instanceof Carbon) {
            return $time->format('H:i:s');
        }
        return date('H:i:s', strtotime($time));
    }

    /**
     * Get available time slots for a room on a specific day
     */
    public function getAvailableTimeSlots(int $roomId, string $dayOfWeek, ?string $semester = null, ?int $schoolYear = null): array
    {
        $query = Schedule::where('room_id', $roomId)
            ->where('day_of_week', $dayOfWeek);
        
        if ($semester) {
            $query->where('semester', $semester);
        }
        if ($schoolYear) {
            $query->where('school_year', $schoolYear);
        }
        
        $bookedSlots = $query->get(['start_time', 'end_time']);
        
        $availableSlots = [];
        $timeSlots = [
            ['08:00', '09:00'], ['09:00', '10:00'], ['10:00', '11:00'],
            ['11:00', '12:00'], ['13:00', '14:00'], ['14:00', '15:00'],
            ['15:00', '16:00'], ['16:00', '17:00'], ['17:00', '18:00'],
            ['18:00', '19:00'], ['19:00', '20:00']
        ];
        
        foreach ($timeSlots as $slot) {
            $isAvailable = true;
            foreach ($bookedSlots as $booked) {
                $bookedStart = $this->formatTime($booked->start_time);
                $bookedEnd = $this->formatTime($booked->end_time);
                    
                if (!($slot[1] . ':00' <= $bookedStart || $slot[0] . ':00' >= $bookedEnd)) {
                    $isAvailable = false;
                    break;
                }
            }
            if ($isAvailable) {
                $availableSlots[] = [
                    'start' => $slot[0], 
                    'end' => $slot[1], 
                    'label' => date('g:i A', strtotime($slot[0])) . ' - ' . date('g:i A', strtotime($slot[1]))
                ];
            }
        }
        
        return $availableSlots;
    }

    private function getEventTitle(Schedule $schedule): string
    {
        // Fixed: Use correct field names
        $courseCode = $schedule->course->code ?? 'N/A';
        $facultyName = explode(' ', $schedule->faculty->name ?? 'Unknown')[0];
        $roomCode = $schedule->room->code ?? 'N/A';
        
        return "{$courseCode} - {$facultyName} ({$roomCode})";
    }

    private function getEventColor(string $status): string
    {
        return match($status) {
            'scheduled' => '#FF6B00',  // Orange
            'ongoing' => '#10B981',    // Green
            'completed' => '#6B7280',  // Gray
            'cancelled' => '#EF4444',  // Red
            default => '#FF6B00',
        };
    }
}