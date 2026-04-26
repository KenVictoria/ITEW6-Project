<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $curriculum = 'Curriculum Year 2025';
        $department = 'BSIT';

        $courses = [
            // 1st Year - 1st Semester (18 units)
            ['code' => 'CCS101', 'title' => 'Introduction to Computer Programming', 'units' => 3, 'year_level' => 1, 'semester' => 1],
            ['code' => 'CCS102', 'title' => 'Introduction to Web Design', 'units' => 3, 'year_level' => 1, 'semester' => 1],
            ['code' => 'CCS103', 'title' => 'Information Management 1', 'units' => 3, 'year_level' => 1, 'semester' => 1],
            ['code' => 'CCS104', 'title' => 'Information Management 2', 'units' => 3, 'year_level' => 1, 'semester' => 1],
            ['code' => 'MATH101', 'title' => 'Mathematics in the Modern World', 'units' => 3, 'year_level' => 1, 'semester' => 1],
            ['code' => 'COMM101', 'title' => 'Purposive Communication', 'units' => 3, 'year_level' => 1, 'semester' => 1],

            // 1st Year - 2nd Semester (18 units)
            ['code' => 'CCS105', 'title' => 'Computer Programming 2', 'units' => 3, 'year_level' => 1, 'semester' => 2],
            ['code' => 'CCS106', 'title' => 'Discrete Structures 1', 'units' => 3, 'year_level' => 1, 'semester' => 2],
            ['code' => 'CCS107', 'title' => 'Human Computer Interaction 1', 'units' => 3, 'year_level' => 1, 'semester' => 2],
            ['code' => 'CCS108', 'title' => 'Social and Professional Issues', 'units' => 3, 'year_level' => 1, 'semester' => 2],
            ['code' => 'NSTP1', 'title' => 'National Service Training Program 1', 'units' => 3, 'year_level' => 1, 'semester' => 2],
            ['code' => 'PE101', 'title' => 'Physical Education 1', 'units' => 3, 'year_level' => 1, 'semester' => 2],

            // 2nd Year - 1st Semester (18 units)
            ['code' => 'CCS201', 'title' => 'Object-Oriented Programming', 'units' => 3, 'year_level' => 2, 'semester' => 1],
            ['code' => 'CCS202', 'title' => 'Data Structures and Algorithms', 'units' => 3, 'year_level' => 2, 'semester' => 1],
            ['code' => 'CCS203', 'title' => 'Web Systems and Technologies 1', 'units' => 3, 'year_level' => 2, 'semester' => 1],
            ['code' => 'CCS204', 'title' => 'Networking 1', 'units' => 3, 'year_level' => 2, 'semester' => 1],
            ['code' => 'CCS205', 'title' => 'Database Management Systems', 'units' => 3, 'year_level' => 2, 'semester' => 1],
            ['code' => 'RIZAL101', 'title' => 'Life and Works of Rizal', 'units' => 3, 'year_level' => 2, 'semester' => 1],

            // 2nd Year - 2nd Semester (18 units)
            ['code' => 'CCS206', 'title' => 'Web Systems and Technologies 2', 'units' => 3, 'year_level' => 2, 'semester' => 2],
            ['code' => 'CCS207', 'title' => 'Networking 2', 'units' => 3, 'year_level' => 2, 'semester' => 2],
            ['code' => 'CCS208', 'title' => 'Human Computer Interaction 2', 'units' => 3, 'year_level' => 2, 'semester' => 2],
            ['code' => 'CCS209', 'title' => 'Integrative Programming', 'units' => 3, 'year_level' => 2, 'semester' => 2],
            ['code' => 'STAT201', 'title' => 'Statistics and Probability', 'units' => 3, 'year_level' => 2, 'semester' => 2],
            ['code' => 'PE102', 'title' => 'Physical Education 2', 'units' => 3, 'year_level' => 2, 'semester' => 2],

            // 3rd Year - 1st Semester (18 units)
            ['code' => 'CCS301', 'title' => 'Information Assurance and Security 1', 'units' => 3, 'year_level' => 3, 'semester' => 1],
            ['code' => 'CCS302', 'title' => 'Systems Analysis and Design', 'units' => 3, 'year_level' => 3, 'semester' => 1],
            ['code' => 'CCS303', 'title' => 'Mobile Application Development 1', 'units' => 3, 'year_level' => 3, 'semester' => 1],
            ['code' => 'CCS304', 'title' => 'Cloud Computing Fundamentals', 'units' => 3, 'year_level' => 3, 'semester' => 1],
            ['code' => 'CCS305', 'title' => 'Elective 1', 'units' => 3, 'year_level' => 3, 'semester' => 1],
            ['code' => 'CCS306', 'title' => 'Technopreneurship', 'units' => 3, 'year_level' => 3, 'semester' => 1],

            // 3rd Year - 2nd Semester (18 units)
            ['code' => 'CCS307', 'title' => 'Information Assurance and Security 2', 'units' => 3, 'year_level' => 3, 'semester' => 2],
            ['code' => 'CCS308', 'title' => 'Software Engineering 1', 'units' => 3, 'year_level' => 3, 'semester' => 2],
            ['code' => 'CCS309', 'title' => 'Mobile Application Development 2', 'units' => 3, 'year_level' => 3, 'semester' => 2],
            ['code' => 'CCS310', 'title' => 'Data Analytics', 'units' => 3, 'year_level' => 3, 'semester' => 2],
            ['code' => 'CCS311', 'title' => 'Elective 2', 'units' => 3, 'year_level' => 3, 'semester' => 2],
            ['code' => 'CCS312', 'title' => 'Research Methods in IT', 'units' => 3, 'year_level' => 3, 'semester' => 2],

            // 4th Year - 1st Semester (18 units)
            ['code' => 'CCS401', 'title' => 'Capstone Project 1', 'units' => 3, 'year_level' => 4, 'semester' => 1],
            ['code' => 'CCS402', 'title' => 'Software Engineering 2', 'units' => 3, 'year_level' => 4, 'semester' => 1],
            ['code' => 'CCS403', 'title' => 'Advanced Database Systems', 'units' => 3, 'year_level' => 4, 'semester' => 1],
            ['code' => 'CCS404', 'title' => 'Advanced Networking', 'units' => 3, 'year_level' => 4, 'semester' => 1],
            ['code' => 'CCS405', 'title' => 'IT Project Management', 'units' => 3, 'year_level' => 4, 'semester' => 1],
            ['code' => 'CCS406', 'title' => 'Elective 3', 'units' => 3, 'year_level' => 4, 'semester' => 1],

            // 4th Year - 2nd Semester (18 units)
            ['code' => 'CCS407', 'title' => 'Capstone Project 2', 'units' => 3, 'year_level' => 4, 'semester' => 2],
            ['code' => 'CCS408', 'title' => 'Practicum / Internship', 'units' => 6, 'year_level' => 4, 'semester' => 2],
            ['code' => 'CCS409', 'title' => 'Systems Integration and Architecture', 'units' => 3, 'year_level' => 4, 'semester' => 2],
            ['code' => 'CCS410', 'title' => 'Emerging Technologies in IT', 'units' => 3, 'year_level' => 4, 'semester' => 2],
            ['code' => 'CCS411', 'title' => 'Seminar on Current IT Trends', 'units' => 3, 'year_level' => 4, 'semester' => 2],
        ];

        foreach ($courses as $courseData) {
            Course::query()->updateOrCreate(
                ['code' => $courseData['code']],
                [
                    'title' => $courseData['title'],
                    'department' => $department,
                    'units' => $courseData['units'],
                    'curriculum' => $curriculum,
                    'semester' => $courseData['semester'],
                    'year_level' => $courseData['year_level'],
                ]
            );
        }
    }
}
