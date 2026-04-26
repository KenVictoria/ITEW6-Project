<?php
// app/Models/Section.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Section extends Model
{
    protected $fillable = [
        'course_id',
        'name',
        'academic_year',
        'semester',
        'year_level',
        'max_capacity',
        'current_enrolled',
    ];

    protected $casts = [
        'year_level' => 'integer',
        'max_capacity' => 'integer',
        'current_enrolled' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'section_student')
                    ->withTimestamps();
    }

    // Accessors
    public function getAvailableSlotsAttribute(): int
    {
        return $this->max_capacity - $this->current_enrolled;
    }

    public function getIsFullAttribute(): bool
    {
        return $this->current_enrolled >= $this->max_capacity;
    }
}