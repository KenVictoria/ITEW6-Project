<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('student_id')->unique();
            $table->json('affiliations')->nullable();
            $table->json('skills')->nullable();
            $table->string('hobby')->nullable();
            $table->string('grade_remarks')->nullable();
            $table->text('violations')->nullable();
            $table->string('department', 16)->default('BSIT');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
