<?php
// database/migrations/2026_01_15_000005_create_sections_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('academic_year', 9); // e.g., "2024-2025"
            $table->enum('semester', ['1st', '2nd', 'Summer'])->default('1st');
            $table->integer('year_level')->default(1);
            $table->integer('max_capacity')->default(40);
            $table->integer('current_enrolled')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};