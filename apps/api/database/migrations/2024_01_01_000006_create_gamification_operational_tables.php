<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // ASSIGNMENTS (Tugas)
        // =============================================
        Schema::create('assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('teacher_id');
            $table->uuid('classroom_id');
            $table->uuid('subject_id');
            $table->string('title', 255);
            $table->text('instructions');
            $table->timestamp('due_date');
            $table->jsonb('allowed_file_types')->default('["pdf","doc","docx","jpg","png","mp4"]');
            $table->integer('max_file_size_mb')->default(10);
            $table->decimal('max_score', 6, 2)->default(100);
            $table->boolean('allow_late')->default(true);
            $table->string('status', 20)->default('active'); // draft, active, closed, archived
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('teacher_id')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->foreign('subject_id')->references('id')->on('subjects');
            $table->index(['classroom_id', 'due_date']);
        });

        // =============================================
        // SUBMISSIONS (Pengumpulan Tugas)
        // =============================================
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('assignment_id');
            $table->uuid('student_id');
            $table->text('text_response')->nullable();
            $table->jsonb('file_paths')->default('[]');
            $table->string('status', 20)->default('submitted'); // submitted, late, graded, returned
            $table->timestamp('submitted_at');
            $table->decimal('score', 6, 2)->nullable();
            $table->text('teacher_comment')->nullable();
            $table->uuid('graded_by')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->timestamps();

            $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->foreign('graded_by')->references('id')->on('users')->nullOnDelete();
            $table->unique(['assignment_id', 'student_id']);
        });

        // =============================================
        // GAME TEMPLATES
        // =============================================
        Schema::create('game_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->string('name', 255);
            $table->string('type', 30); // quick_quiz, true_false, matching, group_challenge, sequence
            $table->text('description')->nullable();
            $table->jsonb('settings')->default('{}'); // Default settings per game type
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
        });

        // =============================================
        // GAME SESSIONS
        // =============================================
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->uuid('classroom_id')->nullable();
            $table->string('type', 30);
            $table->string('title', 255);
            $table->string('join_code', 10)->unique();
            $table->integer('duration_minutes')->nullable();
            $table->boolean('randomize')->default(true);
            $table->boolean('save_as_evidence')->default(false);
            $table->boolean('show_leaderboard')->default(true);
            $table->string('status', 20)->default('waiting'); // waiting, active, paused, completed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms')->nullOnDelete();
            $table->index(['join_code', 'status']);
        });

        // =============================================
        // GAME PARTICIPANTS
        // =============================================
        Schema::create('game_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('game_session_id');
            $table->uuid('student_id')->nullable();
            $table->string('display_name', 100);
            $table->timestamp('joined_at');
            $table->decimal('total_score', 10, 2)->default(0);
            $table->integer('rank')->nullable();
            $table->timestamps();

            $table->foreign('game_session_id')->references('id')->on('game_sessions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['game_session_id', 'total_score']);
        });

        // =============================================
        // GAME RESPONSES
        // =============================================
        Schema::create('game_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('game_session_id');
            $table->uuid('participant_id');
            $table->uuid('question_id');
            $table->jsonb('answer_data')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->decimal('score', 6, 2)->default(0);
            $table->integer('response_time_ms')->nullable();
            $table->timestamp('answered_at');

            $table->foreign('game_session_id')->references('id')->on('game_sessions')->onDelete('cascade');
            $table->foreign('participant_id')->references('id')->on('game_participants')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions');
            $table->unique(['participant_id', 'question_id']);
        });

        // =============================================
        // ICEBREAKER ACTIVITIES
        // =============================================
        Schema::create('icebreaker_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable(); // null = global library
            $table->uuid('created_by')->nullable();
            $table->string('title', 255);
            $table->text('description');
            $table->text('instructions');
            $table->string('type', 50); // spin_wheel, word_chain, group_shuffle, etc.
            $table->integer('min_duration_minutes')->default(5);
            $table->integer('max_duration_minutes')->default(15);
            $table->integer('min_participants')->default(2);
            $table->integer('max_participants')->nullable();
            $table->boolean('requires_movement')->default(false);
            $table->boolean('requires_device')->default(false);
            $table->string('energy_level', 20)->default('medium'); // low, medium, high
            $table->jsonb('tags')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        // =============================================
        // NOTIFICATIONS
        // =============================================
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable();
            $table->string('type', 100);
            $table->string('title', 255);
            $table->text('body')->nullable();
            $table->jsonb('data')->default('{}');
            $table->timestamp('created_at');
        });

        Schema::create('notification_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('notification_id');
            $table->uuid('user_id');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at');

            $table->foreign('notification_id')->references('id')->on('notifications')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'read_at']);
        });

        // =============================================
        // AUDIT LOGS
        // =============================================
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable();
            $table->uuid('user_id')->nullable();
            $table->string('action', 100);
            $table->string('model_type', 255)->nullable();
            $table->string('model_id', 255)->nullable();
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');

            $table->index(['school_id', 'action', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // =============================================
        // APPLICATION SETTINGS
        // =============================================
        Schema::create('application_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable();
            $table->string('key', 255);
            $table->text('value')->nullable();
            $table->string('type', 30)->default('string'); // string, boolean, json, integer
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'key']);
            $table->index('school_id');
        });

        // =============================================
        // FILE METADATA
        // =============================================
        Schema::create('file_metadata', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('uploaded_by');
            $table->string('original_name', 500);
            $table->string('storage_path', 1000);
            $table->string('disk', 50)->default('local');
            $table->string('mime_type', 100);
            $table->bigInteger('size_bytes');
            $table->boolean('is_public')->default(false);
            $table->string('model_type', 255)->nullable(); // Polymorphic owner
            $table->string('model_id', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('uploaded_by')->references('id')->on('users');
            $table->index(['model_type', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_metadata');
        Schema::dropIfExists('application_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notification_records');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('icebreaker_activities');
        Schema::dropIfExists('game_responses');
        Schema::dropIfExists('game_participants');
        Schema::dropIfExists('game_sessions');
        Schema::dropIfExists('game_templates');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignments');
    }
};
