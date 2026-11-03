<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // STUDENT PROFILES
        // =============================================
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('school_id');
            $table->string('nis', 20);
            $table->string('nisn', 20)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_place', 100)->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('religion', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('parent_name', 255)->nullable();
            $table->string('parent_phone', 20)->nullable();
            $table->jsonb('extra_data')->nullable()->default('{}');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools');
            $table->unique(['school_id', 'nis']);
            $table->index(['school_id', 'nisn']);
        });

        // =============================================
        // TEACHER PROFILES
        // =============================================
        Schema::create('teachers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('school_id');
            $table->string('nip', 30)->nullable();
            $table->string('nuptk', 20)->nullable();
            $table->string('specialization', 255)->nullable();
            $table->string('education_level', 50)->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('school_id')->references('id')->on('schools');
            $table->index('school_id');
        });

        // =============================================
        // ACADEMIC YEARS & SEMESTERS
        // =============================================
        Schema::create('academic_years', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->string('name', 20);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->unique(['school_id', 'name']);
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('academic_year_id');
            $table->smallInteger('semester_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->foreign('academic_year_id')->references('id')->on('academic_years')->onDelete('cascade');
        });

        // =============================================
        // SUBJECTS
        // =============================================
        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->string('name', 255);
            $table->string('code', 20)->nullable();
            $table->smallInteger('grade_level')->nullable();
            $table->smallInteger('weekly_hours')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->index('school_id');
        });

        // =============================================
        // CLASSROOMS
        // =============================================
        Schema::create('classrooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('academic_year_id');
            $table->uuid('homeroom_teacher_id')->nullable();
            $table->string('name', 50);
            $table->smallInteger('grade_level');
            $table->smallInteger('capacity')->default(36);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('academic_year_id')->references('id')->on('academic_years');
            $table->foreign('homeroom_teacher_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['school_id', 'academic_year_id']);
        });

        // =============================================
        // CLASS MEMBERSHIPS (Student → Classroom)
        // =============================================
        Schema::create('class_memberships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('classroom_id');
            $table->date('enrolled_date');
            $table->date('left_date')->nullable();
            $table->string('status', 20)->default('active'); // active, transferred, graduated, dropped
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->index(['classroom_id', 'status']);
        });

        // =============================================
        // TEACHING ASSIGNMENTS
        // =============================================
        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('teacher_id');
            $table->uuid('classroom_id');
            $table->uuid('subject_id');
            $table->uuid('semester_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('teacher_id')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->foreign('semester_id')->references('id')->on('semesters');
            $table->unique(['teacher_id', 'classroom_id', 'subject_id', 'semester_id']);
        });

        // =============================================
        // SCHEDULES
        // =============================================
        Schema::create('schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('teaching_assignment_id');
            $table->smallInteger('day_of_week'); // 1=Senin ... 7=Minggu
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room', 50)->nullable();
            $table->timestamps();

            $table->foreign('teaching_assignment_id')->references('id')->on('teaching_assignments')->onDelete('cascade');
        });

        // =============================================
        // CALENDAR EVENTS
        // =============================================
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('type', 50)->default('general'); // holiday, exam, activity
            $table->string('color', 20)->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('class_memberships');
        Schema::dropIfExists('classrooms');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('students');
    }
};
