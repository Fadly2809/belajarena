<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // CLASS SESSIONS (Pertemuan)
        // =============================================
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('teaching_assignment_id');
            $table->date('session_date');
            $table->smallInteger('session_number');
            $table->text('topic')->nullable();
            $table->string('status', 20)->default('planned'); // planned, in_progress, completed, cancelled
            $table->timestamp('locked_at')->nullable();
            $table->uuid('locked_by')->nullable();
            $table->timestamps();

            $table->foreign('teaching_assignment_id')->references('id')->on('teaching_assignments')->onDelete('cascade');
            $table->foreign('locked_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['teaching_assignment_id', 'session_date']);
        });

        // =============================================
        // ATTENDANCE RECORDS
        // =============================================
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('class_session_id');
            $table->uuid('student_id');
            $table->string('status', 20); // present, sick, excused, absent
            $table->text('notes')->nullable();
            $table->uuid('recorded_by');
            $table->boolean('is_corrected')->default(false);
            $table->timestamps();

            $table->foreign('class_session_id')->references('id')->on('class_sessions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users');
            $table->foreign('recorded_by')->references('id')->on('users');
            $table->unique(['class_session_id', 'student_id']);
            $table->index(['student_id', 'status']);
        });

        // =============================================
        // ATTENDANCE CORRECTIONS (Koreksi Absensi)
        // =============================================
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('attendance_record_id');
            $table->string('previous_status', 20);
            $table->string('new_status', 20);
            $table->text('reason');
            $table->uuid('corrected_by');
            $table->timestamp('corrected_at');
            $table->timestamps();

            $table->foreign('attendance_record_id')->references('id')->on('attendance_records')->onDelete('cascade');
            $table->foreign('corrected_by')->references('id')->on('users');
        });

        // =============================================
        // TEACHING JOURNALS (Jurnal Mengajar)
        // =============================================
        Schema::create('teaching_journals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('class_session_id');
            $table->text('topic')->nullable();
            $table->text('learning_objectives')->nullable();
            $table->text('activities')->nullable();
            $table->string('method', 255)->nullable();
            $table->text('class_condition')->nullable();
            $table->text('reflection')->nullable();
            $table->text('follow_up')->nullable();
            $table->text('media_used')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('class_session_id')->references('id')->on('class_sessions')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users');
            $table->unique('class_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teaching_journals');
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('class_sessions');
    }
};
