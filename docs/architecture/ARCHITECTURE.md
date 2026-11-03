# Arsitektur Sistem - Akademi Guru Digital

## 1. Gambaran Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     KLIEN (Browser)                       │
│  Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia        │
│  PWA Service Worker                                       │
└───────────────────────┬─────────────────────────────────┘
                         │ HTTPS / REST API
┌───────────────────────▼─────────────────────────────────┐
│                   BACKEND (Laravel 11)                    │
│  REST API /api/v1  │  Sanctum Auth  │  Queue Workers     │
│  Policies  │  Form Request  │  Actions/Services          │
└──────────┬────────────────────────┬────────────────────--┘
           │                        │
┌──────────▼──────────┐  ┌─────────▼────────────┐
│   PostgreSQL 16      │  │  Redis (opsional)     │
│   Database Utama     │  │  Cache / Queue        │
└─────────────────────┘  └──────────────────────┘
           │
┌──────────▼──────────┐
│   File Storage       │
│   Local Dev /        │
│   Object Storage     │
│   (Production)       │
└─────────────────────┘
```

## 2. Stack Teknologi

### Frontend
- **Framework:** Vue 3 (Composition API)
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite 5+
- **State Management:** Pinia
- **Routing:** Vue Router 4
- **Styling:** Tailwind CSS v3
- **UI Components:** shadcn-vue / PrimeVue (Vue 3 compatible)
- **Validasi:** Zod + VeeValidate
- **Charts:** Chart.js via vue-chartjs
- **Export:** jsPDF, xlsx
- **HTTP Client:** Axios
- **PWA:** vite-plugin-pwa

### Backend
- **Framework:** Laravel 11
- **Language:** PHP 8.2+
- **Autentikasi:** Laravel Sanctum (SPA)
- **Database ORM:** Eloquent
- **Queue:** Laravel Queue (database driver default, Redis opsional)
- **Testing:** Pest PHP

### Database
- **Primary:** PostgreSQL 16
- **Cache/Queue:** Redis (opsional, v7+)

### DevOps
- **Container:** Docker + Docker Compose
- **Version Control:** Git
- **API Docs:** OpenAPI/Swagger (via l5-swagger)

## 3. Pola Arsitektur Backend

### Domain-Driven Structure
```
app/
├── Domain/           # Business logic terorganisir per domain
│   ├── Identity/     # User, Role, Permission, School
│   ├── School/       # Academic year, classroom, subjects
│   ├── Students/     # Student management
│   ├── Curriculum/   # CP, TP, ATP, lesson plans
│   ├── Attendance/   # Absensi dan jurnal
│   ├── Assessment/   # Asesmen dan penilaian
│   ├── QuestionBank/ # Bank soal
│   ├── CBT/          # Computer based test
│   ├── Grading/      # Penilaian dan nilai
│   ├── Gamification/ # Games dan ice breaking
│   └── Reporting/    # Laporan dan analitik
├── Http/
│   ├── Controllers/Api/V1/
│   ├── Requests/     # Form Request validation
│   ├── Resources/    # API Resources (JSON transform)
│   └── Middleware/
├── Jobs/             # Queue jobs
├── Policies/         # Authorization policies
├── Services/         # Business services
└── Support/          # Helper classes
```

## 4. Keamanan

### Lapisan Autentikasi
1. SPA authentication via Sanctum tokens
2. Token disimpan di httpOnly cookie (preferred) atau memory
3. CSRF protection aktif

### Lapisan Otorisasi
1. Policies untuk setiap model
2. Middleware role check
3. Scope data berdasarkan sekolah (school_id)
4. Backend validation SELALU dijalankan (tidak hanya frontend)

### Data Protection
1. Semua query menggunakan scope `where school_id = ?`
2. Super admin bypass dengan audit trail
3. Soft delete untuk data sensitif

## 5. Desain API

### Convention
- Base URL: `/api/v1`
- Format: JSON
- Pagination: cursor-based untuk performa
- Error format: `{ message, errors, code }`
- Success format: `{ data, meta, message }`
- Auth: Bearer token atau cookie

### Rate Limiting
- Login: 5 request/menit per IP
- General API: 60 request/menit per user
- Export: 10 request/menit per user

## 6. Deployment (Production)

```
Internet → Nginx (SSL Termination) → Laravel + PHP-FPM
                                    → Queue Worker (Supervisor)
                                    → PostgreSQL
                                    → Redis
                                    → File Storage
```
