<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Http\Request;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens;

    public const ROLE_STUDENT = 'student';

    protected $fillable = [
        'name',
        'email',
        'password',
        'student_id',
        'affiliations',
        'skills',
        'hobby',
        'grade_remarks',
        'violations',
        'department',
    ];

    protected function casts(): array
    {
        return [
            'affiliations' => 'array',
            'skills' => 'array',
            'password' => 'hashed',
        ];
    }

    protected $hidden = [
        'password',
    ];

    public function getRoleAttribute(): string
    {
        return self::ROLE_STUDENT;
    }

    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(Section::class, 'section_student')
                    ->withTimestamps();
    }

    public function scopeFiltered(Builder $query, Request $request): Builder
    {
        if ($request->filled('search')) {
            $term = '%'.$request->string('search').'%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('student_id', 'like', $term);
            });
        }

        if ($request->filled('department')) {
            $query->where('department', $request->string('department'));
        }

        if ($request->filled('grade_remarks')) {
            $query->where('grade_remarks', $request->string('grade_remarks'));
        }

        if ($request->filled('skill')) {
            $skill = $request->string('skill');
            $query->whereJsonContains('skills', $skill);
        }

        if ($request->filled('hobby')) {
            $query->where('hobby', 'like', '%'.$request->string('hobby').'%');
        }

        return $query;
    }
}
