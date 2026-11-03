# Entity Relationship Diagram (ERD)
# Akademi Guru Digital

## Keterangan
- PK = Primary Key
- FK = Foreign Key
- UK = Unique Key
- IDX = Index

---

## 1. IDENTITY DOMAIN

### schools
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| name | varchar(255) | Nama sekolah |
| npsn | varchar(20) | Nomor Pokok Sekolah Nasional |
| institution | varchar(255) | Instansi/Dinas |
| address | text | Alamat lengkap |
| city | varchar(100) | Kota |
| province | varchar(100) | Provinsi |
| postal_code | varchar(10) | Kode pos |
| phone | varchar(20) | Telepon |
| email | varchar(255) | Email sekolah |
| website | varchar(255) | Website |
| logo_path | varchar(500) | Path logo |
| is_active | boolean | Status aktif |
| settings | jsonb | Konfigurasi sekolah |
| created_at, updated_at | timestamp | |

### users
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| name | varchar(255) | Nama lengkap |
| email | varchar(255) (UK per school) | |
| username | varchar(100) (UK per school) | |
| password | varchar(255) | Hashed |
| avatar_path | varchar(500) | |
| is_active | boolean | |
| last_login_at | timestamp | |
| email_verified_at | timestamp | |
| created_at, updated_at, deleted_at | timestamp | |

### roles
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools, nullable) | null = global role |
| name | varchar(100) | superadmin, admin, principal, teacher, homeroom, student |
| display_name | varchar(255) | |
| description | text | |

### permissions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| name | varchar(150) (UK) | e.g., attendance.create |
| module | varchar(100) | |
| description | text | |

### role_permissions (pivot)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| role_id | UUID (FK→roles) | |
| permission_id | UUID (FK→permissions) | |

### user_roles (pivot)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| user_id | UUID (FK→users) | |
| role_id | UUID (FK→roles) | |
| school_id | UUID (FK→schools) | |
| assigned_at | timestamp | |

---

## 2. SCHOOL DOMAIN

### academic_years
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| name | varchar(20) | "2025/2026" |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |

### semesters
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| academic_year_id | UUID (FK→academic_years) | |
| semester_number | smallint | 1 atau 2 |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |

### classrooms
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| academic_year_id | UUID (FK→academic_years) | |
| name | varchar(50) | "VII A", "VIII B" |
| grade_level | smallint | 7, 8, atau 9 |
| capacity | smallint | |
| homeroom_teacher_id | UUID (FK→users, nullable) | Wali kelas |
| is_active | boolean | |

### subjects
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| name | varchar(255) | Nama mata pelajaran |
| code | varchar(20) | Kode mapel |
| grade_level | smallint | Level kelas |
| weekly_hours | smallint | Jam per minggu |
| is_active | boolean | |

### teaching_assignments
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| teacher_id | UUID (FK→users) | |
| classroom_id | UUID (FK→classrooms) | |
| subject_id | UUID (FK→subjects) | |
| semester_id | UUID (FK→semesters) | |
| is_active | boolean | |

### class_memberships
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| student_id | UUID (FK→users) | |
| classroom_id | UUID (FK→classrooms) | |
| enrolled_date | date | |
| left_date | date (nullable) | |
| status | varchar(20) | active, transferred, graduated, dropped |

### schedules
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| teaching_assignment_id | UUID (FK) | |
| day_of_week | smallint | 1=Senin, 7=Minggu |
| start_time | time | |
| end_time | time | |
| room | varchar(50) | |

### students (extended profile)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| user_id | UUID (FK→users) | |
| school_id | UUID (FK→schools) | |
| nis | varchar(20) | Nomor induk sekolah |
| nisn | varchar(20, nullable) | NISN |
| birth_date | date | |
| birth_place | varchar(100) | |
| gender | varchar(10) | |
| religion | varchar(50) | |
| address | text | |
| parent_name | varchar(255) | |
| parent_phone | varchar(20) | |

### teachers (extended profile)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| user_id | UUID (FK→users) | |
| school_id | UUID (FK→schools) | |
| nip | varchar(30, nullable) | NIP/NUPTK |
| nuptk | varchar(20, nullable) | |
| specialization | varchar(255) | |
| education_level | varchar(50) | |

---

## 3. ATTENDANCE DOMAIN

### class_sessions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| teaching_assignment_id | UUID (FK) | |
| session_date | date | |
| session_number | smallint | Pertemuan ke- |
| topic | text | Topik/materi |
| status | varchar(20) | planned, in_progress, completed, cancelled |
| locked_at | timestamp (nullable) | |
| locked_by | UUID (FK→users, nullable) | |

### attendance_records
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| class_session_id | UUID (FK) | |
| student_id | UUID (FK→users) | |
| status | varchar(20) | present, sick, excused, absent |
| notes | text | |
| recorded_by | UUID (FK→users) | |
| is_corrected | boolean | |
| created_at, updated_at | timestamp | |

### attendance_corrections
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| attendance_record_id | UUID (FK) | |
| previous_status | varchar(20) | |
| new_status | varchar(20) | |
| reason | text | |
| corrected_by | UUID (FK→users) | |
| corrected_at | timestamp | |

### teaching_journals
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| class_session_id | UUID (FK) | |
| topic | text | |
| learning_objectives | text | TP yang dibahas |
| activities | text | Aktivitas pembelajaran |
| method | varchar(255) | Metode/model |
| class_condition | text | Kondisi kelas |
| reflection | text | Refleksi guru |
| follow_up | text | Tindak lanjut |
| media_used | text | |
| created_by | UUID (FK→users) | |

---

## 4. CURRICULUM DOMAIN

### curriculum_versions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| name | varchar(255) | "Kurikulum Merdeka" |
| code | varchar(50) | |
| effective_year | smallint | |
| description | text | |
| is_active | boolean | |

### learning_phases
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| curriculum_version_id | UUID (FK) | |
| phase_code | varchar(5) | A, B, C, D, E, F |
| grade_levels | integer[] | Array grade |
| description | text | |

### learning_outcomes (CP)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| subject_id | UUID (FK→subjects, nullable) | |
| curriculum_version_id | UUID (FK) | |
| phase_id | UUID (FK→learning_phases) | |
| code | varchar(20) | |
| description | text | Narasi CP |
| source | varchar(255) | Sumber resmi |

### learning_objectives (TP)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| learning_outcome_id | UUID (FK) | |
| school_id | UUID (FK→schools) | |
| teacher_id | UUID (FK→users) | |
| code | varchar(30) | |
| description | text | |
| semester_id | UUID (FK→semesters, nullable) | |
| order_number | smallint | |

### learning_sequences (ATP)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| subject_id | UUID (FK→subjects) | |
| semester_id | UUID (FK→semesters) | |
| name | varchar(255) | |
| description | text | |

### lesson_plans
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| teacher_id | UUID (FK→users) | |
| subject_id | UUID (FK→subjects) | |
| classroom_id | UUID (FK→classrooms, nullable) | |
| title | varchar(255) | |
| type | varchar(30) | rpm, modul_ajar, lkpd, rubrik |
| duration_minutes | integer | |
| content | jsonb | Isi lengkap template |
| status | varchar(20) | draft, published, archived |
| version | smallint | |
| created_at, updated_at | timestamp | |

---

## 5. QUESTION BANK DOMAIN

### questions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| created_by | UUID (FK→users) | |
| subject_id | UUID (FK→subjects) | |
| title | varchar(500) | |
| type | varchar(30) | multiple_choice, true_false, essay, short_answer, fill_blank, matching, sequence |
| content | text | Teks soal |
| stimulus | text (nullable) | Wacana/gambar |
| difficulty | varchar(20) | easy, medium, hard |
| explanation | text | Pembahasan |
| points | decimal(5,2) | |
| status | varchar(20) | draft, reviewed, published, archived |
| tags | text[] | |
| created_at, updated_at | timestamp | |

### question_options
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| question_id | UUID (FK→questions) | |
| label | varchar(5) | A, B, C, D |
| content | text | |
| is_correct | boolean | |
| order_number | smallint | |

### question_objectives (pivot)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| question_id | UUID (FK→questions) | |
| learning_objective_id | UUID (FK→learning_objectives) | |

---

## 6. ASSESSMENT DOMAIN

### assessments
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| created_by | UUID (FK→users) | |
| classroom_id | UUID (FK→classrooms) | |
| subject_id | UUID (FK→subjects) | |
| title | varchar(255) | |
| type | varchar(30) | diagnostic, formative, summative, practice, project |
| scheduled_date | date | |
| description | text | |
| max_score | decimal(6,2) | |
| passing_score | decimal(6,2) | |
| status | varchar(20) | draft, active, completed, archived |

### assessment_results
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| assessment_id | UUID (FK) | |
| student_id | UUID (FK→users) | |
| raw_score | decimal(6,2) | |
| final_score | decimal(6,2) | |
| notes | text | |
| graded_by | UUID (FK→users) | |
| graded_at | timestamp | |
| is_verified | boolean | |

### offline_assessments (Penilaian Luar Aplikasi & Lampau)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | varchar(50) (PK) | ID unik prefix `off-` |
| title | varchar(255) | Judul tugas atau ulangan luar aplikasi |
| type | varchar(30) | `tugas`, `ulangan_tp`, `sts`, `sas` |
| category | varchar(50) | Formatif (Tugas), Sumatif TP, STS, SAS |
| classroom_id | varchar(50) (FK→classrooms) | Target rombel belajar |
| subject_id | varchar(50) (FK→subjects) | sub-kka atau sub-inf |
| assessment_date | date | Tanggal penilaian (mendukung nilai lampau) |
| max_score | decimal(6,2) | Nilai maksimum (default 100) |
| description | text | Catatan materi atau instruksi luar aplikasi |
| tp_id | varchar(50) | TP/Bab terkait (opsional) |
| scores | jsonb | Array `{ student_id, student_name, nis, score, notes }` |
| created_at, updated_at | timestamp | |

---

## 7. CBT DOMAIN

### exams
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| created_by | UUID (FK→users) | |
| title | varchar(255) | |
| instructions | text | |
| subject_id | UUID (FK→subjects) | |
| classroom_id | UUID (FK→classrooms) | |
| duration_minutes | integer | |
| start_time | timestamp | |
| end_time | timestamp | |
| access_code | varchar(20, nullable) | |
| randomize_questions | boolean | |
| randomize_options | boolean | |
| max_attempts | smallint | |
| show_result_after | varchar(20) | submit, exam_end, never |
| status | varchar(20) | draft, scheduled, active, completed, cancelled |

### exam_sessions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| exam_id | UUID (FK→exams) | |
| student_id | UUID (FK→users) | |
| attempt_number | smallint | |
| question_order | uuid[] | Urutan soal untuk sesi ini |
| started_at | timestamp | Server time |
| submitted_at | timestamp | |
| expires_at | timestamp | Server calculated |
| status | varchar(20) | started, submitted, timeout, cancelled |

### exam_answers
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| exam_session_id | UUID (FK) | |
| question_id | UUID (FK→questions) | |
| answer_data | jsonb | Jawaban (fleksibel per tipe soal) |
| is_marked | boolean | Ditandai untuk review |
| auto_score | decimal(5,2) | |
| manual_score | decimal(5,2) | |
| last_saved_at | timestamp | |

### exam_results
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| exam_session_id | UUID (FK, UK) | |
| total_score | decimal(6,2) | |
| max_score | decimal(6,2) | |
| percentage | decimal(5,2) | |
| pass_status | boolean | |
| graded_at | timestamp | |
| is_final | boolean | |

---

## 8. GAMIFICATION DOMAIN

### game_sessions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK) | |
| created_by | UUID (FK→users) | |
| classroom_id | UUID (FK→classrooms) | |
| type | varchar(30) | quick_quiz, true_false, matching, group_challenge |
| title | varchar(255) | |
| join_code | varchar(10) (UK) | |
| duration_minutes | integer | |
| randomize | boolean | |
| save_as_evidence | boolean | |
| status | varchar(20) | waiting, active, completed |
| started_at | timestamp | |
| ended_at | timestamp | |

### game_participants
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| game_session_id | UUID (FK) | |
| student_id | UUID (FK→users) | |
| display_name | varchar(100) | |
| joined_at | timestamp | |
| total_score | decimal(8,2) | |

### game_responses
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| game_session_id | UUID (FK) | |
| participant_id | UUID (FK→game_participants) | |
| question_id | UUID (FK→questions) | |
| answer_data | jsonb | |
| is_correct | boolean | |
| score | decimal(6,2) | |
| response_time_ms | integer | |

---

## 9. OPERATIONAL DOMAIN

### notifications
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK) | |
| type | varchar(100) | exam_scheduled, assignment_due, etc |
| title | varchar(255) | |
| body | text | |
| data | jsonb | |
| created_at | timestamp | |

### notification_records (pivot user-notification)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| notification_id | UUID (FK) | |
| user_id | UUID (FK→users) | |
| read_at | timestamp | |

### audit_logs
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK) | |
| user_id | UUID (FK→users, nullable) | |
| action | varchar(100) | |
| model_type | varchar(255) | |
| model_id | varchar(255) | |
| old_values | jsonb | |
| new_values | jsonb | |
| ip_address | varchar(45) | |
| created_at | timestamp | |

### application_settings
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK, nullable) | null = global |
| key | varchar(255) | |
| value | text | |
| type | varchar(30) | string, boolean, json |

### file_metadata
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID (PK) | |
| school_id | UUID (FK) | |
| uploaded_by | UUID (FK→users) | |
| original_name | varchar(500) | |
| storage_path | varchar(1000) | |
| mime_type | varchar(100) | |
| size_bytes | bigint | |
| is_public | boolean | |
| created_at | timestamp | |

---

## 7. PRESENTATION STUDIO DOMAIN

### presentations
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| teacher_id | UUID (FK→users) | Guru pemilik presentasi |
| subject_id | UUID (FK→subjects, nullable) | Mapel pengampu |
| classroom_id | UUID (FK→classrooms, nullable) | Rombel target |
| learning_objective_id | UUID (FK, nullable) | Tautan ke TP Kurikulum Merdeka |
| title | varchar(255) | Judul materi presentasi |
| description | text | Deskripsi & apersepsi |
| tags | jsonb | Label kata kunci |
| status | varchar(30) | draft, processing, ready, archived |
| slide_count | int | Jumlah total lembar slide |
| aspect_ratio | varchar(10) | 16:9, 4:3 |
| created_at, updated_at, deleted_at | timestamp | |

### presentation_files
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| presentation_id | UUID (FK→presentations) | |
| file_path | varchar(500) | Lokasi private storage |
| original_filename | varchar(255) | Nama berkas sumber |
| file_size_bytes | bigint | Ukuran berkas |
| mime_type | varchar(100) | application/pdf, pptx |
| file_extension | varchar(20) | pdf, pptx |
| processing_status | varchar(30) | pending, converting, ready, failed |
| processing_error | text | Pesan kendala jika gagal |

### presentation_slides
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| presentation_id | UUID (FK→presentations) | |
| slide_number | int | Urutan slide (1-indexed) |
| image_path | varchar(500) | Slide resolusi tinggi (SVG/WebP/PNG) |
| thumbnail_path | varchar(500) | Thumbnail navigasi studio |
| speaker_notes | text | Catatan guru presenter |
| duration_seconds | int | Estimasi menit ajar |

### presentation_sessions
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| school_id | UUID (FK→schools) | |
| presentation_id | UUID (FK→presentations) | Berkas presentasi sumber |
| teacher_id | UUID (FK→users) | Presenter pengendali |
| classroom_id | UUID (FK→classrooms, nullable) | Rombel peserta |
| title | varchar(255) | Judul sesi presentasi |
| access_code | varchar(20) (UK) | PIN 6-karakter akses siswa |
| active_slide | int | Slide yang sedang ditampilkan |
| state_version | int | Nomor versi sinkronisasi |
| status | varchar(30) | draft, scheduled, active, paused, finished, cancelled |
| is_locked | boolean | Kunci interaksi siswa |
| allow_anonymous_votes | boolean | Kebijakan voting anonim |
| started_at, ended_at | timestamp | Waktu sesi |
| settings | jsonb | Konfigurasi tambahan |

### presentation_session_participants
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| session_id | UUID (FK→presentation_sessions) | |
| student_id | UUID (FK→students, nullable) | |
| display_name | varchar(100) | Nama tampilan siswa |
| joined_at | timestamp | Waktu masuk |
| last_heartbeat_at | timestamp | Denyut koneksi terakhir |
| last_acknowledged_slide | int | Slide terakhir yang ter-render |
| connection_status | varchar(30) | connected, syncing, idle, disconnected |

### presentation_session_events
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| session_id | UUID (FK→presentation_sessions) | |
| seq | int | Nomor urut event realtime |
| event_type | varchar(50) | SLIDE_CHANGED, VOTE_OPENED, dll |
| payload | jsonb | Data payload event |
| created_at | timestamp | |

### presentation_votes
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| session_id | UUID (FK→presentation_sessions) | |
| slide_number | int (nullable) | Terkait nomor slide tertentu |
| question | text | Pertanyaan polling |
| vote_type | varchar(30) | single_choice, multiple_choice, yes_no, true_false, rating_scale, short_text |
| is_anonymous | boolean | Sembunyikan identitas di hasil |
| allow_change_answer | boolean | Boleh ubah jawaban |
| time_limit_seconds | int (nullable) | Batas durasi voting |
| status | varchar(20) | draft, open, closed |
| opened_at, closed_at | timestamp | |

### presentation_vote_options
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| vote_id | UUID (FK→presentation_votes) | |
| option_order | int | Urutan A, B, C, D |
| option_text | varchar(255) | Teks pilihan |
| is_correct | boolean (nullable) | Kunci jawaban jika kuis |
| color_code | varchar(20) | Warna kartu |

### presentation_vote_responses
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| vote_id | UUID (FK→presentation_votes) | |
| participant_id | UUID (FK→presentation_session_participants) | |
| selected_option_id | UUID (FK, nullable) | |
| selected_option_ids | jsonb (nullable) | Untuk multiple-choice |
| text_response | text (nullable) | Untuk short_text |
| rating_value | smallint (nullable) | Untuk rating_scale 1-5 |
| submitted_at | timestamp | |

