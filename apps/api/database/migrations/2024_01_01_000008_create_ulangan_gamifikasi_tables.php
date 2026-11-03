<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boss_characters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id')->nullable();
            $table->string('catalog_key', 80);
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('topic', 255)->nullable();
            $table->string('difficulty', 30)->default('sedang');
            $table->text('spawn_message')->nullable();
            $table->text('defeat_message')->nullable();
            $table->text('win_message')->nullable();
            $table->string('illustration_path', 1000)->nullable();
            $table->jsonb('animations')->default('{}');
            $table->jsonb('visual_effects')->default('{}');
            $table->jsonb('sound_effects')->default('{}');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['school_id', 'catalog_key']);
        });

        Schema::create('ulangan_gamifikasi_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('school_id');
            $table->uuid('created_by');
            $table->uuid('classroom_id');
            $table->uuid('assessment_id')->nullable();
            $table->string('quiz_type', 40);
            $table->string('title', 255);
            $table->string('topic', 255)->nullable();
            $table->string('join_code', 10)->unique();
            $table->decimal('kkm', 6, 2)->default(75);
            $table->integer('question_count')->default(10);
            $table->integer('duration_minutes')->default(10);
            $table->string('question_source', 80)->default('bank_soal');
            $table->boolean('randomize_questions')->default(true);
            $table->decimal('initial_boss_hp', 12, 4)->default(10000);
            $table->decimal('boss_hp_exact', 14, 6)->default(10000);
            $table->decimal('ketuntasan_exact', 10, 6)->default(0);
            $table->integer('official_count')->default(0);
            $table->jsonb('boss_snapshot')->default('{}');
            $table->jsonb('settings_snapshot')->default('{}');
            $table->jsonb('locked_config')->default('{}');
            $table->boolean('config_locked')->default(false);
            $table->boolean('academic_locked')->default(false);
            $table->boolean('learning_mode')->default(false);
            $table->boolean('mvp_enabled')->default(true);
            $table->boolean('remedial_available')->default(true);
            $table->string('status', 20)->default('draft');
            $table->string('outcome', 30)->default('ongoing');
            $table->string('boss_pose', 40)->default('idle');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('classroom_id')->references('id')->on('classrooms');
            $table->index(['school_id', 'status', 'quiz_type']);
        });

        Schema::create('ulangan_gamifikasi_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('student_id');
            $table->string('display_name', 100);
            $table->string('avatar', 20)->nullable();
            $table->boolean('is_official')->default(true);
            $table->boolean('connected')->default(true);
            $table->decimal('academic_score', 8, 4)->default(0);
            $table->boolean('reached_kkm')->default(false);
            $table->timestamp('reached_kkm_at')->nullable();
            $table->integer('correct_answers')->default(0);
            $table->integer('wrong_answers')->default(0);
            $table->integer('answered_count')->default(0);
            $table->integer('rank')->nullable();
            $table->decimal('mvp_score', 10, 4)->nullable();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('ulangan_gamifikasi_sessions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->unique(['session_id', 'student_id']);
        });

        Schema::create('ulangan_gamifikasi_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->uuid('participant_id');
            $table->uuid('question_id');
            $table->string('client_event_id', 80);
            $table->integer('option_index')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->boolean('academic_applied')->default(true);
            $table->boolean('visual_only')->default(false);
            $table->timestamp('answered_at');

            $table->foreign('session_id')->references('id')->on('ulangan_gamifikasi_sessions')->onDelete('cascade');
            $table->foreign('participant_id')->references('id')->on('ulangan_gamifikasi_participants')->onDelete('cascade');
            $table->unique(['session_id', 'participant_id', 'question_id', 'client_event_id'], 'uhg_answer_idempotent');
        });

        Schema::create('ulangan_gamifikasi_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->string('type', 80);
            $table->string('idempotency_key', 160);
            $table->unsignedBigInteger('seq');
            $table->jsonb('payload')->default('{}');
            $table->timestamp('created_at');

            $table->foreign('session_id')->references('id')->on('ulangan_gamifikasi_sessions')->onDelete('cascade');
            $table->unique(['session_id', 'idempotency_key']);
            $table->index(['session_id', 'seq']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ulangan_gamifikasi_events');
        Schema::dropIfExists('ulangan_gamifikasi_answers');
        Schema::dropIfExists('ulangan_gamifikasi_participants');
        Schema::dropIfExists('ulangan_gamifikasi_sessions');
        Schema::dropIfExists('boss_characters');
    }
};
