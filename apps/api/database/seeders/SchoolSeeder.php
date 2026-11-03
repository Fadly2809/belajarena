<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schoolId = 'a0000000-0000-0000-0000-000000000001';

        DB::table('schools')->upsert([
            [
                'id' => $schoolId,
                'name' => 'SMP Negeri 6 Kendari',
                'npsn' => '40403892',
                'institution' => 'Pemerintah Kota Kendari',
                'address' => 'Jalan R.A. Kartini No. 1',
                'city' => 'Kota Kendari',
                'province' => 'Sulawesi Tenggara',
                'postal_code' => '93121',
                'phone' => '0401-3121234',
                'email' => 'smpn6kendari@gmail.com',
                'is_active' => true,
                'settings' => json_encode([
                    'theme_color' => '#1a56db',
                    'academic_year_format' => 'YYYY/YYYY',
                    'grading_scale' => [
                        ['min' => 91, 'max' => 100, 'grade' => 'A', 'predicate' => 'Sangat Baik'],
                        ['min' => 81, 'max' => 90,  'grade' => 'B', 'predicate' => 'Baik'],
                        ['min' => 70, 'max' => 80,  'grade' => 'C', 'predicate' => 'Cukup'],
                        ['min' => 0,  'max' => 69,  'grade' => 'D', 'predicate' => 'Perlu Bimbingan'],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['id'], ['name', 'updated_at']);
    }
}
