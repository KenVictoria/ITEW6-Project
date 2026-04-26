<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH');
        
        // Skills arrays
        $allSkills = [
            'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
            'React', 'Angular', 'Vue.js', 'Node.js', 'Laravel', 'Django', 'Flask', 'Spring Boot',
            'HTML5', 'CSS3', 'SASS', 'Tailwind CSS', 'Bootstrap', 'jQuery',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Elasticsearch',
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub Actions',
            'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
            'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
            'Cybersecurity', 'Network Security', 'Ethical Hacking', 'Penetration Testing',
            'Mobile Development', 'Flutter', 'React Native', 'iOS', 'Android',
            'Game Development', 'Unity', 'Unreal Engine', 'Blender',
            'DevOps', 'System Administration', 'Linux', 'Bash Scripting',
            'Project Management', 'Agile', 'Scrum', 'JIRA', 'Trello'
        ];
        
        // Affiliations arrays
        $allAffiliations = [
            'Google Developer Student Clubs (GDSC)', 'IEEE', 'ACM', 'Computer Science Society',
            'IT Society', 'Peer Tutor', 'Student Council', 'Coding Club', 'Robotics Club',
            'Esports Club', 'Chess Club', 'Math Club', 'English Club', 'Art Club',
            'Music Club', 'Dance Troupe', 'Theater Guild', 'Photography Club',
            'Volunteer Corps', 'Red Cross Youth', 'Environmental Society', 'Entrepreneurship Club',
            'AI Club', 'Cybersecurity Club', 'Open Source Community', 'Hackathon Organizer'
        ];
        
        // Hobbies arrays
        $allHobbies = [
            'Basketball', 'Volleyball', 'Badminton', 'Swimming', 'Running', 'Cycling',
            'Chess', 'Board Games', 'Video Games', 'Esports', 'Coding', 'Reading',
            'Writing', 'Drawing', 'Painting', 'Photography', 'Videography', 'Content Creation',
            'Singing', 'Playing Instruments', 'Dancing', 'Acting', 'Cooking', 'Baking',
            'Traveling', 'Hiking', 'Camping', 'Gardening', 'Meditation', 'Yoga',
            'Collecting', 'Model Building', 'Origami', 'Calligraphy', 'Pottery'
        ];
        
        // Grade remarks with weighted distribution
        $gradeRemarks = [
            'Excellent' => 10,
            'Very Good' => 20,
            'Good' => 35,
            'Satisfactory' => 20,
            'Poor' => 10,
            'Failed' => 5,
        ];
        
        $departments = ['BSIT', 'BSCS'];
        
        $this->command->info('Starting to seed 1000 students...');
        
        $students = [];
        $batchSize = 100;
        $existingStudentIds = Student::pluck('student_id')->toArray();
        
        for ($i = 1; $i <= 1000; $i++) {
            // Generate random skills (2-6 skills)
            $numSkills = rand(2, 6);
            $skills = $faker->randomElements($allSkills, $numSkills);
            
            // Generate random affiliations (0-4 affiliations)
            $numAffiliations = rand(0, 4);
            $affiliations = $numAffiliations > 0 ? $faker->randomElements($allAffiliations, $numAffiliations) : [];
            
            // Generate random hobby
            $hobby = $faker->randomElement($allHobbies);
            
            // Generate grade remark based on weighted distribution
            $gradeRemark = $this->getWeightedRandom($gradeRemarks);
            
            // Generate violations (null for most students, text for some)
            $violations = null;
            if (rand(1, 100) <= 15) { // 15% have violations
                $violations = $this->getViolationDescription($faker);
            }
            
            // Generate unique student ID
            do {
                $year = rand(2020, 2024);
                $department = $faker->randomElement($departments);
                $studentNumber = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $studentId = "{$year}-{$department}-{$studentNumber}";
            } while (in_array($studentId, $existingStudentIds));
            
            $existingStudentIds[] = $studentId;
            
            // Generate unique email
            $firstName = strtolower($faker->firstName());
            $lastName = strtolower($faker->lastName());
            $email = "{$firstName}.{$lastName}@student.ccs.edu";
            
            // Make email unique by adding number if duplicate
            $originalEmail = $email;
            $counter = 1;
            while (Student::where('email', $email)->exists()) {
                $email = str_replace('@', "{$counter}@", $originalEmail);
                $counter++;
            }
            
            // Generate name
            $name = $faker->name();
            
            $students[] = [
                'student_id' => $studentId,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'affiliations' => json_encode($affiliations),
                'skills' => json_encode($skills),
                'hobby' => $hobby,
                'grade_remarks' => $gradeRemark,
                'violations' => $violations,
                'department' => $department,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Insert in batches
            if ($i % $batchSize === 0) {
                Student::insert($students);
                $students = [];
                $this->command->info("Seeded {$i} students...");
            }
        }
        
        // Insert remaining students
        if (!empty($students)) {
            Student::insert($students);
        }
        
        $this->command->info('Successfully seeded 1000 students!');
    }
    
    /**
     * Get weighted random selection
     */
    private function getWeightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = rand(1, $total);
        
        foreach ($weights as $item => $weight) {
            if ($random <= $weight) {
                return $item;
            }
            $random -= $weight;
        }
        
        return array_key_first($weights);
    }
    
    /**
     * Get violation description
     */
    private function getViolationDescription($faker): string
    {
        $violations = [
            'Late submission of requirements',
            'Unauthorized absence',
            'Disruptive behavior in class',
            'Plagiarism on assignment',
            'Using phone during class',
            'Incomplete requirements',
            'Cheating on quiz',
            'Failure to wear proper uniform',
            'Late arrival to class (3x)',
            'Disrespectful behavior',
        ];
        
        $numViolations = rand(1, 3);
        $selectedViolations = $faker->randomElements($violations, $numViolations);
        
        return implode('; ', $selectedViolations);
    }
}