<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentReportController extends Controller
{
    public function meta(): JsonResponse
    {
        $skills = Student::query()
            ->whereNotNull('skills')
            ->pluck('skills')
            ->flatten()
            ->filter()
            ->unique()
            ->sort()
            ->values();

        $remarks = Student::query()
            ->whereNotNull('grade_remarks')
            ->where('grade_remarks', '!=', '')
            ->distinct()
            ->orderBy('grade_remarks')
            ->pluck('grade_remarks')
            ->values();

        $departments = Student::query()
            ->distinct()
            ->orderBy('department')
            ->pluck('department')
            ->values();

        return response()->json([
            'skills' => $skills,
            'grade_remarks' => $remarks,
            'departments' => $departments,
        ]);
    }

    public function pdf(Request $request): Response
    {
        $students = Student::query()
            ->filtered($request)
            ->orderBy('name')
            ->get();

        $pdf = Pdf::loadView('reports.students_pdf', [
            'students' => $students,
            'generatedAt' => now()->toDateTimeString(),
        ])->setPaper('a4', 'landscape');

        $filename = 'ccs-student-report-'.now()->format('Y-m-d_His').'.pdf';

        return $pdf->download($filename);
    }
}
