<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Students\StudentController;
use App\Http\Controllers\Api\V1\Classes\ClassroomController;
use App\Http\Controllers\Api\V1\School\SchoolController;
use App\Http\Controllers\Api\V1\School\SubjectController;
use App\Http\Controllers\Api\V1\School\AcademicYearController;
use App\Http\Controllers\Api\V1\Attendance\SessionController;
use App\Http\Controllers\Api\V1\Attendance\AttendanceController;
use App\Http\Controllers\Api\V1\Attendance\JournalController;
use App\Http\Controllers\Api\V1\QuestionBank\QuestionController;
use App\Http\Controllers\Api\V1\Assessments\AssessmentController;
use App\Http\Controllers\Api\V1\CBT\ExamController;
use App\Http\Controllers\Api\V1\CBT\ExamSessionController;
use App\Http\Controllers\Api\V1\Games\GameSessionController;
use App\Http\Controllers\Api\V1\Games\BossBattleController;
use App\Http\Controllers\Api\V1\Assignments\AssignmentController;
use App\Http\Controllers\Api\V1\Assignments\SubmissionController;
use App\Http\Controllers\Api\V1\Reports\DashboardController;
use App\Http\Controllers\Api\V1\Reports\ReportController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use App\Http\Controllers\Api\V1\LessonPlans\LessonPlanController;
use App\Http\Controllers\Api\V1\Curriculum\LearningOutcomeController;
use App\Http\Controllers\Api\V1\Presentations\PresentationController;
use App\Http\Controllers\Api\V1\Presentations\PresentationSessionController;

/*
|--------------------------------------------------------------------------
| API Routes v1 - Akademi Guru Digital
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // =============================================
    // PUBLIC ROUTES (No Auth Required)
    // =============================================
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('api.v1.auth.login');
    });

    // CBT Student exam (uses access code, limited token)
    Route::prefix('cbt')->group(function () {
        Route::get('join/{code}', [ExamController::class, 'joinByCode'])->name('api.v1.cbt.join');
    });

    // Game participant join (public code)
    Route::get('games/join/{code}', [GameSessionController::class, 'joinByCode'])->name('api.v1.games.join');

    // Presentation session student join (public code)
    Route::get('presentations/join/{code}', [PresentationSessionController::class, 'joinByCode'])->name('api.v1.presentations.join');

    // =============================================
    // AUTHENTICATED ROUTES
    // =============================================
    Route::middleware(['auth:sanctum'])->group(function () {

        // AUTH
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('api.v1.auth.me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
            Route::put('/change-password', [AuthController::class, 'changePassword'])->name('api.v1.auth.change-password');
        });

        // DASHBOARD
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('api.v1.dashboard');

        // =============================================
        // SCHOOL MANAGEMENT
        // =============================================
        Route::prefix('school')->group(function () {
            Route::get('/', [SchoolController::class, 'show'])->name('api.v1.school.show');
            Route::put('/', [SchoolController::class, 'update'])->name('api.v1.school.update');
            Route::post('/logo', [SchoolController::class, 'uploadLogo'])->name('api.v1.school.logo');
        });

        Route::apiResource('academic-years', AcademicYearController::class)->names('api.v1.academic-years');
        Route::post('academic-years/{id}/activate', [AcademicYearController::class, 'activate'])->name('api.v1.academic-years.activate');

        Route::apiResource('subjects', SubjectController::class)->names('api.v1.subjects');
        Route::apiResource('classrooms', ClassroomController::class)->names('api.v1.classrooms');
        Route::get('classrooms/{id}/students', [ClassroomController::class, 'students'])->name('api.v1.classrooms.students');
        Route::post('classrooms/{id}/students/attach', [ClassroomController::class, 'attachStudents'])->name('api.v1.classrooms.students.attach');

        // =============================================
        // STUDENTS
        // =============================================
        Route::apiResource('students', StudentController::class)->names('api.v1.students');
        Route::post('students/import', [StudentController::class, 'import'])->name('api.v1.students.import');
        Route::get('students/export', [StudentController::class, 'export'])->name('api.v1.students.export');

        // =============================================
        // ATTENDANCE & JOURNALS
        // =============================================
        Route::apiResource('sessions', SessionController::class)->names('api.v1.sessions');
        Route::get('sessions/{id}/attendance', [AttendanceController::class, 'index'])->name('api.v1.attendance.index');
        Route::post('sessions/{id}/attendance', [AttendanceController::class, 'save'])->name('api.v1.attendance.save');
        Route::put('sessions/{id}/attendance/{recordId}', [AttendanceController::class, 'correct'])->name('api.v1.attendance.correct');
        Route::get('sessions/{id}/journal', [JournalController::class, 'show'])->name('api.v1.journal.show');
        Route::put('sessions/{id}/journal', [JournalController::class, 'save'])->name('api.v1.journal.save');
        Route::get('attendance/recap', [AttendanceController::class, 'recap'])->name('api.v1.attendance.recap');

        // =============================================
        // CURRICULUM
        // =============================================
        Route::apiResource('learning-outcomes', LearningOutcomeController::class)->names('api.v1.learning-outcomes');

        // =============================================
        // LESSON PLANS (RPM, MODUL AJAR)
        // =============================================
        Route::apiResource('lesson-plans', LessonPlanController::class)->names('api.v1.lesson-plans');
        Route::post('lesson-plans/{id}/publish', [LessonPlanController::class, 'publish'])->name('api.v1.lesson-plans.publish');
        Route::post('lesson-plans/{id}/duplicate', [LessonPlanController::class, 'duplicate'])->name('api.v1.lesson-plans.duplicate');
        Route::get('lesson-plans/{id}/export', [LessonPlanController::class, 'export'])->name('api.v1.lesson-plans.export');

        // =============================================
        // QUESTION BANK
        // =============================================
        Route::apiResource('questions', QuestionController::class)->names('api.v1.questions');
        Route::post('questions/{id}/duplicate', [QuestionController::class, 'duplicate'])->name('api.v1.questions.duplicate');
        Route::post('questions/import', [QuestionController::class, 'import'])->name('api.v1.questions.import');
        Route::get('questions/export', [QuestionController::class, 'export'])->name('api.v1.questions.export');

        // =============================================
        // ASSESSMENTS
        // =============================================
        Route::apiResource('assessments', AssessmentController::class)->names('api.v1.assessments');
        Route::get('assessments/{id}/results', [AssessmentController::class, 'results'])->name('api.v1.assessments.results');
        Route::post('assessments/{id}/results', [AssessmentController::class, 'saveResults'])->name('api.v1.assessments.results.save');
        Route::get('assessments/{id}/export', [AssessmentController::class, 'export'])->name('api.v1.assessments.export');

        // =============================================
        // CBT (UJIAN)
        // =============================================
        Route::apiResource('exams', ExamController::class)->names('api.v1.exams');
        Route::post('exams/{id}/publish', [ExamController::class, 'publish'])->name('api.v1.exams.publish');
        Route::post('exams/{id}/activate', [ExamController::class, 'activate'])->name('api.v1.exams.activate');
        Route::post('exams/{id}/close', [ExamController::class, 'close'])->name('api.v1.exams.close');

        // Student exam flow
        Route::prefix('exam-sessions')->group(function () {
            Route::post('/', [ExamSessionController::class, 'start'])->name('api.v1.exam-sessions.start');
            Route::get('{sessionId}', [ExamSessionController::class, 'show'])->name('api.v1.exam-sessions.show');
            Route::put('{sessionId}/answers/{questionId}', [ExamSessionController::class, 'saveAnswer'])->name('api.v1.exam-sessions.save-answer');
            Route::post('{sessionId}/submit', [ExamSessionController::class, 'submit'])->name('api.v1.exam-sessions.submit');
            Route::get('{sessionId}/result', [ExamSessionController::class, 'result'])->name('api.v1.exam-sessions.result');
        });

        Route::get('exams/{id}/results', [ExamController::class, 'results'])->name('api.v1.exams.results');
        Route::post('exams/{id}/grade/{sessionId}', [ExamController::class, 'gradeEssay'])->name('api.v1.exams.grade');

        // =============================================
        // GAMES (Permainan Edukatif)
        // =============================================
        Route::apiResource('game-sessions', GameSessionController::class)->names('api.v1.game-sessions');
        Route::post('game-sessions/{id}/start', [GameSessionController::class, 'start'])->name('api.v1.game-sessions.start');
        Route::post('game-sessions/{id}/pause', [GameSessionController::class, 'pause'])->name('api.v1.game-sessions.pause');
        Route::post('game-sessions/{id}/end', [GameSessionController::class, 'end'])->name('api.v1.game-sessions.end');
        Route::post('game-sessions/{id}/answer', [GameSessionController::class, 'answer'])->name('api.v1.game-sessions.answer');
        Route::get('game-sessions/{id}/leaderboard', [GameSessionController::class, 'leaderboard'])->name('api.v1.game-sessions.leaderboard');

        Route::prefix('ulangan-gamifikasi')->group(function () {
            Route::get('catalog', [BossBattleController::class, 'catalog'])->name('api.v1.uhg.catalog');
            Route::post('sessions', [BossBattleController::class, 'store'])->name('api.v1.uhg.store');
            Route::get('sessions/{id}', [BossBattleController::class, 'show'])->name('api.v1.uhg.show');
            Route::put('sessions/{id}', [BossBattleController::class, 'update'])->name('api.v1.uhg.update');
            Route::post('sessions/{id}/preview', [BossBattleController::class, 'preview'])->name('api.v1.uhg.preview');
            Route::post('sessions/{id}/start', [BossBattleController::class, 'start'])->name('api.v1.uhg.start');
            Route::post('sessions/{id}/answer', [BossBattleController::class, 'answer'])->name('api.v1.uhg.answer');
            Route::post('sessions/{id}/expire', [BossBattleController::class, 'expire'])->name('api.v1.uhg.expire');
            Route::post('sessions/{id}/learning-mode', [BossBattleController::class, 'learningMode'])->name('api.v1.uhg.learning-mode');
            Route::get('sessions/{id}/report', [BossBattleController::class, 'report'])->name('api.v1.uhg.report');
        });

        // =============================================
        // PRESENTATION STUDIO (Studio Presentasi Interaktif)
        // =============================================
        Route::apiResource('presentations', PresentationController::class)->names('api.v1.presentations');
        Route::post('presentations/{id}/upload', [PresentationController::class, 'upload'])->name('api.v1.presentations.upload');
        Route::get('presentations/{id}/processing-status', [PresentationController::class, 'processingStatus'])->name('api.v1.presentations.processing-status');

        Route::apiResource('presentation-sessions', PresentationSessionController::class)->names('api.v1.presentation-sessions');
        Route::post('presentation-sessions/{id}/navigate', [PresentationSessionController::class, 'navigate'])->name('api.v1.presentation-sessions.navigate');
        Route::post('presentation-sessions/{id}/heartbeat', [PresentationSessionController::class, 'heartbeat'])->name('api.v1.presentation-sessions.heartbeat');
        Route::post('presentation-sessions/{id}/acknowledge-slide', [PresentationSessionController::class, 'acknowledgeSlide'])->name('api.v1.presentation-sessions.acknowledge-slide');
        Route::post('presentation-sessions/{id}/votes', [PresentationSessionController::class, 'createVote'])->name('api.v1.presentation-sessions.votes');
        Route::get('presentation-sessions/{id}/report', [PresentationSessionController::class, 'getReport'])->name('api.v1.presentation-sessions.report');

        // =============================================
        // ASSIGNMENTS (TUGAS)
        // =============================================
        Route::apiResource('assignments', AssignmentController::class)->names('api.v1.assignments');
        Route::get('assignments/{id}/submissions', [SubmissionController::class, 'index'])->name('api.v1.submissions.index');
        Route::post('assignments/{id}/submit', [SubmissionController::class, 'submit'])->name('api.v1.submissions.submit');
        Route::put('assignments/{id}/submissions/{submissionId}/grade', [SubmissionController::class, 'grade'])->name('api.v1.submissions.grade');

        // =============================================
        // REPORTS
        // =============================================
        Route::prefix('reports')->group(function () {
            Route::get('attendance', [ReportController::class, 'attendance'])->name('api.v1.reports.attendance');
            Route::get('grades', [ReportController::class, 'grades'])->name('api.v1.reports.grades');
            Route::get('class-summary', [ReportController::class, 'classSummary'])->name('api.v1.reports.class-summary');
            Route::get('student/{studentId}', [ReportController::class, 'studentReport'])->name('api.v1.reports.student');
            Route::get('attendance/export', [ReportController::class, 'exportAttendance'])->name('api.v1.reports.attendance.export');
            Route::get('grades/export', [ReportController::class, 'exportGrades'])->name('api.v1.reports.grades.export');
        });

        // =============================================
        // NOTIFICATIONS
        // =============================================
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('api.v1.notifications.index');
            Route::post('{id}/read', [NotificationController::class, 'markRead'])->name('api.v1.notifications.read');
            Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('api.v1.notifications.read-all');
        });

        // =============================================
        // USER PROFILE
        // =============================================
        Route::prefix('profile')->group(function () {
            Route::put('/', [AuthController::class, 'updateProfile'])->name('api.v1.profile.update');
            Route::post('/avatar', [AuthController::class, 'uploadAvatar'])->name('api.v1.profile.avatar');
        });
    });
});
