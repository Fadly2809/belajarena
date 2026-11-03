<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';
    private string $class7AId = 'c0000000-0000-0000-0000-000000000007';

    public function run(): void
    {
        $studentRole = DB::table('roles')->where('name', 'student')->first();
        $studentRoleId = $studentRole ? $studentRole->id : null;

        $students = [
            ['name' => 'Ahmad Fadhil Prasetyo', 'nis' => '20240001', 'nisn' => '0091827361', 'gender' => 'L', 'username' => 'siswa01'],
            ['name' => 'Aisyah Putri Rahmadani', 'nis' => '20240002', 'nisn' => '0091827362', 'gender' => 'P', 'username' => 'siswa02'],
            ['name' => 'Bintang Pratama Wijaya', 'nis' => '20240003', 'nisn' => '0091827363', 'gender' => 'L', 'username' => 'siswa03'],
            ['name' => 'Citra Lestari Dewi', 'nis' => '20240004', 'nisn' => '0091827364', 'gender' => 'P', 'username' => 'siswa04'],
            ['name' => 'Dimas Arya Nugraha', 'nis' => '20240005', 'nisn' => '0091827365', 'gender' => 'L', 'username' => 'siswa05'],
            ['name' => 'Farhan Alamsyah', 'nis' => '20240006', 'nisn' => '0091827366', 'gender' => 'L', 'username' => 'siswa06'],
            ['name' => 'Gita Maharani', 'nis' => '20240007', 'nisn' => '0091827367', 'gender' => 'P', 'username' => 'siswa07'],
            ['name' => 'Hafizh Nur Ramadan', 'nis' => '20240008', 'nisn' => '0091827368', 'gender' => 'L', 'username' => 'siswa08'],
            ['name' => 'Indah Permata Sari', 'nis' => '20240009', 'nisn' => '0091827369', 'gender' => 'P', 'username' => 'siswa09'],
            ['name' => 'Joko Tri Wahyudi', 'nis' => '20240010', 'nisn' => '0091827370', 'gender' => 'L', 'username' => 'siswa10'],
        ];

        foreach ($students as $st) {
            $user = DB::table('users')->where('username', $st['username'])->first();
            $userId = $user ? $user->id : Str::uuid()->toString();

            if (!$user) {
                DB::table('users')->insert([
                    'id' => $userId,
                    'school_id' => $this->schoolId,
                    'name' => $st['name'],
                    'email' => $st['username'] . '@smpn6kendari.sch.id',
                    'username' => $st['username'],
                    'password' => Hash::make('siswa123'),
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($studentRoleId) {
                    DB::table('user_roles')->insert([
                        'id' => Str::uuid()->toString(),
                        'user_id' => $userId,
                        'role_id' => $studentRoleId,
                        'school_id' => $this->schoolId,
                        'assigned_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $student = DB::table('students')->where('nis', $st['nis'])->first();
            $studentId = $student ? $student->id : Str::uuid()->toString();

            DB::table('students')->updateOrInsert(
                ['nis' => $st['nis'], 'school_id' => $this->schoolId],
                [
                    'id' => $studentId,
                    'user_id' => $userId,
                    'nisn' => $st['nisn'],
                    'gender' => $st['gender'],
                    'birth_place' => 'Kendari',
                    'birth_date' => '2011-05-15',
                    'religion' => 'Islam',
                    'address' => 'Jl. Abunawas No. 12, Kendari',
                    'parent_name' => 'Orang Tua ' . $st['name'],
                    'parent_phone' => '081234567890',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Enroll into Class VII-A
            DB::table('class_memberships')->updateOrInsert(
                ['student_id' => $studentId, 'classroom_id' => $this->class7AId],
                [
                    'id' => Str::uuid()->toString(),
                    'enrolled_date' => '2024-07-15',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
