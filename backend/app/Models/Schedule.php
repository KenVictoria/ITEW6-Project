<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Schedule extends Model
{
    protected $fillable = [
        'course_id',
        'section_id',
        'room_id',
        'faculty_id',
        'day_of_week',
        'start_time',
        'end_time',
        'semester',
        'school_year',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'school_year' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    // Accessor for display
    public function getTimeSlotAttribute(): string
    {
        $start = $this->start_time instanceof Carbon 
            ? $this->start_time->format('h:i A')
            : date('h:i A', strtotime($this->start_time));
        $end = $this->end_time instanceof Carbon 
            ? $this->end_time->format('h:i A')
            : date('h:i A', strtotime($this->end_time));
        return "{$start} - {$end}";
    }

    // Scope for current semester/year
    public function scopeCurrentAcademicYear($query)
    {
        $currentYear = date('Y');
        return $query->where('school_year', $currentYear);
    }
}