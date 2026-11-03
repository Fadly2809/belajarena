<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubjectSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        $subjects = [
            // Kelas 7-9 (SMP)
            ['name' => 'Pendidikan Agama dan Budi Pekerti', 'code' => 'PAI',    'grade_level' => null, 'weekly_hours' => 3],
            ['name' => 'Pendidikan Pancasila',              'code' => 'PPKN',   'grade_level' => null, 'weekly_hours' => 2],
            ['name' => 'Bahasa Indonesia',                  'code' => 'BIND',   'grade_level' => null, 'weekly_hours' => 6],
            ['name' => 'Matematika',                        'code' => 'MTK',    'grade_level' => null, 'weekly_hours' => 5],
            ['name' => 'Ilmu Pengetahuan Alam',             'code' => 'IPA',    'grade_level' => null, 'weekly_hours' => 5],
            ['name' => 'Ilmu Pengetahuan Sosial',           'code' => 'IPS',    'grade_level' => null, 'weekly_hours' => 4],
            ['name' => 'Bahasa Inggris',                    'code' => 'BING',   'grade_level' => null, 'weekly_hours' => 4],
            ['name' => 'Seni dan Budaya',                   'code' => 'SENBUD', 'grade_level' => null, 'weekly_hours' => 2],
            ['name' => 'Pendidikan Jasmani Olahraga Kesehatan', 'code' => 'PJOK', 'grade_level' => null, 'weekly_hours' => 3],
            ['name' => 'Informatika',                       'code' => 'INFO',   'grade_level' => null, 'weekly_hours' => 2],
            // Muatan Lokal
            ['name' => 'Bahasa Daerah',                     'code' => 'BDDAE',  'grade_level' => null, 'weekly_hours' => 2],
            ['name' => 'Bimbingan Konseling',               'code' => 'BK',     'grade_level' => null, 'weekly_hours' => 1],
        ];

        foreach ($subjects as $subject) {
            DB::table('subjects')->upsert(
                array_merge($subject, [
                    'id' => Str::uuid()->toString(),
                    'school_id' => $this->schoolId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
                ['school_id', 'code'],
                ['name', 'weekly_hours', 'updated_at']
            );
        }

        $this->command->info('✓ ' . count($subjects) . ' subjects seeded.');
    }
}
