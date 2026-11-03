<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // QUESTIONS (Bank Soal)
        // =============================================
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->uuid('subject_id');
            $table->string('title', 500)->nullable();
            $table->string('type', 30); // multiple_choice, true_false, essay, short_answer, fill_blank, matching, sequence
            $table->text('content'); // Question text (may contain HTML)
            $table->text('stimulus')->nullable(); // Wacana/gambar stimulus
            $table->string('difficulty', 20)->default('medium'); // easy, medium, hard
            $table->text('explanation')->nullable(); // Pembahasan
            $table->decimal('points', 5, 2)->default(1.00);
            $table->string('status', 20)->default('draft'); // draft, reviewed, published, archived
            $table->jsonb('tags')->default('[]');
            $table->jsonb('metadata')->default('{}'); // Extra data per question type
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->index(['school_id', 'subject_id', 'type', 'status']);
        });

        // =============================================
        // QUESTION OPTIONS (Pilihan Jawaban)
        // =============================================
        Schema::create('question_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('question_id');
            $table->string('label', 5); // A, B, C, D
            $table->text('content');
            $table->boolean('is_correct')->default(false);
            $table->smallInteger('order_number')->default(0);
            $table->timestamps();

            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
            $table->index(['question_id', 'order_number']);
        });

        // =============================================
        // QUESTION → LEARNING OBJECTIVES (pivot)
        // =============================================
        Schema::create('question_objectives', function (Blueprint $table) {
            $table->uuid('question_id');
            $table->uuid('learning_objective_id');
            $table->primary(['question_id', 'learning_objective_id']);

            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
            $table->foreign('learning_objective_id')->references('id')->on('learning_objectives')->onDelete('cascade');
        });

        // =============================================
        // ASSESSMENTS (Asesmen)
        // =============================================
        Schema::create('assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->uuid('classroom_id');
            $table->uuid('subject_id');
            $table->uuid('semester_id')->nullable();
            $table->string('title', 255);
            $table->string('type', 30)->default('formative'); // diagnostic, formative, summative, practice, project, portfolio, observation
            $table->date('scheduled_date')->nullable();
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->decimal('max_score', 6, 2)->default(100);
            $table->decimal('passing_score', 6, 2)->default(70);
            $table->jsonb('grading_config')->default('{}'); // Bobot, formula, dll
            $table->string('status', 20)->default('draft'); // draft, active, completed, archived
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->foreign('semester_id')->references('id')->on('semesters')->nullOnDelete();
            $table->index(['school_id', 'classroom_id', 'subject_id']);
        });

        // =============================================
        // ASSESSMENT RESULTS (Hasil Asesmen)
        // =============================================
        Schema::create('assessment_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('assessment_id');
            $table->uuid('student_id');
            $table->decimal('raw_score', 6, 2)->nullable();
            $table->decimal('final_score', 6, 2)->nullable();
            $table->text('notes')->nullable();
            $table->text('feedback')->nullable();
            $table->uuid('graded_by')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->jsonb('detail_scores')->default('{}'); // Per-objective breakdown
            $table->timestamps();

            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->foreign('graded_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['assessment_id', 'student_id']);
        });

        // =============================================
        // REMEDIATION & ENRICHMENT
        // =============================================
        Schema::create('remediation_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('assessment_result_id');
            $table->uuid('student_id');
            $table->uuid('teacher_id');
            $table->string('type', 20)->default('remedial'); // remedial, enrichment
            $table->text('description')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->decimal('score_after', 6, 2)->nullable();
            $table->string('status', 20)->default('planned'); // planned, completed
            $table->timestamps();

            $table->foreign('assessment_result_id')->references('id')->on('assessment_results')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->foreign('teacher_id')->references('id')->on('users');
        });

        // =============================================
        // EXAMS (CBT)
        // =============================================
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->uuid('subject_id');
            $table->uuid('classroom_id');
            $table->uuid('semester_id')->nullable();
            $table->string('title', 255);
            $table->text('instructions')->nullable();
            $table->integer('duration_minutes')->default(90);
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->string('access_code', 20)->nullable();
            $table->boolean('randomize_questions')->default(true);
            $table->boolean('randomize_options')->default(true);
            $table->smallInteger('max_attempts')->default(1);
            $table->string('show_result_after', 20)->default('exam_end'); // submit, exam_end, never
            $table->string('status', 20)->default('draft'); // draft, scheduled, active, completed, cancelled
            $table->boolean('is_simulation')->default(false);
            $table->jsonb('settings')->default('{}');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->foreign('semester_id')->references('id')->on('semesters')->nullOnDelete();
            $table->index(['school_id', 'status']);
        });

        // =============================================
        // EXAM ↔ QUESTIONS (pivot)
        // =============================================
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->uuid('exam_id');
            $table->uuid('question_id');
            $table->smallInteger('order_number')->default(0);
            $table->decimal('points_override', 5, 2)->nullable();
            $table->primary(['exam_id', 'question_id']);

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });

        // =============================================
        // EXAM SESSIONS (Sesi Ujian Siswa)
        // =============================================
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_id');
            $table->uuid('student_id');
            $table->smallInteger('attempt_number')->default(1);
            $table->jsonb('question_order')->default('[]'); // Ordered question UUIDs for this session
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('expires_at'); // Server-calculated deadline
            $table->string('status', 20)->default('started'); // started, submitted, timeout, cancelled
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->unique(['exam_id', 'student_id', 'attempt_number']);
            $table->index(['exam_id', 'status']);
        });

        // =============================================
        // EXAM ANSWERS (Jawaban CBT)
        // =============================================
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_session_id');
            $table->uuid('question_id');
            $table->jsonb('answer_data')->nullable(); // Flexible per question type
            $table->boolean('is_marked')->default(false); // Marked for review
            $table->decimal('auto_score', 5, 2)->nullable();
            $table->decimal('manual_score', 5, 2)->nullable();
            $table->text('manual_feedback')->nullable();
            $table->uuid('graded_by')->nullable();
            $table->timestamp('last_saved_at')->nullable();
            $table->timestamps();

            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions');
            $table->foreign('graded_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['exam_session_id', 'question_id']);
        });

        // =============================================
        // EXAM RESULTS (Nilai Akhir CBT)
        // =============================================
        Schema::create('exam_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_session_id');
            $table->decimal('total_score', 6, 2)->default(0);
            $table->decimal('max_score', 6, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->boolean('pass_status')->default(false);
            $table->timestamp('graded_at')->nullable();
            $table->boolean('is_final')->default(false);
            $table->jsonb('score_breakdown')->default('{}');
            $table->timestamps();

            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->unique('exam_session_id');
        });

        // =============================================
        // EXAM EVENTS (Audit Trail CBT)
        // =============================================
        Schema::create('exam_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('exam_session_id');
            $table->string('event_type', 50); // started, answer_saved, tab_switched, submitted, timed_out
            $table->jsonb('event_data')->nullable();
            $table->timestamp('occurred_at');
            $table->string('ip_address', 45)->nullable();

            $table->foreign('exam_session_id')->references('id')->on('exam_sessions')->onDelete('cascade');
            $table->index(['exam_session_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_events');
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('remediation_records');
        Schema::dropIfExists('assessment_results');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('question_objectives');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
    }
};
