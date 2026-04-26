<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('curriculum', 64)->default('Curriculum Year 2026')->after('units');
            $table->unsignedTinyInteger('semester')->default(1)->after('curriculum');
            $table->unsignedTinyInteger('year_level')->default(1)->after('semester');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['curriculum', 'semester', 'year_level']);
        });
    }
};
