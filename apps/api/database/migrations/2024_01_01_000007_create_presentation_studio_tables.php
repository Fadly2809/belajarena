<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // 1. PRESENTATIONS (Perpustakaan Slide)
        // =============================================
        Schema::create('presentations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('teacher_id');
            $table->uuid('subject_id')->nullable();
            $table->uuid('classroom_id')->nullable();
            $table->uuid('learning_objective_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->jsonb('tags')->default('[]');
            $table->string('status', 30)->default('draft'); // draft, processing, ready, archived
            $table->integer('slide_count')->default(0);
            $table->string('aspect_ratio', 10)->default('16:9');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('teacher_id')->references('id')->on('users');
            $table->foreign('subject_id')->references('id')->on('subjects')->nullOnDelete();
            $table->foreign('classroom_id')->references('id')->on('classrooms')->nullOnDelete();
            $table->index(['teacher_id', 'status']);
            $table->index(['school_id', 'title']);
        });

        // =============================================
        // 2. PRESENTATION FILES (Berkas Asli Terunggah)
        // =============================================
        Schema::create('presentation_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('presentation_id');
            $table->string('file_path', 500);
            $table->string('original_filename', 255);
            $table->bigInteger('file_size_bytes');
            $table->string('mime_type', 100);
            $table->string('file_extension', 20); // pdf, pptx
            $table->string('processing_status', 30)->default('pending'); // pending, converting, ready, failed
            $table->text('processing_error')->nullable();
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->onDelete('cascade');
        });

        // =============================================
        // 3. PRESENTATION SLIDES (Halaman Slide Individual)
        // =============================================
        Schema::create('presentation_slides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('presentation_id');
            $table->integer('slide_number');
            $table->string('image_path', 500);
            $table->string('thumbnail_path', 500)->nullable();
            $table->text('speaker_notes')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->onDelete('cascade');
            $table->unique(['presentation_id', 'slide_number']);
        });

        // =============================================
        // 4. PRESENTATION SESSIONS (Sesi Presentasi Langsung)
        // =============================================
        Schema::create('presentation_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('presentation_id');
            $table->uuid('teacher_id');
            $table->uuid('classroom_id')->nullable();
            $table->string('title', 255);
            $table->string('access_code', 20)->unique();
            $table->integer('active_slide')->default(1);
            $table->integer('state_version')->default(1);
            $table->string('status', 30)->default('draft'); // draft, scheduled, active, paused, finished, cancelled
            $table->boolean('is_locked')->default(false);
            $table->boolean('allow_anonymous_votes')->default(true);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->jsonb('settings')->default('{}');
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('presentation_id')->references('id')->on('presentations');
            $table->foreign('teacher_id')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms')->nullOnDelete();
            $table->index(['access_code', 'status']);
        });

        // =============================================
        // 5. SESSION PARTICIPANTS (Peserta Sesi & Monitoring)
        // =============================================
        Schema::create('presentation_session_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('student_id')->nullable();
            $table->string('display_name', 100);
            $table->timestamp('joined_at');
            $table->timestamp('last_heartbeat_at')->nullable();
            $table->integer('last_acknowledged_slide')->default(1);
            $table->string('connection_status', 30)->default('connected'); // connected, syncing, idle, disconnected
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('presentation_sessions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->nullOnDelete();
            $table->unique(['session_id', 'student_id']);
            $table->index(['session_id', 'connection_status']);
        });

        // =============================================
        // 6. SESSION EVENTS (Log Urutan Event Realtime)
        // =============================================
        Schema::create('presentation_session_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->integer('seq');
            $table->string('event_type', 50);
            $table->jsonb('payload');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('session_id')->references('id')->on('presentation_sessions')->onDelete('cascade');
            $table->index(['session_id', 'seq']);
        });

        // =============================================
        // 7. PRESENTATION VOTES (Polling & Voting Langsung)
        // =============================================
        Schema::create('presentation_votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->integer('slide_number')->nullable();
            $table->text('question');
            $table->string('vote_type', 30); // single_choice, multiple_choice, yes_no, true_false, rating_scale, short_text
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('allow_change_answer')->default(false);
            $table->integer('time_limit_seconds')->nullable();
            $table->string('status', 20)->default('draft'); // draft, open, closed
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('presentation_sessions')->onDelete('cascade');
            $table->index(['session_id', 'status']);
        });

        // =============================================
        // 8. VOTE OPTIONS (Pilihan Jawaban Voting)
        // =============================================
        Schema::create('presentation_vote_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vote_id');
            $table->integer('option_order');
            $table->string('option_text', 255);
            $table->boolean('is_correct')->nullable();
            $table->string('color_code', 20)->nullable();
            $table->timestamps();

            $table->foreign('vote_id')->references('id')->on('presentation_votes')->onDelete('cascade');
            $table->index(['vote_id', 'option_order']);
        });

        // =============================================
        // 9. VOTE RESPONSES (Jawaban Siswa)
        // =============================================
        Schema::create('presentation_vote_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vote_id');
            $table->uuid('participant_id');
            $table->uuid('selected_option_id')->nullable();
            $table->jsonb('selected_option_ids')->nullable();
            $table->text('text_response')->nullable();
            $table->smallInteger('rating_value')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->foreign('vote_id')->references('id')->on('presentation_votes')->onDelete('cascade');
            $table->foreign('participant_id')->references('id')->on('presentation_session_participants')->onDelete('cascade');
            $table->foreign('selected_option_id')->references('id')->on('presentation_vote_options')->nullOnDelete();
            $table->unique(['vote_id', 'participant_id']);
        });

        // =============================================
        // 10. COMPREHENSION QUESTIONS & RESPONSES
        // =============================================
        Schema::create('presentation_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->integer('slide_number');
            $table->text('question_text');
            $table->uuid('target_tp_id')->nullable();
            $table->boolean('is_formative')->default(true);
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('presentation_sessions')->onDelete('cascade');
        });

        Schema::create('presentation_question_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('question_id');
            $table->uuid('participant_id');
            $table->text('answer_text');
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->foreign('question_id')->references('id')->on('presentation_questions')->onDelete('cascade');
            $table->foreign('participant_id')->references('id')->on('presentation_session_participants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presentation_question_responses');
        Schema::dropIfExists('presentation_questions');
        Schema::dropIfExists('presentation_vote_responses');
        Schema::dropIfExists('presentation_vote_options');
        Schema::dropIfExists('presentation_votes');
        Schema::dropIfExists('presentation_session_events');
        Schema::dropIfExists('presentation_session_participants');
        Schema::dropIfExists('presentation_sessions');
        Schema::dropIfExists('presentation_slides');
        Schema::dropIfExists('presentation_files');
        Schema::dropIfExists('presentations');
    }
};
