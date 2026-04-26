<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('section_student')) {
            Schema::create('section_student', function (Blueprint $table) {
                $table->id();
                $table->foreignId('section_id')->constrained()->onDelete('cascade');
                $table->foreignId('student_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->unique(['section_id', 'student_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('section_student');
    }
};