<?php
// database/migrations/2026_01_15_000011_add_unique_constraint_to_sections_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate sections
            $table->unique(['course_id', 'name', 'academic_year', 'semester'], 'unique_section_per_course_year_semester');
        });
    }

    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique('unique_section_per_course_year_semester');
        });
    }
};