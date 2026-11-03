<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SchoolSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            AcademicYearSeeder::class,
            SubjectSeeder::class,
            ClassroomSeeder::class,
            StudentSeeder::class,
            IcebreakerSeeder::class,
        ]);
    }
}
