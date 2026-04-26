<?php
// app/Services/ScheduleConflictService.php

namespace App\Services;

use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ScheduleConflictService
{
    public function assertNoConflict(array $data, ?int $ignoreScheduleId = null): void
    {
        $data = $this->preprocessTimes($data);

        $validator = Validator::make($data, [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'faculty_id' => ['required', 'integer', 'exists:faculties,id'],
            'day_of_week' => ['required', 'string', 'max:16'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'semester' => ['sometimes', 'string', 'in:1st,2nd,Summer'],
            'school_year' => ['sometimes', 'integer', 'digits:4'],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $roomId = (int) $data['room_id'];
        $facultyId = (int) $data['faculty_id'];
        $day = (string) $data['day_of_week'];
        $start = $this->normalizeTime((string) $data['start_time']);
        $end = $this->normalizeTime((string) $data['end_time']);
        $semester = $data['semester'] ?? null;
        $schoolYear = $data['school_year'] ?? null;

        if ($this->toComparable($start)->gte($this->toComparable($end))) {
            throw ValidationException::withMessages([
                'end_time' => ['End time must be after start time.'],
            ]);
        }

        $query = Schedule::query()
            ->where('day_of_week', $day)
            ->where(function ($q) use ($roomId, $facultyId) {
                $q->where('room_id', $roomId)
                    ->orWhere('faculty_id', $facultyId);
            });

        if ($semester) {
            $query->where('semester', $semester);
        }
        if ($schoolYear) {
            $query->where('school_year', $schoolYear);
        }

        if ($ignoreScheduleId !== null) {
            $query->where('id', '!=', $ignoreScheduleId);
        }

        $conflicts = [];
        
        foreach ($query->cursor() as $existing) {
            if ($this->intervalsOverlap($start, $end, $existing->start_time, $existing->end_time)) {
                $conflictType = $existing->room_id == $roomId ? 'room' : 'faculty';
                $conflicts[] = [
                    'type' => $conflictType,
                    'message' => $conflictType === 'room' 
                        ? "Room {$existing->room->room_code} is already booked on {$existing->day_of_week} from {$existing->time_slot}"
                        : "Faculty {$existing->faculty->name} is already assigned on {$existing->day_of_week} from {$existing->time_slot}"
                ];
            }
        }

        if (!empty($conflicts)) {
            throw ValidationException::withMessages([
                'schedule' => $conflicts
            ]);
        }
    }

    public function intervalsOverlap(string $startA, string $endA, mixed $startB, mixed $endB): bool
    {
        $sb = $this->normalizeFromModel($startB);
        $eb = $this->normalizeFromModel($endB);

        $a1 = $this->toComparable($startA);
        $a2 = $this->toComparable($endA);
        $b1 = $this->toComparable($sb);
        $b2 = $this->toComparable($eb);

        return $a1->lt($b2) && $b1->lt($a2);
    }

    private function preprocessTimes(array $data): array
    {
        foreach (['start_time', 'end_time'] as $key) {
            if (!isset($data[$key]) || !is_string($data[$key])) {
                continue;
            }
            $raw = trim($data[$key]);
            if (strlen($raw) >= 8 && str_contains($raw, ':')) {
                $raw = substr($raw, 0, 5);
            }
            $data[$key] = $raw;
        }
        return $data;
    }

    private function normalizeTime(string $time): string
    {
        return Carbon::createFromFormat('H:i', strlen($time) > 5 ? substr($time, 0, 5) : $time)->format('H:i:s');
    }

    private function normalizeFromModel(mixed $value): string
    {
        if ($value instanceof Carbon) {
            return $value->format('H:i:s');
        }
        if (is_string($value)) {
            return strlen($value) === 5 ? $value . ':00' : $value;
        }
        return (string) $value;
    }

    private function toComparable(string $hms): Carbon
    {
        return Carbon::parse('2000-01-01 ' . $hms);
    }
}