<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        User::query()->updateOrCreate(
            ['email' => 'admin@ccs.edu'],
            [
                'name' => 'System Admin',
                'password' => $password,
                'role' => User::ROLE_ADMIN,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'dean@ccs.edu'],
            [
                'name' => 'Allysa Mendez',
                'password' => $password,
                'role' => User::ROLE_DEAN,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'deptchair@ccs.edu'],
            [
                'name' => 'Christine Delfin',
                'password' => $password,
                'role' => User::ROLE_DEAN,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'secretary@ccs.edu'],
            [
                'name' => 'Dept Secretary',
                'password' => $password,
                'role' => User::ROLE_SECRETARY,
            ]
        );

        Student::query()->updateOrCreate(
            ['student_id' => '2024-BSIT-001'],
            [
                'name' => 'Alex Rivera',
                'email' => 'alex.rivera@student.ccs.edu',
                'password' => $password,
                'affiliations' => ['IEEE', 'Peer Tutor'],
                'skills' => ['Laravel', 'MySQL', 'UI Design'],
                'hobby' => 'Esports',
                'grade_remarks' => 'Dean\'s Lister',
                'violations' => null,
                'department' => 'BSIT',
            ]
        );

        Student::query()->updateOrCreate(
            ['student_id' => '2024-BSCS-002'],
            [
                'name' => 'Jamie Cruz',
                'email' => 'jamie.cruz@student.ccs.edu',
                'password' => $password,
                'affiliations' => ['GDSC'],
                'skills' => ['Python', 'Machine Learning', 'Java'],
                'hobby' => 'Photography',
                'grade_remarks' => 'Good Standing',
                'violations' => null,
                'department' => 'BSCS',
            ]
        );

        $this->call(CourseSeeder::class);
        $this->call(StudentSeeder::class);
    }
}
