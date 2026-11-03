<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClassroomSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';
    private string $yearId = 'b0000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        $homeroomTeacher = DB::table('users')->where('username', 'guru_mtk')->first();
        $homeroomId = $homeroomTeacher ? $homeroomTeacher->id : null;

        $classes = [
            ['id' => 'c0000000-0000-0000-0000-000000000007', 'name' => 'VII-A', 'grade_level' => 7, 'capacity' => 32, 'homeroom_teacher_id' => $homeroomId],
            ['id' => 'c0000000-0000-0000-0000-000000000072', 'name' => 'VII-B', 'grade_level' => 7, 'capacity' => 32, 'homeroom_teacher_id' => null],
            ['id' => 'c0000000-0000-0000-0000-000000000008', 'name' => 'VIII-A', 'grade_level' => 8, 'capacity' => 32, 'homeroom_teacher_id' => null],
            ['id' => 'c0000000-0000-0000-0000-000000000082', 'name' => 'VIII-B', 'grade_level' => 8, 'capacity' => 32, 'homeroom_teacher_id' => null],
            ['id' => 'c0000000-0000-0000-0000-000000000009', 'name' => 'IX-A', 'grade_level' => 9, 'capacity' => 32, 'homeroom_teacher_id' => null],
            ['id' => 'c0000000-0000-0000-0000-000000000092', 'name' => 'IX-B', 'grade_level' => 9, 'capacity' => 32, 'homeroom_teacher_id' => null],
        ];

        foreach ($classes as $cls) {
            DB::table('classrooms')->updateOrInsert(
                ['school_id' => $this->schoolId, 'name' => $cls['name'], 'academic_year_id' => $this->yearId],
                [
                    'id' => $cls['id'],
                    'grade_level' => $cls['grade_level'],
                    'capacity' => $cls['capacity'],
                    'homeroom_teacher_id' => $cls['homeroom_teacher_id'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
