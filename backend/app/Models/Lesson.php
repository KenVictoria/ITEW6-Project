<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    protected $fillable = [
        'syllabus_id',
        'title',
        'week_number',
        'summary',
    ];

    protected function casts(): array
    {
        return [
            'week_number' => 'integer',
        ];
    }

    public function syllabus(): BelongsTo
    {
        return $this->belongsTo(Syllabus::class);
    }
}
