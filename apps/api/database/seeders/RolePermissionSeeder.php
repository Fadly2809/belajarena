<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RolePermissionSeeder extends Seeder
{
    private string $schoolId = 'a0000000-0000-0000-0000-000000000001';

    public function run(): void
    {
        // =============================================
        // PERMISSIONS
        // =============================================
        $permissions = [
            // Dashboard
            ['module' => 'dashboard', 'name' => 'dashboard.view', 'display_name' => 'Lihat Dashboard'],

            // School
            ['module' => 'school', 'name' => 'school.view',   'display_name' => 'Lihat Data Sekolah'],
            ['module' => 'school', 'name' => 'school.update', 'display_name' => 'Edit Data Sekolah'],

            // Students
            ['module' => 'students', 'name' => 'students.view',   'display_name' => 'Lihat Data Siswa'],
            ['module' => 'students', 'name' => 'students.create', 'display_name' => 'Tambah Siswa'],
            ['module' => 'students', 'name' => 'students.update', 'display_name' => 'Edit Siswa'],
            ['module' => 'students', 'name' => 'students.delete', 'display_name' => 'Hapus Siswa'],
            ['module' => 'students', 'name' => 'students.import', 'display_name' => 'Import Siswa'],
            ['module' => 'students', 'name' => 'students.export', 'display_name' => 'Export Siswa'],

            // Classes
            ['module' => 'classes', 'name' => 'classes.view',   'display_name' => 'Lihat Data Kelas'],
            ['module' => 'classes', 'name' => 'classes.create', 'display_name' => 'Buat Kelas'],
            ['module' => 'classes', 'name' => 'classes.update', 'display_name' => 'Edit Kelas'],

            // Attendance
            ['module' => 'attendance', 'name' => 'attendance.view',   'display_name' => 'Lihat Absensi'],
            ['module' => 'attendance', 'name' => 'attendance.create', 'display_name' => 'Buat Absensi'],
            ['module' => 'attendance', 'name' => 'attendance.correct','display_name' => 'Koreksi Absensi'],
            ['module' => 'attendance', 'name' => 'attendance.report', 'display_name' => 'Laporan Absensi'],

            // Curriculum
            ['module' => 'curriculum', 'name' => 'curriculum.view',   'display_name' => 'Lihat Kurikulum'],
            ['module' => 'curriculum', 'name' => 'curriculum.manage', 'display_name' => 'Kelola Kurikulum'],

            // Lesson Plans
            ['module' => 'lesson_plans', 'name' => 'lesson_plans.view',   'display_name' => 'Lihat Perangkat Ajar'],
            ['module' => 'lesson_plans', 'name' => 'lesson_plans.create', 'display_name' => 'Buat Perangkat Ajar'],
            ['module' => 'lesson_plans', 'name' => 'lesson_plans.update', 'display_name' => 'Edit Perangkat Ajar'],
            ['module' => 'lesson_plans', 'name' => 'lesson_plans.delete', 'display_name' => 'Hapus Perangkat Ajar'],

            // Question Bank
            ['module' => 'questions', 'name' => 'questions.view',   'display_name' => 'Lihat Bank Soal'],
            ['module' => 'questions', 'name' => 'questions.create', 'display_name' => 'Buat Soal'],
            ['module' => 'questions', 'name' => 'questions.update', 'display_name' => 'Edit Soal'],
            ['module' => 'questions', 'name' => 'questions.delete', 'display_name' => 'Hapus Soal'],

            // Assessments
            ['module' => 'assessments', 'name' => 'assessments.view',   'display_name' => 'Lihat Asesmen'],
            ['module' => 'assessments', 'name' => 'assessments.create', 'display_name' => 'Buat Asesmen'],
            ['module' => 'assessments', 'name' => 'assessments.grade',  'display_name' => 'Nilai Asesmen'],
            ['module' => 'assessments', 'name' => 'assessments.report', 'display_name' => 'Laporan Asesmen'],

            // CBT
            ['module' => 'cbt', 'name' => 'cbt.view',       'display_name' => 'Lihat CBT'],
            ['module' => 'cbt', 'name' => 'cbt.create',     'display_name' => 'Buat Ujian CBT'],
            ['module' => 'cbt', 'name' => 'cbt.manage',     'display_name' => 'Kelola Sesi CBT'],
            ['module' => 'cbt', 'name' => 'cbt.grade',      'display_name' => 'Nilai Esai CBT'],
            ['module' => 'cbt', 'name' => 'cbt.take',       'display_name' => 'Ikuti Ujian CBT'],
            ['module' => 'cbt', 'name' => 'cbt.report',     'display_name' => 'Laporan CBT'],

            // Games
            ['module' => 'games', 'name' => 'games.view',    'display_name' => 'Lihat Games'],
            ['module' => 'games', 'name' => 'games.create',  'display_name' => 'Buat Game Session'],
            ['module' => 'games', 'name' => 'games.join',    'display_name' => 'Bergabung Game'],

            // Assignments
            ['module' => 'assignments', 'name' => 'assignments.view',   'display_name' => 'Lihat Tugas'],
            ['module' => 'assignments', 'name' => 'assignments.create', 'display_name' => 'Buat Tugas'],
            ['module' => 'assignments', 'name' => 'assignments.grade',  'display_name' => 'Nilai Tugas'],
            ['module' => 'assignments', 'name' => 'assignments.submit', 'display_name' => 'Kumpul Tugas'],

            // Reports
            ['module' => 'reports', 'name' => 'reports.view',   'display_name' => 'Lihat Laporan'],
            ['module' => 'reports', 'name' => 'reports.export', 'display_name' => 'Export Laporan'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->upsert(
                array_merge($perm, ['id' => Str::uuid()->toString(), 'created_at' => now(), 'updated_at' => now()]),
                ['name'],
                ['display_name', 'updated_at']
            );
        }

        // =============================================
        // ROLES
        // =============================================
        $roles = [
            ['name' => 'superadmin',  'display_name' => 'Super Admin',      'is_system' => true,  'school_id' => null],
            ['name' => 'admin',       'display_name' => 'Admin Sekolah',     'is_system' => true,  'school_id' => $this->schoolId],
            ['name' => 'principal',   'display_name' => 'Kepala Sekolah',    'is_system' => true,  'school_id' => $this->schoolId],
            ['name' => 'teacher',     'display_name' => 'Guru',              'is_system' => true,  'school_id' => $this->schoolId],
            ['name' => 'homeroom',    'display_name' => 'Wali Kelas',        'is_system' => true,  'school_id' => $this->schoolId],
            ['name' => 'student',     'display_name' => 'Siswa',             'is_system' => true,  'school_id' => $this->schoolId],
        ];

        $roleIds = [];
        foreach ($roles as $role) {
            $id = Str::uuid()->toString();
            DB::table('roles')->upsert(
                array_merge($role, ['id' => $id, 'created_at' => now(), 'updated_at' => now()]),
                ['name', 'school_id'],
                ['display_name', 'updated_at']
            );
            $existing = DB::table('roles')->where('name', $role['name'])->first();
            $roleIds[$role['name']] = $existing->id;
        }

        // =============================================
        // ROLE → PERMISSION ASSIGNMENTS
        // =============================================
        $allPermissions = DB::table('permissions')->pluck('id', 'name');

        // Helper to assign permissions to a role
        $assign = function (string $roleName, array $permNames) use ($roleIds, $allPermissions) {
            $roleId = $roleIds[$roleName] ?? null;
            if (! $roleId) return;
            DB::table('role_permissions')->where('role_id', $roleId)->delete();
            foreach ($permNames as $permName) {
                $permId = $allPermissions[$permName] ?? null;
                if ($permId) {
                    DB::table('role_permissions')->insertOrIgnore([
                        'role_id' => $roleId,
                        'permission_id' => $permId,
                    ]);
                }
            }
        };

        // Teacher permissions
        $teacherPerms = [
            'dashboard.view', 'school.view',
            'students.view', 'classes.view',
            'attendance.view', 'attendance.create',
            'curriculum.view',
            'lesson_plans.view', 'lesson_plans.create', 'lesson_plans.update',
            'questions.view', 'questions.create', 'questions.update',
            'assessments.view', 'assessments.create', 'assessments.grade', 'assessments.report',
            'cbt.view', 'cbt.create', 'cbt.manage', 'cbt.grade', 'cbt.report',
            'games.view', 'games.create',
            'assignments.view', 'assignments.create', 'assignments.grade',
            'reports.view', 'reports.export',
        ];

        $assign('teacher', $teacherPerms);
        $assign('homeroom', array_merge($teacherPerms, ['attendance.correct']));

        // Principal permissions
        $assign('principal', array_merge($teacherPerms, [
            'school.update', 'students.export', 'attendance.correct', 'attendance.report',
        ]));

        // Admin permissions (all except student-only)
        $adminPerms = array_keys($allPermissions->toArray());
        $adminPerms = array_filter($adminPerms, fn ($p) => !in_array($p, ['cbt.take', 'games.join', 'assignments.submit']));
        $assign('admin', array_values($adminPerms));

        // Student permissions
        $assign('student', [
            'dashboard.view',
            'cbt.take', 'games.join', 'assignments.submit',
            'reports.view',
        ]);

        // Superadmin gets all permissions (handled in code level)
        $assign('superadmin', array_keys($allPermissions->toArray()));
    }
}
