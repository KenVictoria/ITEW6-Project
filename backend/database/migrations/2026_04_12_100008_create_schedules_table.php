<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('faculty_id')->constrained('faculties')->cascadeOnDelete();
            $table->string('day_of_week', 16);
            $table->time('start_time');
            $table->time('end_time');
            
            // Additional fields for scheduling module
            $table->enum('semester', ['1st', '2nd', 'Summer'])->default('1st');
            $table->year('school_year')->nullable();
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            
            $table->timestamps();

            // Indexes for performance
            $table->index(['room_id', 'day_of_week']);
            $table->index(['faculty_id', 'day_of_week']);
            
            // Unique constraints to prevent conflicts at database level
            $table->unique(['room_id', 'day_of_week', 'start_time', 'semester', 'school_year'], 'room_schedule_unique');
            $table->unique(['faculty_id', 'day_of_week', 'start_time', 'semester', 'school_year'], 'faculty_schedule_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};