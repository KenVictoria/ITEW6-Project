<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'venue',
        'department',
        'event_type',
        'event_date',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
        ];
    }
}
