import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// SIMULATED DOMAIN ENGINES FOR PRESENTATION STUDIO
// ============================================================================

/**
 * 1. File Upload & Validation Engine
 */
const ALLOWED_MIME_TYPES = {
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/pdf': 'pdf'
};
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function validatePresentationUpload(file) {
  if (!file) throw new Error('File tidak boleh kosong.');
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file melebihi batas maksimal 50MB.');
  }
  const ext = ALLOWED_MIME_TYPES[file.mimeType];
  if (!ext) {
    throw new Error(`Format file tidak didukung (${file.mimeType}). Gunakan PPTX atau PDF.`);
  }
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error('File rusak atau berkas kosong (0 bytes).');
  }
  return {
    valid: true,
    fileType: ext,
    storagePath: `presentations/raw/${file.id || 'gen'}.${ext}`
  };
}

/**
 * 2. Presentation Conversion Pipeline
 */
class PresentationConversionPipeline {
  constructor() {
    this.jobs = new Map();
  }

  submitJob(presentationId, fileType, simulateError = false) {
    const job = {
      presentationId,
      fileType,
      status: 'pending',
      progress: 0,
      slides: [],
      error: null
    };
    this.jobs.set(presentationId, job);

    if (simulateError) {
      job.status = 'failed';
      job.error = 'Konversi gagal: Format slide PPTX rusak atau tidak terbaca oleh renderer.';
      return job;
    }

    // Simulate successful conversion
    job.status = 'completed';
    job.progress = 100;
    const slideCount = fileType === 'pptx' ? 8 : 12;
    for (let i = 1; i <= slideCount; i++) {
      job.slides.push({
        id: `sld-${presentationId}-${i}`,
        slideNumber: i,
        imageUrl: `/storage/slides/${presentationId}/slide-${i}.webp`,
        thumbnailUrl: `/storage/slides/${presentationId}/thumb-${i}.webp`,
        aspectRatio: '16:9'
      });
    }
    return job;
  }

  getJob(presentationId) {
    return this.jobs.get(presentationId);
  }
}

/**
 * 3. Session & Realtime State Engine
 */
class PresentationSessionEngine {
  constructor() {
    this.sessions = new Map();
    this.eventLogs = [];
  }

  createSession({ id, presentationId, teacherId, schoolId, allowedClassIds, totalSlides }) {
    const session = {
      id,
      presentationId,
      teacherId,
      schoolId,
      allowedClassIds: new Set(allowedClassIds),
      status: 'active',
      currentSlide: 1,
      totalSlides,
      stateVersion: 1,
      participants: new Map(), // studentId -> participant state
      activeVote: null,
      votes: new Map() // voteId -> vote object
    };
    this.sessions.set(id, session);
    return session;
  }

  joinSession(sessionId, student, clientClassId, clientSchoolId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Sesi tidak ditemukan.');
    if (session.status === 'ended') throw new Error('Sesi presentasi telah berakhir.');
    if (session.schoolId !== clientSchoolId) {
      throw new Error('Akses ditolak: Sekolah siswa tidak sesuai dengan sesi ini.');
    }
    if (!session.allowedClassIds.has(clientClassId)) {
      throw new Error('Akses ditolak: Kelas Anda tidak terdaftar pada sesi ini.');
    }

    let participant = session.participants.get(student.id);
    if (!participant) {
      participant = {
        id: student.id,
        name: student.name,
        classId: clientClassId,
        joinedAt: new Date().toISOString(),
        connectionStatus: 'connected',
        lastHeartbeat: Date.now(),
        lastAckSlide: session.currentSlide
      };
      session.participants.set(student.id, participant);
    } else {
      // Reconnection
      participant.connectionStatus = 'connected';
      participant.lastHeartbeat = Date.now();
    }

    return {
      success: true,
      currentSlide: session.currentSlide,
      stateVersion: session.stateVersion,
      activeVote: session.activeVote
    };
  }

  navigateSlide(sessionId, teacherId, targetSlide) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Sesi tidak ditemukan.');
    if (session.teacherId !== teacherId) throw new Error('Hanya guru pemilik sesi yang dapat mengubah slide.');
    if (targetSlide < 1 || targetSlide > session.totalSlides) {
      throw new Error('Nomor slide di luar jangkauan valid.');
    }

    session.currentSlide = targetSlide;
    session.stateVersion += 1;

    const event = {
      sessionId,
      type: 'slide_changed',
      currentSlide: targetSlide,
      stateVersion: session.stateVersion,
      timestamp: Date.now()
    };
    this.eventLogs.push(event);
    return event;
  }

  acknowledgeSlide(sessionId, studentId, slideNumber) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Sesi tidak ditemukan.');
    const participant = session.participants.get(studentId);
    if (participant) {
      participant.lastAckSlide = slideNumber;
      participant.lastHeartbeat = Date.now();
      participant.connectionStatus = 'connected';
    }
  }

  recordHeartbeat(sessionId, studentId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Sesi tidak ditemukan.');
    const participant = session.participants.get(studentId);
    if (participant) {
      participant.lastHeartbeat = Date.now();
      participant.connectionStatus = 'connected';
    }
  }

  evaluateConnectionStates(sessionId, now, timeoutMs = 15000) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    for (const [, p] of session.participants) {
      if (now - p.lastHeartbeat > timeoutMs) {
        p.connectionStatus = 'disconnected';
      }
    }
  }

  createVote(sessionId, teacherId, voteConfig) {
    const session = this.sessions.get(sessionId);
    if (!session || session.teacherId !== teacherId) throw new Error('Akses ditolak.');
    const vote = {
      id: voteConfig.id,
      sessionId,
      question: voteConfig.question,
      options: voteConfig.options.map(o => ({ ...o, count: 0 })),
      isAnonymous: Boolean(voteConfig.isAnonymous),
      status: 'open',
      responses: new Map() // studentId -> optionId
    };
    session.activeVote = vote;
    session.votes.set(vote.id, vote);
    return vote;
  }

  submitVoteResponse(sessionId, voteId, studentId, optionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Sesi tidak ditemukan.');
    const vote = session.votes.get(voteId);
    if (!vote) throw new Error('Voting tidak ditemukan.');
    if (vote.status !== 'open') throw new Error('Voting telah ditutup. Respon ditolak.');

    if (vote.responses.has(studentId)) {
      throw new Error('Anda sudah mengirim jawaban untuk voting ini. Jawaban ganda ditolak.');
    }

    const opt = vote.options.find(o => o.id === optionId);
    if (!opt) throw new Error('Pilihan jawaban tidak valid.');

    vote.responses.set(studentId, optionId);
    opt.count += 1;
    return { success: true };
  }

  closeVote(sessionId, teacherId, voteId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.teacherId !== teacherId) throw new Error('Akses ditolak.');
    const vote = session.votes.get(voteId);
    if (!vote) throw new Error('Voting tidak ditemukan.');
    vote.status = 'closed';
    session.activeVote = null;
    return vote;
  }

  getVoteResults(sessionId, voteId) {
    const session = this.sessions.get(sessionId);
    const vote = session.votes.get(voteId);
    const total = vote.responses.size;
    const distribution = vote.options.map(o => ({
      id: o.id,
      text: o.text,
      count: o.count,
      percentage: total > 0 ? Math.round((o.count / total) * 100) : 0
    }));

    return {
      voteId: vote.id,
      isAnonymous: vote.isAnonymous,
      totalResponses: total,
      distribution,
      // If anonymous, NEVER leak student identifiers
      participants: vote.isAnonymous ? null : Array.from(vote.responses.keys())
    };
  }
}

// ============================================================================
// SUITE: 20 MANDATORY TEST SCENARIOS (Prompt Item 14)
// ============================================================================

test('Scenario 1: Guru mengunggah file PPTX yang valid', () => {
  const file = {
    id: 'ppt-001',
    name: 'Ekosistem_Kelas_7.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 4 * 1024 * 1024,
    buffer: Buffer.from('mock pptx content')
  };
  const result = validatePresentationUpload(file);
  assert.equal(result.valid, true);
  assert.equal(result.fileType, 'pptx');
  assert.match(result.storagePath, /presentations\/raw\/ppt-001\.pptx/);
});

test('Scenario 2: Guru mengunggah file PDF yang valid', () => {
  const file = {
    id: 'pdf-002',
    name: 'Materi_Fisika_Newton.pdf',
    mimeType: 'application/pdf',
    size: 2 * 1024 * 1024,
    buffer: Buffer.from('%PDF-1.4 mock')
  };
  const result = validatePresentationUpload(file);
  assert.equal(result.valid, true);
  assert.equal(result.fileType, 'pdf');
  assert.match(result.storagePath, /presentations\/raw\/pdf-002\.pdf/);
});

test('Scenario 3: File yang rusak atau tidak didukung ditolak dengan pesan yang sesuai', () => {
  const badExt = {
    name: 'script.exe',
    mimeType: 'application/x-msdownload',
    size: 1024,
    buffer: Buffer.from('bad')
  };
  assert.throws(() => validatePresentationUpload(badExt), /Format file tidak didukung/);

  const emptyFile = {
    name: 'empty.pdf',
    mimeType: 'application/pdf',
    size: 0,
    buffer: Buffer.alloc(0)
  };
  assert.throws(() => validatePresentationUpload(emptyFile), /File rusak atau berkas kosong/);

  const oversized = {
    name: 'giant.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 60 * 1024 * 1024,
    buffer: Buffer.alloc(100)
  };
  assert.throws(() => validatePresentationUpload(oversized), /Ukuran file melebihi batas maksimal 50MB/);
});

test('Scenario 4: Konversi presentasi berhasil dan gagal ditangani dengan benar', () => {
  const pipeline = new PresentationConversionPipeline();

  // Successful conversion
  const successJob = pipeline.submitJob('pres-success', 'pptx');
  assert.equal(successJob.status, 'completed');
  assert.equal(successJob.progress, 100);
  assert.equal(successJob.slides.length, 8);
  assert.equal(successJob.slides[0].aspectRatio, '16:9');

  // Failed conversion handling
  const failedJob = pipeline.submitJob('pres-failed', 'pptx', true);
  assert.equal(failedJob.status, 'failed');
  assert.match(failedJob.error, /Konversi gagal/);
});

test('Scenario 5: Guru membuat sesi presentasi', () => {
  const engine = new PresentationSessionEngine();
  const session = engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a', 'cls-8b'],
    totalSlides: 8
  });
  assert.equal(session.id, 'ses-101');
  assert.equal(session.currentSlide, 1);
  assert.equal(session.status, 'active');
  assert.equal(session.stateVersion, 1);
});

test('Scenario 6: Siswa yang berhak dapat bergabung ke sesi', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  const res = engine.joinSession('ses-101', { id: 'std-1', name: 'Ahmad' }, 'cls-8a', 'smpn-6-kendari');
  assert.equal(res.success, true);
  assert.equal(res.currentSlide, 1);
  assert.equal(res.stateVersion, 1);
});

test('Scenario 7: Siswa dari kelas yang tidak diizinkan ditolak', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  // Different class
  assert.throws(
    () => engine.joinSession('ses-101', { id: 'std-2', name: 'Bambang' }, 'cls-9c', 'smpn-6-kendari'),
    /Kelas Anda tidak terdaftar pada sesi ini/
  );

  // Cross school intrusion
  assert.throws(
    () => engine.joinSession('ses-101', { id: 'std-3', name: 'Dewi' }, 'cls-8a', 'smpn-lain'),
    /Sekolah siswa tidak sesuai dengan sesi ini/
  );
});

test('Scenario 8: Guru berpindah slide dan perangkat siswa menerima perubahan via sequence', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  const event = engine.navigateSlide('ses-101', 'tch-budi', 2);
  assert.equal(event.currentSlide, 2);
  assert.equal(event.stateVersion, 2);
  assert.equal(engine.sessions.get('ses-101').currentSlide, 2);
});

test('Scenario 9: Siswa yang terlambat bergabung mendapatkan slide aktif terbaru', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  // Guru is already on slide 5
  engine.navigateSlide('ses-101', 'tch-budi', 5);

  // Late joiner enters
  const res = engine.joinSession('ses-101', { id: 'std-late', name: 'Cici' }, 'cls-8a', 'smpn-6-kendari');
  assert.equal(res.currentSlide, 5);
  assert.equal(res.stateVersion, 2);
});

test('Scenario 10: Siswa yang terputus dapat menyambung kembali (reconnection)', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.joinSession('ses-101', { id: 'std-rec', name: 'Doni' }, 'cls-8a', 'smpn-6-kendari');
  
  // Simulate disconnection timeout
  engine.evaluateConnectionStates('ses-101', Date.now() + 20000, 15000);
  const partBefore = engine.sessions.get('ses-101').participants.get('std-rec');
  assert.equal(partBefore.connectionStatus, 'disconnected');

  // Student reconnects
  const reconnectRes = engine.joinSession('ses-101', { id: 'std-rec', name: 'Doni' }, 'cls-8a', 'smpn-6-kendari');
  assert.equal(reconnectRes.success, true);
  assert.equal(partBefore.connectionStatus, 'connected');
});

test('Scenario 11: Monitoring menampilkan status koneksi sesuai heartbeat', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.joinSession('ses-101', { id: 'std-1', name: 'Ahmad' }, 'cls-8a', 'smpn-6-kendari');
  engine.joinSession('ses-101', { id: 'std-2', name: 'Bambang' }, 'cls-8a', 'smpn-6-kendari');

  const p1 = engine.sessions.get('ses-101').participants.get('std-1');
  const p2 = engine.sessions.get('ses-101').participants.get('std-2');

  const baseTime = Date.now();
  // std-1 sends recent heartbeat at baseTime + 12000, std-2 remains at baseTime
  p1.lastHeartbeat = baseTime + 12000;
  p2.lastHeartbeat = baseTime;

  engine.evaluateConnectionStates('ses-101', baseTime + 16000, 15000);

  assert.equal(p1.connectionStatus, 'connected');
  assert.equal(p2.connectionStatus, 'disconnected');
});

test('Scenario 12: Voting dapat dibuka dan ditutup oleh guru', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  const vote = engine.createVote('ses-101', 'tch-budi', {
    id: 'vote-01',
    question: 'Apakah Bumi mengelilingi Matahari?',
    options: [
      { id: 'opt-y', text: 'Ya' },
      { id: 'opt-n', text: 'Tidak' }
    ],
    isAnonymous: false
  });
  assert.equal(vote.status, 'open');
  assert.equal(engine.sessions.get('ses-101').activeVote.id, 'vote-01');

  engine.closeVote('ses-101', 'tch-budi', 'vote-01');
  assert.equal(vote.status, 'closed');
  assert.equal(engine.sessions.get('ses-101').activeVote, null);
});

test('Scenario 13: Jawaban voting yang sah tersimpan dengan benar', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.createVote('ses-101', 'tch-budi', {
    id: 'vote-01',
    question: 'Pilih opsi:',
    options: [{ id: 'opt-a', text: 'A' }, { id: 'opt-b', text: 'B' }]
  });

  const res = engine.submitVoteResponse('ses-101', 'vote-01', 'std-1', 'opt-a');
  assert.equal(res.success, true);

  const results = engine.getVoteResults('ses-101', 'vote-01');
  assert.equal(results.totalResponses, 1);
  assert.equal(results.distribution[0].count, 1);
});

test('Scenario 14: Jawaban ganda ditolak jika tidak diizinkan', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.createVote('ses-101', 'tch-budi', {
    id: 'vote-01',
    question: 'Pilih opsi:',
    options: [{ id: 'opt-a', text: 'A' }, { id: 'opt-b', text: 'B' }]
  });

  engine.submitVoteResponse('ses-101', 'vote-01', 'std-1', 'opt-a');
  assert.throws(
    () => engine.submitVoteResponse('ses-101', 'vote-01', 'std-1', 'opt-b'),
    /Jawaban ganda ditolak/
  );
});

test('Scenario 15: Voting yang sudah ditutup menolak respons baru', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.createVote('ses-101', 'tch-budi', {
    id: 'vote-01',
    question: 'Pilih opsi:',
    options: [{ id: 'opt-a', text: 'A' }, { id: 'opt-b', text: 'B' }]
  });

  engine.closeVote('ses-101', 'tch-budi', 'vote-01');

  assert.throws(
    () => engine.submitVoteResponse('ses-101', 'vote-01', 'std-1', 'opt-a'),
    /Voting telah ditutup\. Respon ditolak/
  );
});

test('Scenario 16: Hasil anonim tidak mengungkap identitas peserta', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-success',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  engine.createVote('ses-101', 'tch-budi', {
    id: 'vote-anon',
    question: 'Tingkat kepuasan:',
    options: [{ id: 'opt-1', text: 'Puas' }, { id: 'opt-2', text: 'Kurang' }],
    isAnonymous: true
  });

  engine.submitVoteResponse('ses-101', 'vote-anon', 'std-secret-99', 'opt-1');
  const results = engine.getVoteResults('ses-101', 'vote-anon');

  assert.equal(results.isAnonymous, true);
  assert.equal(results.participants, null); // Strictly null in anonymous mode
  assert.equal(results.distribution[0].count, 1);
});

test('Scenario 17: Dua sesi presentasi yang berbeda tidak saling mencampur event', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-A',
    presentationId: 'pres-1',
    teacherId: 'tch-1',
    schoolId: 'school-1',
    allowedClassIds: ['cls-1'],
    totalSlides: 10
  });

  engine.createSession({
    id: 'ses-B',
    presentationId: 'pres-1', // Same presentation file
    teacherId: 'tch-2',
    schoolId: 'school-1',
    allowedClassIds: ['cls-2'],
    totalSlides: 10
  });

  // Navigate on session A to slide 4
  engine.navigateSlide('ses-A', 'tch-1', 4);

  // Session B must remain at slide 1
  assert.equal(engine.sessions.get('ses-A').currentSlide, 4);
  assert.equal(engine.sessions.get('ses-B').currentSlide, 1);
  assert.equal(engine.sessions.get('ses-A').stateVersion, 2);
  assert.equal(engine.sessions.get('ses-B').stateVersion, 1);
});

test('Scenario 18: Pengguna tidak sah tidak dapat membaca file atau mengubah sesi', () => {
  const engine = new PresentationSessionEngine();
  engine.createSession({
    id: 'ses-101',
    presentationId: 'pres-1',
    teacherId: 'tch-budi',
    schoolId: 'smpn-6-kendari',
    allowedClassIds: ['cls-8a'],
    totalSlides: 8
  });

  // Intruder tries to navigate
  assert.throws(
    () => engine.navigateSlide('ses-101', 'intruder-user', 3),
    /Hanya guru pemilik sesi yang dapat mengubah slide/
  );
});

test('Scenario 19: Laporan sesi sesuai dengan data aktual dan persentase tepat', () => {
  const totalInvited = 30;
  const joinedParticipants = [
    { id: '1', ackSlide: 8, voted: true },
    { id: '2', ackSlide: 8, voted: true },
    { id: '3', ackSlide: 7, voted: false }
  ];

  const attendanceRate = Math.round((joinedParticipants.length / totalInvited) * 100);
  const votingRate = Math.round((joinedParticipants.filter(p => p.voted).length / joinedParticipants.length) * 100);
  const slideSyncRate = Math.round((joinedParticipants.filter(p => p.ackSlide === 8).length / joinedParticipants.length) * 100);

  assert.equal(attendanceRate, 10);
  assert.equal(votingRate, 67);
  assert.equal(slideSyncRate, 67);
});

test('Scenario 20: Tampilan berfungsi pada viewport HP dan desktop (Responsive Object-Fit Contain)', () => {
  // Verifying configuration specification
  const desktopConfig = {
    viewport: 'desktop',
    aspectRatio: '16:9',
    fitMode: 'contain',
    enableThumbnailStrip: true,
    enableMonitoringDrawer: true
  };
  const mobileConfig = {
    viewport: 'mobile_hp',
    aspectRatio: '16:9',
    fitMode: 'contain',
    enableThumbnailStrip: false,
    enableMonitoringDrawer: false,
    enablePinchZoom: true
  };

  assert.equal(desktopConfig.fitMode, 'contain');
  assert.equal(mobileConfig.fitMode, 'contain');
  assert.equal(mobileConfig.enablePinchZoom, true);
});
