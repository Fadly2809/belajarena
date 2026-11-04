import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/LoginPage.vue'),
      meta: { requiresGuest: true, layout: 'auth' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/modules/auth/ForgotPasswordPage.vue'),
      meta: { requiresGuest: true, layout: 'auth' }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/modules/auth/ResetPasswordPage.vue'),
      meta: { requiresGuest: true, layout: 'auth' }
    },

    // Dashboard
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/modules/dashboard/DashboardPage.vue'),
      meta: { requiresAuth: true, title: 'Dashboard' }
    },

    // Student Portal (Native APK / Mobile App View)
    {
      path: '/student',
      name: 'student-portal',
      component: () => import('@/modules/student-portal/StudentPortalPage.vue'),
      meta: { requiresAuth: true, title: 'Portal Siswa SMPN 6 Kendari', layout: 'blank' }
    },

    // School Management
    {
      path: '/school',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'settings',
          name: 'school-settings',
          component: () => import('@/modules/settings/SchoolSettingsPage.vue'),
          meta: { title: 'Pengaturan Sekolah', roles: ['teacher', 'admin', 'superadmin'] }
        },
        {
          path: 'academic-years',
          name: 'academic-years',
          component: () => import('@/modules/school/AcademicYearsPage.vue'),
          meta: { title: 'Tahun Ajaran' }
        },
      ]
    },

    // Students
    {
      path: '/students',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'students',
          component: () => import('@/modules/students/StudentsPage.vue'),
          meta: { title: 'Data Siswa' }
        },
        {
          path: ':id',
          name: 'student-detail',
          component: () => import('@/modules/students/StudentDetailPage.vue'),
          meta: { title: 'Detail Siswa' }
        },
      ]
    },

    // Classes
    {
      path: '/classes',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'classes',
          component: () => import('@/modules/classes/ClassesPage.vue'),
          meta: { title: 'Data Kelas' }
        },
        {
          path: ':id',
          name: 'class-detail',
          component: () => import('@/modules/classes/ClassDetailPage.vue'),
          meta: { title: 'Detail Kelas' }
        },
      ]
    },

    // Attendance
    {
      path: '/attendance',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'attendance',
          component: () => import('@/modules/attendance/AttendancePage.vue'),
          meta: { title: 'Absensi' }
        },
        {
          path: 'journal',
          name: 'journal',
          component: () => import('@/modules/attendance/JournalPage.vue'),
          meta: { title: 'Jurnal Mengajar' }
        },
        {
          path: 'recap',
          name: 'attendance-recap',
          component: () => import('@/modules/attendance/AttendanceRecapPage.vue'),
          meta: { title: 'Rekap Absensi' }
        },
      ]
    },

    // Curriculum
    {
      path: '/curriculum',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'curriculum',
          component: () => import('@/modules/curriculum/CurriculumPage.vue'),
          meta: { title: 'Kurikulum' }
        },
        {
          path: 'learning-outcomes',
          name: 'learning-outcomes',
          component: () => import('@/modules/curriculum/LearningOutcomesPage.vue'),
          meta: { title: 'Capaian Pembelajaran' }
        },
        {
          path: 'learning-objectives',
          name: 'learning-objectives',
          component: () => import('@/modules/curriculum/LearningObjectivesPage.vue'),
          meta: { title: 'Tujuan Pembelajaran' }
        },
        {
          path: 'chapters',
          name: 'curriculum-chapters',
          component: () => import('@/modules/curriculum/ChapterObjectivesMappingPage.vue'),
          meta: { title: 'Mapping BAB & TP' }
        },
      ]
    },

    // Lesson Plans
    {
      path: '/lesson-plans',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'lesson-plans',
          component: () => import('@/modules/lesson-plans/LessonPlansPage.vue'),
          meta: { title: 'Perangkat Ajar' }
        },
        {
          path: 'create',
          name: 'lesson-plan-create',
          component: () => import('@/modules/lesson-plans/LessonPlanEditorPage.vue'),
          meta: { title: 'Buat Perangkat Ajar' }
        },
        {
          path: ':id/edit',
          name: 'lesson-plan-edit',
          component: () => import('@/modules/lesson-plans/LessonPlanEditorPage.vue'),
          meta: { title: 'Edit Perangkat Ajar' }
        },
      ]
    },

    // Question Bank
    {
      path: '/question-bank',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'question-bank',
          component: () => import('@/modules/question-bank/QuestionBankPage.vue'),
          meta: { title: 'Bank Soal' }
        },
        {
          path: 'create',
          name: 'question-create',
          component: () => import('@/modules/question-bank/QuestionEditorPage.vue'),
          meta: { title: 'Buat Soal' }
        },
        {
          path: ':id/edit',
          name: 'question-edit',
          component: () => import('@/modules/question-bank/QuestionEditorPage.vue'),
          meta: { title: 'Edit Soal' }
        },
      ]
    },

    // Assessments
    {
      path: '/assessments',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'assessments',
          component: () => import('@/modules/assessments/AssessmentsPage.vue'),
          meta: { title: 'Asesmen' }
        },
        {
          path: ':id',
          name: 'assessment-detail',
          component: () => import('@/modules/assessments/AssessmentDetailPage.vue'),
          meta: { title: 'Detail Asesmen' }
        },
        {
          path: ':id/grade',
          name: 'assessment-grade',
          component: () => import('@/modules/grading/GradingPage.vue'),
          meta: { title: 'Penilaian' }
        },
      ]
    },

    // CBT
    {
      path: '/cbt',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'cbt',
          component: () => import('@/modules/cbt/CbtPage.vue'),
          meta: { title: 'CBT - Ujian Digital' }
        },
        {
          path: 'create',
          name: 'exam-create',
          component: () => import('@/modules/cbt/ExamEditorPage.vue'),
          meta: { title: 'Buat Ujian' }
        },
        {
          path: ':id',
          name: 'exam-detail',
          component: () => import('@/modules/cbt/ExamDetailPage.vue'),
          meta: { title: 'Detail Ujian' }
        },
        {
          path: ':id/results',
          name: 'exam-results',
          component: () => import('@/modules/cbt/ExamResultsPage.vue'),
          meta: { title: 'Hasil Ujian' }
        },
      ]
    },

    // Student CBT
    {
      path: '/cbt/result/:id',
      redirect: to => `/cbt/${to.params.id}/results`
    },
    {
      path: '/cbt/student/:id',
      redirect: to => `/exam/${to.params.id}/start`
    },
    {
      path: '/cbt/:id/student',
      redirect: to => `/exam/${to.params.id}/start`
    },
    {
      path: '/exam/:id/start',
      name: 'exam-start',
      component: () => import('@/modules/cbt/StudentExamPage.vue'),
      meta: { requiresAuth: true, title: 'Ujian Siswa', layout: 'exam' }
    },

    // Games
    {
      path: '/games',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'games',
          component: () => import('@/modules/games/GamesPage.vue'),
          meta: { title: 'Games Pembelajaran', layout: 'blank' }
        },
        {
          path: 'session/:id',
          name: 'game-session',
          component: () => import('@/modules/games/GameSessionPage.vue'),
          meta: { title: 'Sesi Permainan' }
        },
        {
          path: 'ulangan-harian',
          name: 'ulangan-gamifikasi-settings',
          component: () => import('@/modules/games/bossBattle/UlanganSettingsPage.vue'),
          meta: { title: 'Pengaturan Ulangan Gamifikasi' }
        },
        {
          path: 'ulangan-harian/arena',
          redirect: () => '/games/ulangan-harian/arena/active'
        },
        {
          path: 'ulangan-harian/arena/:id',
          name: 'ulangan-gamifikasi-arena',
          component: () => import('@/modules/games/bossBattle/BossArenaPage.vue'),
          meta: { layout: 'blank', title: 'Arena Boss Battle — Ulangan Harian' }
        },
        {
          path: 'ulangan-harian/play',
          redirect: () => '/games/ulangan-harian/play/active'
        },
        {
          path: 'ulangan-harian/play/:id',
          name: 'ulangan-gamifikasi-play',
          component: () => import('@/modules/games/bossBattle/StudentBattlePage.vue'),
          meta: { layout: 'blank', title: 'Ulangan Harian Gamifikasi Siswa' }
        },
        // Class Race (Balapan Kelas)
        {
          path: 'class-race/arena/:id',
          name: 'class-race-arena',
          component: () => import('@/modules/games/classRace/ClassRaceArenaPage.vue'),
          meta: { layout: 'blank', title: 'Arena Balapan Kelas' }
        },
        {
          path: 'class-race/play/:id',
          name: 'class-race-play',
          component: () => import('@/modules/games/classRace/StudentRacePage.vue'),
          meta: { layout: 'blank', title: 'Balapan Kelas Siswa' }
        },
        // Tower Defense Kelas (Pertahanan Markas)
        {
          path: 'tower-defense/arena/:id',
          name: 'tower-defense-arena',
          component: () => import('@/modules/games/towerDefense/TowerDefenseArenaPage.vue'),
          meta: { layout: 'blank', title: 'Arena Pertahanan Markas' }
        },
        {
          path: 'tower-defense/play/:id',
          name: 'tower-defense-play',
          component: () => import('@/modules/games/towerDefense/StudentTowerDefensePage.vue'),
          meta: { layout: 'blank', title: 'Pertahanan Markas Siswa' }
        },
      ]
    },

    // Weekly Schedule & Meeting Tracker
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/modules/schedule/SchedulePage.vue'),
      meta: { requiresAuth: true, title: 'Jadwal Mingguan & Info Pertemuan' }
    },

    // Ice Breakers
    {
      path: '/icebreakers',
      name: 'icebreakers',
      component: () => import('@/modules/icebreakers/IcebreakersPage.vue'),
      meta: { requiresAuth: true, title: 'Ice Breaking' }
    },

    // Assignments
    {
      path: '/assignments',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'assignments',
          component: () => import('@/modules/assignments/AssignmentsPage.vue'),
          meta: { title: 'Tugas' }
        },
        {
          path: ':id',
          name: 'assignment-detail',
          component: () => import('@/modules/assignments/AssignmentDetailPage.vue'),
          meta: { title: 'Detail Tugas' }
        },
      ]
    },

    // Reports
    {
      path: '/reports',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/reports/grades'
        },
        {
          path: 'attendance',
          name: 'report-attendance',
          component: () => import('@/modules/reports/AttendanceReportPage.vue'),
          meta: { title: 'Laporan Absensi' }
        },
        {
          path: 'exam-events',
          name: 'report-exam-events',
          component: () => import('@/modules/reports/ExamEventsRecapPage.vue'),
          meta: { title: 'Rekap Nilai Ulangan' }
        },
        {
          path: 'grades',
          name: 'report-grades',
          component: () => import('@/modules/reports/GradesReportPage.vue'),
          meta: { title: 'Laporan Nilai Siswa' }
        },
        {
          path: 'tp-mapping',
          name: 'report-tp-mapping',
          component: () => import('@/modules/curriculum/ChapterObjectivesMappingPage.vue'),
          meta: { title: 'Pemetaan BAB, TP & Nilai' }
        },
      ]
    },

    // Profile
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/modules/settings/ProfilePage.vue'),
      meta: { requiresAuth: true, title: 'Profil' }
    },

    // Notifications (Handled via header pop-up)
    {
      path: '/notifications',
      redirect: '/dashboard',
    },

    // Interactive Presentation Studio
    {
      path: '/presentations',
      name: 'presentations',
      component: () => import('@/modules/presentations/PresentationLibraryPage.vue'),
      meta: { requiresAuth: true, title: 'Studio Presentasi', layout: 'blank' }
    },
    {
      path: '/presentations/studio/:id',
      name: 'presentation-studio',
      component: () => import('@/modules/presentations/TeacherPresentationStudio.vue'),
      meta: { requiresAuth: true, layout: 'blank', title: 'Studio Presentasi Guru' }
    },
    {
      path: '/presentations/session/:id/report',
      name: 'presentation-report',
      component: () => import('@/modules/presentations/PresentationReportPage.vue'),
      meta: { requiresAuth: true, title: 'Laporan Sesi Presentasi' }
    },
    {
      path: '/presentation-live/:code',
      name: 'student-presentation-live',
      component: () => import('@/modules/presentations/StudentPresentationView.vue'),
      meta: { layout: 'blank', title: 'Sesi Presentasi Interaktif' }
    },
    {
      path: '/presentation/live/:code',
      redirect: to => `/presentation-live/${to.params.code}`
    },

    // Live Ranking Kelas
    {
      path: '/rankings',
      name: 'live-rankings',
      component: () => import('@/modules/ranking/LiveRankingPage.vue'),
      meta: { requiresAuth: true, title: 'Live Ranking Kelas' }
    },

    // Pusat Akademik Hub
    {
      path: '/academic',
      name: 'academic-hub',
      component: () => import('@/modules/academic/AcademicHubPage.vue'),
      meta: { requiresAuth: true, title: 'Pusat Akademik' }
    },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/modules/NotFoundPage.vue'),
      meta: { layout: 'blank' }
    },
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // On page refresh / initial navigation: if auth_token exists and user not initialized, restore session first
  const token = localStorage.getItem('auth_token')
  if (token && !authStore.initialized) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  const isStudent = authStore.user?.role === 'student' || authStore.user?.is_student

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (isStudent) {
      next({ path: '/student' })
    } else {
      next({ path: '/dashboard' })
    }
    return
  }

  // Proteksi akun siswa agar selalu berada di portal siswa / modul siswa yang diizinkan dan tidak mengakses modul guru
  if (authStore.isAuthenticated && isStudent) {
    const isStudentAllowed =
      to.path === '/student' ||
      to.path.startsWith('/student/') ||
      to.path === '/dashboard' ||
      to.path === '/academic' ||
      to.path === '/games' ||
      to.path.startsWith('/games/') ||
      to.path === '/presentations' ||
      to.path.startsWith('/presentation-live/') ||
      to.path.startsWith('/presentation/live/') ||
      to.path === '/schedule' ||
      to.path === '/attendance' ||
      to.path === '/cbt' ||
      to.path.startsWith('/cbt/') ||
      to.path === '/assignments' ||
      to.path.startsWith('/assignments/') ||
      to.path === '/reports/exam-events' ||
      to.path === '/reports/grades' ||
      to.path === '/rankings' ||
      to.path === '/profile' ||
      to.name === 'not-found'

    if (!isStudentAllowed) {
      next({ path: '/academic' })
      return
    }
  }

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} — Belajarena`
  } else {
    document.title = 'Belajarena'
  }

  next()
})

export default router
