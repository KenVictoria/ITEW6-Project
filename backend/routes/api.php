<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentReportController;
use App\Http\Controllers\Api\SyllabusController;
use App\Http\Controllers\Api\UserController; 
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/student/account', [AuthController::class, 'updateStudentAccount'])->middleware('role:student');

    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('users/role-options', [UserController::class, 'roleOptions']);
    });

    // Rooms - accessible by admin, dean, secretary
    Route::middleware(['role:admin,dean,secretary'])->group(function () {
        Route::apiResource('rooms', RoomController::class);
    });

    // Students - accessible by admin, dean, secretary (read-only)
    Route::middleware(['role:admin,dean,secretary'])->group(function () {
        Route::get('students/filter-options', [StudentController::class, 'filterOptions']);
        Route::get('students', [StudentController::class, 'index']);
        Route::get('students/{student}', [StudentController::class, 'show']);
    });

    // Sections - accessible by admin, dean, secretary (REMOVED DUPLICATE)
    Route::middleware(['role:admin,dean,secretary'])->group(function () {
        Route::apiResource('sections', SectionController::class);
        Route::get('sections/{section}/available-students', [SectionController::class, 'getAvailableStudents']);
        Route::post('sections/{section}/add-students', [SectionController::class, 'addStudents']);
        Route::delete('sections/{section}/students/{student}', [SectionController::class, 'removeStudent']);
        Route::get('sections/filter-options', [SectionController::class, 'filterOptions']);
    });

    // Students - write operations only for secretary
    Route::middleware(['role:secretary'])->group(function () {
        Route::post('students', [StudentController::class, 'store']);
        Route::put('students/{student}', [StudentController::class, 'update']);
        Route::patch('students/{student}', [StudentController::class, 'update']);
        Route::delete('students/{student}', [StudentController::class, 'destroy']);
    });

    // Courses - read access for admin, dean, secretary
    Route::middleware(['role:admin,dean,secretary'])->group(function () {
        Route::get('courses', [CourseController::class, 'index']);
        Route::get('courses/{course}', [CourseController::class, 'show']);
    });

    // Admin and Dean only routes
    Route::middleware(['role:admin,dean'])->group(function () {
        Route::apiResource('faculties', FacultyController::class);
        Route::post('courses', [CourseController::class, 'store']);
        Route::put('courses/{course}', [CourseController::class, 'update']);
        Route::patch('courses/{course}', [CourseController::class, 'update']);
        Route::delete('courses/{course}', [CourseController::class, 'destroy']);
        Route::apiResource('syllabi', SyllabusController::class);
        Route::apiResource('lessons', LessonController::class);
        Route::apiResource('schedules', ScheduleController::class);
        Route::get('schedules/available-time-slots', [ScheduleController::class, 'getAvailableTimeSlots']);
        Route::get('schedules/faculty/{facultyId}', [ScheduleController::class, 'getFacultySchedule']);
        Route::get('schedules/statistics', [ScheduleController::class, 'getStatistics']);
        Route::post('schedules/bulk', [ScheduleController::class, 'bulkStore']);

        Route::get('/reports/students/meta', [StudentReportController::class, 'meta']);
        Route::get('/reports/students/pdf', [StudentReportController::class, 'pdf']);
    });

    Route::middleware(['role:admin,dean,secretary,student'])->group(function () {
        Route::get('events', [EventController::class, 'index']);
        Route::get('events/{event}', [EventController::class, 'show']);
    });

    Route::middleware(['role:admin,dean,secretary'])->group(function () {
        Route::post('events', [EventController::class, 'store']);
        Route::put('events/{event}', [EventController::class, 'update']);
        Route::patch('events/{event}', [EventController::class, 'update']);
        Route::delete('events/{event}', [EventController::class, 'destroy']);
    });
});