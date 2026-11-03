<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // CURRICULUM VERSIONS
        // =============================================
        Schema::create('curriculum_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->string('code', 50);
            $table->smallInteger('effective_year');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // =============================================
        // LEARNING PHASES (Fase Belajar)
        // =============================================
        Schema::create('learning_phases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('curriculum_version_id');
            $table->string('phase_code', 5); // A, B, C, D, E, F
            $table->jsonb('grade_levels')->default('[]'); // e.g., [7, 8, 9]
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('curriculum_version_id')->references('id')->on('curriculum_versions')->onDelete('cascade');
        });

        // =============================================
        // LEARNING OUTCOMES (Capaian Pembelajaran / CP)
        // =============================================
        Schema::create('learning_outcomes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('curriculum_version_id');
            $table->uuid('phase_id');
            $table->uuid('subject_id')->nullable();
            $table->string('code', 20)->nullable();
            $table->text('description');
            $table->string('source', 255)->nullable(); // Sumber resmi (Permendikbud, dst)
            $table->string('source_year', 10)->nullable();
            $table->timestamps();

            $table->foreign('curriculum_version_id')->references('id')->on('curriculum_versions');
            $table->foreign('phase_id')->references('id')->on('learning_phases');
            $table->foreign('subject_id')->references('id')->on('subjects')->nullOnDelete();
            $table->index(['phase_id', 'subject_id']);
        });

        // =============================================
        // LEARNING OBJECTIVES (Tujuan Pembelajaran / TP)
        // =============================================
        Schema::create('learning_objectives', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('learning_outcome_id');
            $table->uuid('school_id');
            $table->uuid('teacher_id')->nullable();
            $table->uuid('semester_id')->nullable();
            $table->string('code', 30)->nullable();
            $table->text('description');
            $table->smallInteger('order_number')->default(1);
            $table->timestamps();

            $table->foreign('learning_outcome_id')->references('id')->on('learning_outcomes');
            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('teacher_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('semester_id')->references('id')->on('semesters')->nullOnDelete();
            $table->index(['school_id', 'semester_id']);
        });

        // =============================================
        // LEARNING SEQUENCES (Alur Tujuan Pembelajaran / ATP)
        // =============================================
        Schema::create('learning_sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('subject_id');
            $table->uuid('semester_id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->jsonb('objective_order')->default('[]'); // Ordered list of learning_objective_ids
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->foreign('semester_id')->references('id')->on('semesters');
        });

        // =============================================
        // LESSON PLANS (RPM / Modul Ajar / LKPD)
        // =============================================
        Schema::create('lesson_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('teacher_id');
            $table->uuid('subject_id');
            $table->uuid('classroom_id')->nullable();
            $table->uuid('semester_id')->nullable();
            $table->string('title', 255);
            $table->string('type', 30)->default('rpm'); // rpm, modul_ajar, lkpd, rubrik, kartu_soal
            $table->integer('duration_minutes')->default(80);
            $table->jsonb('content')->default('{}'); // Full template content
            $table->string('status', 20)->default('draft'); // draft, published, archived
            $table->smallInteger('version')->default(1);
            $table->uuid('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('teacher_id')->references('id')->on('users');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->foreign('classroom_id')->references('id')->on('classrooms')->nullOnDelete();
            $table->foreign('semester_id')->references('id')->on('semesters')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users');
            $table->index(['school_id', 'teacher_id', 'type']);
        });

        // =============================================
        // RUBRICS
        // =============================================
        Schema::create('rubrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('type', 50)->default('analytic'); // analytic, holistic
            $table->jsonb('criteria')->default('[]'); // Array of {name, description, levels: [{score, description}]}
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubrics');
        Schema::dropIfExists('lesson_plans');
        Schema::dropIfExists('learning_sequences');
        Schema::dropIfExists('learning_objectives');
        Schema::dropIfExists('learning_outcomes');
        Schema::dropIfExists('learning_phases');
        Schema::dropIfExists('curriculum_versions');
    }
};
