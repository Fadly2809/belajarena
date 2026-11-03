<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AcademicYearSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        $yearId = 'b0000000-0000-0000-0000-000000000001';

        DB::table('academic_years')->updateOrInsert(
            ['school_id' => $this->schoolId, 'name' => '2024/2025'],
            [
                'id' => $yearId,
                'start_date' => '2024-07-15',
                'end_date' => '2025-06-20',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Semesters
        DB::table('semesters')->updateOrInsert(
            ['academic_year_id' => $yearId, 'semester_number' => 1],
            [
                'id' => Str::uuid()->toString(),
                'start_date' => '2024-07-15',
                'end_date' => '2024-12-20',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('semesters')->updateOrInsert(
            ['academic_year_id' => $yearId, 'semester_number' => 2],
            [
                'id' => Str::uuid()->toString(),
                'start_date' => '2025-01-06',
                'end_date' => '2025-06-20',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
