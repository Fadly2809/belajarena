<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Administrator',
                'email' => 'superadmin@agd.local',
                'username' => 'superadmin',
                'password' => Hash::make('superadmin123'),
                'role' => 'superadmin',
            ],
            [
                'name' => 'Admin Sekolah',
                'email' => 'admin@smpn6kendari.sch.id',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
            [
                'name' => 'Kepala Sekolah',
                'email' => 'kepsek@smpn6kendari.sch.id',
                'username' => 'kepsek',
                'password' => Hash::make('kepsek123'),
                'role' => 'principal',
            ],
            [
                'name' => 'Bapak Guru Informatika',
                'email' => 'guru.informatika@smpn6kendari.sch.id',
                'username' => 'guru_info',
                'password' => Hash::make('guru123'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Ibu Guru Matematika',
                'email' => 'guru.matematika@smpn6kendari.sch.id',
                'username' => 'guru_mtk',
                'password' => Hash::make('guru123'),
                'role' => 'homeroom',
            ],
            [
                'name' => 'Siswa Demo',
                'email' => 'siswa01@smpn6kendari.sch.id',
                'username' => 'siswa01',
                'password' => Hash::make('siswa123'),
                'role' => 'student',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $userId = Str::uuid()->toString();
            $existingUser = DB::table('users')
                ->where('username', $userData['username'])
                ->first();

            if (! $existingUser) {
                DB::table('users')->insert(array_merge($userData, [
                    'id' => $userId,
                    'school_id' => $this->schoolId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            } else {
                $userId = $existingUser->id;
            }

            // Assign role
            $roleRecord = DB::table('roles')->where('name', $role)->first();
            if ($roleRecord) {
                DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $userId, 'role_id' => $roleRecord->id, 'school_id' => $this->schoolId],
                    ['id' => Str::uuid()->toString(), 'assigned_at' => now(), 'created_at' => now(), 'updated_at' => now()]
                );
            }

            // Create student profile for student role
            if ($role === 'student') {
                DB::table('students')->updateOrInsert(
                    ['user_id' => $userId],
                    [
                        'id' => Str::uuid()->toString(),
                        'user_id' => $userId,
                        'school_id' => $this->schoolId,
                        'nis' => '20240001',
                        'gender' => 'L',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        $this->command->info('✓ Users seeded with roles:');
        $this->command->table(
            ['Username', 'Password', 'Role'],
            [
                ['superadmin', 'superadmin123', 'Super Admin'],
                ['admin', 'admin123', 'Admin Sekolah'],
                ['kepsek', 'kepsek123', 'Kepala Sekolah'],
                ['guru_info', 'guru123', 'Guru Informatika'],
                ['guru_mtk', 'guru123', 'Wali Kelas / Guru Matematika'],
                ['siswa01', 'siswa123', 'Siswa'],
            ]
        );
    }
}
