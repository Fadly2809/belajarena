import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// 1. DOMAIN: PENILAIAN KURIKULUM MERDEKA FASE D SMP
// ============================================================================

/**
 * Menghitung Nilai Akhir (NA) Rapor Semester:
 * NA = (Avg Formatif * 0.40) + (Avg Sumatif * 0.40) + (SAS * 0.20)
 */
function calculateFinalGrade(formativeScores, summativeScores, sasScore) {
  if (!formativeScores.length || !summativeScores.length) {
    throw new Error('Skor formatif dan sumatif tidak boleh kosong');
  }
  const avgFormatif = formativeScores.reduce((a, b) => a + b, 0) / formativeScores.length;
  const avgSumatif = summativeScores.reduce((a, b) => a + b, 0) / summativeScores.length;
  return Math.round((avgFormatif * 0.40) + (avgSumatif * 0.40) + (sasScore * 0.20));
}

/**
 * Menentukan Predikat & Interval KKTP
 */
function getKktpPredicate(score) {
  if (score >= 91) return { grade: 'A', predicate: 'Sangat Baik', needRemedial: false };
  if (score >= 81) return { grade: 'B', predicate: 'Baik', needRemedial: false };
  if (score >= 70) return { grade: 'C', predicate: 'Cukup', needRemedial: false };
  return { grade: 'D', predicate: 'Perlu Bimbingan', needRemedial: true };
}

/**
 * Menghasilkan Deskripsi Capaian Kompetensi Rapor Otomatis
 */
function generateReportDescription(tpRecords) {
  const sorted = [...tpRecords].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  if (lowest.score >= 90) {
    return 'Menunjukkan penguasaan istimewa dalam seluruh capaian elemen mata pelajaran secara mandiri dan kreatif.';
  }
  if (highest.score >= 70 && lowest.score < 70) {
    return `Menunjukkan penguasaan sangat baik dalam ${highest.topic}; perlu peningkatan dan pendampingan dalam ${lowest.topic}.`;
  }
  if (highest.score < 70) {
    return 'Memerlukan pendampingan intensif dan bimbingan remedial dalam menguasai konsep-konsep dasar mata pelajaran.';
  }
  return `Menunjukkan penguasaan baik dalam ${highest.topic}; pertahankan prestasi belajar.`;
}

// ============================================================================
// 2. DOMAIN: ENGINE CBT & ANTI-CURANG
// ============================================================================

/**
 * Fisher-Yates Shuffle Berbasis Seed Deterministik
 */
function deterministicShuffle(array, seed) {
  const result = [...array];
  let m = result.length;
  let currentSeed = seed;

  while (m > 0) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const i = Math.floor((currentSeed / 233280) * m);
    m--;
    const temp = result[m];
    result[m] = result[i];
    result[i] = temp;
  }
  return result;
}

/**
 * State Machine Pengawasan Anti-Curang (Tab Switching)
 */
class ExamSessionMonitor {
  constructor(maxViolations = 3) {
    this.maxViolations = maxViolations;
    this.violations = 0;
    this.isLocked = false;
    this.history = [];
  }

  recordTabSwitch(timestamp = new Date()) {
    if (this.isLocked) {
      return { status: 'LOCKED', message: 'Sesi telah terkunci. Hubungi pengawas.' };
    }

    this.violations++;
    this.history.push({ event: 'TAB_BLUR', time: timestamp });

    if (this.violations >= this.maxViolations) {
      this.isLocked = true;
      return { status: 'LOCKED', message: 'Pelanggaran mencapai batas maksimal. Sesi ujian terkunci!' };
    }

    return {
      status: 'WARNING',
      message: `Peringatan ${this.violations} dari ${this.maxViolations}: Harap tetap berada di layar ujian!`
    };
  }

  unlock(adminUsername) {
    this.isLocked = false;
    this.history.push({ event: 'UNLOCKED_BY_ADMIN', by: adminUsername, time: new Date() });
  }
}

// ============================================================================
// 3. DOMAIN: PRESENSI & EARLY WARNING SYSTEM (EWS)
// ============================================================================

function calculateAttendanceMetrics(h, s, i, a) {
  const total = h + s + i + a;
  if (total === 0) return { rate: 0, status: 'NO_DATA' };

  const rate = Number(((h / total) * 100).toFixed(1));
  let status = 'SANGAT_BAIK';

  if (rate < 85.0) {
    status = 'PERHATIAN_KHUSUS'; // EWS trigger
  } else if (rate < 90.0) {
    status = 'CUKUP';
  }

  return { rate, status, effectiveDays: total };
}

// ============================================================================
// 4. DOMAIN: GAME POINT CALCULATION & WHEEL RESOLVER
// ============================================================================

function calculateGameScore(isCorrect, remainingSeconds, totalSeconds) {
  if (!isCorrect) return 0;
  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, totalSeconds));
  return Math.round(500 + 500 * (clampedRemaining / totalSeconds));
}

function resolveWheelWinner(participants, totalRotationDegrees) {
  if (!participants.length) return null;
  const sliceAngle = 360 / participants.length;
  const normalizedAngle = (360 - (totalRotationDegrees % 360)) % 360;
  const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % participants.length;
  return participants[winnerIndex];
}

// ============================================================================
// 5. DOMAIN: RBAC PERMISSIONS CHECKER
// ============================================================================

const ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: ['manage_school', 'manage_classes', 'manage_users', 'view_reports'],
  principal: ['view_reports', 'supervise_teachers', 'view_all_grades', 'approve_curriculum'],
  teacher: ['manage_attendance', 'manage_lesson_plans', 'manage_exams', 'grade_assignments'],
  homeroom: ['manage_attendance', 'manage_lesson_plans', 'manage_exams', 'grade_assignments', 'print_report_cards'],
  student: ['take_exams', 'view_own_grades', 'submit_assignments', 'play_games']
};

function hasPermission(role, requiredPermission) {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.includes(requiredPermission);
}

// ============================================================================
// TEST SUITES
// ============================================================================

test('1. Kurikulum Merdeka: Nilai Akhir (NA) pembobotan 40% Formatif + 40% Sumatif + 20% SAS', () => {
  // Siswa: Ahmad Fadhil (Formatif: 88, 85, 90; Sumatif: 86, 92; SAS: 88)
  const formative = [88, 85, 90]; // avg = 87.666
  const summative = [86, 92];     // avg = 89
  const sas = 88;

  const na = calculateFinalGrade(formative, summative, sas);
  assert.equal(na, 88);

  const kktp = getKktpPredicate(na);
  assert.equal(kktp.grade, 'B');
  assert.equal(kktp.predicate, 'Baik');
  assert.equal(kktp.needRemedial, false);
});

test('2. Kurikulum Merdeka: Generator Deskripsi Rapor Otomatis', () => {
  const studentHigh = [
    { topic: 'Sistem Komputer', score: 94 },
    { topic: 'Algoritma Pemrograman', score: 92 },
    { topic: 'Jaringan Komputer', score: 96 }
  ];
  assert.match(generateReportDescription(studentHigh), /seluruh capaian elemen/);

  const studentMixed = [
    { topic: 'Sistem Komputer', score: 90 },
    { topic: 'Konversi Bilangan Biner', score: 62 }
  ];
  const descMixed = generateReportDescription(studentMixed);
  assert.match(descMixed, /Sistem Komputer/);
  assert.match(descMixed, /Konversi Bilangan Biner/);
  assert.match(descMixed, /perlu peningkatan dan pendampingan/);
});

test('3. CBT: Pengacakan Deterministik Fisher-Yates', () => {
  const questions = [1, 2, 3, 4, 5, 6, 7, 8];
  const shuffledA = deterministicShuffle(questions, 1001);
  const shuffledB = deterministicShuffle(questions, 1001);
  const shuffledDifferentSeed = deterministicShuffle(questions, 9999);

  // Deterministik untuk seed yang sama
  assert.deepEqual(shuffledA, shuffledB);
  // Berbeda urutan untuk seed berbeda
  assert.notDeepEqual(shuffledA, shuffledDifferentSeed);
  // Jumlah dan elemen tetap utuh
  assert.equal(shuffledA.length, questions.length);
  assert.deepEqual([...shuffledA].sort(), [...questions].sort());
});

test('4. CBT: State Machine Anti-Curang Tab Switch & Kunci Sesi', () => {
  const monitor = new ExamSessionMonitor(3);
  assert.equal(monitor.isLocked, false);

  const res1 = monitor.recordTabSwitch();
  assert.equal(res1.status, 'WARNING');
  assert.equal(monitor.violations, 1);
  assert.equal(monitor.isLocked, false);

  const res2 = monitor.recordTabSwitch();
  assert.equal(res2.status, 'WARNING');
  assert.equal(monitor.violations, 2);

  const res3 = monitor.recordTabSwitch();
  assert.equal(res3.status, 'LOCKED');
  assert.equal(monitor.isLocked, true);

  // Percobaan berikutnya ditolak karena terkunci
  const res4 = monitor.recordTabSwitch();
  assert.equal(res4.status, 'LOCKED');

  // Pengawas membuka kunci
  monitor.unlock('guru_info');
  assert.equal(monitor.isLocked, false);
});

test('5. Presensi & EWS: Perhitungan Tingkat Kehadiran & Warning Drop Out', () => {
  // Siswa rajin (83 Hadir, 1 Sakit, 0 Izin, 0 Alpa dari 84 hari KBM)
  const good = calculateAttendanceMetrics(83, 1, 0, 0);
  assert.equal(good.rate, 98.8);
  assert.equal(good.status, 'SANGAT_BAIK');

  // Siswa rawan (68 Hadir, 5 Sakit, 5 Izin, 6 Alpa dari 84 hari KBM)
  const atRisk = calculateAttendanceMetrics(68, 5, 5, 6);
  assert.equal(atRisk.rate, 81.0);
  assert.equal(atRisk.status, 'PERHATIAN_KHUSUS');
});

test('6. Gamifikasi: Kalkulasi Poin Kuis Kilat & Roda Acak Peserta', () => {
  // Jawaban benar dengan sisa 10 detik dari 15 detik = 500 + 500*(10/15) = 833
  const scoreCorrect = calculateGameScore(true, 10, 15);
  assert.equal(scoreCorrect, 833);

  // Jawaban salah mendapatkan 0 poin
  const scoreWrong = calculateGameScore(false, 10, 15);
  assert.equal(scoreWrong, 0);

  // Roda putar nama siswa
  const students = ['Ahmad', 'Aisyah', 'Bintang', 'Citra'];
  const winner = resolveWheelWinner(students, 3600 + 45);
  assert.ok(students.includes(winner));
});

test('7. RBAC: Matriks Hak Akses Pengguna', () => {
  // Guru can manage exams and grade, but cannot manage school
  assert.equal(hasPermission('teacher', 'manage_exams'), true);
  assert.equal(hasPermission('teacher', 'manage_school'), false);

  // Homeroom teacher can print report cards
  assert.equal(hasPermission('homeroom', 'print_report_cards'), true);
  assert.equal(hasPermission('student', 'print_report_cards'), false);

  // Superadmin has all permissions
  assert.equal(hasPermission('superadmin', 'any_arbitrary_action'), true);
});
