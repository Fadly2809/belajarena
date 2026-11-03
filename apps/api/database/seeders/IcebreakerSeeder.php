<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class IcebreakerSeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            [
                'title' => 'Roda Nama Keberuntungan (Spin The Wheel)',
                'description' => 'Memutar roda nama siswa secara interaktif untuk memilih siswa menjawab pertanyaan atau memimpin doa pembuka.',
                'instructions' => "1. Klik tombol Putar Roda.\n2. Biarkan roda berputar dengan efek suara dan animasi seru.\n3. Siswa yang terpilih berkesempatan membagikan 1 hal positif hari ini atau menjawab pertanyaan pemantik guru.",
                'type' => 'spin_wheel',
                'min_duration_minutes' => 3,
                'max_duration_minutes' => 7,
                'min_participants' => 2,
                'energy_level' => 'high',
                'requires_movement' => false,
                'requires_device' => false,
                'tags' => json_encode(['roda', 'acak', 'pembuka-kelas', 'seru']),
            ],
            [
                'title' => 'Sambung Kata Kilat (Word Chain)',
                'description' => 'Permainan menyambung kata berantai berkecepatan tinggi dengan huruf terakhir kata sebelumnya.',
                'instructions' => "1. Guru menentukan topik, misalnya: Istilah Sains atau Benda di Ruang Kelas.\n2. Siswa pertama menyebutkan kata, misal: 'Mikroskop'.\n3. Siswa berikutnya harus menyebut kata berawalan huruf 'P', misal: 'Pipet', dalam waktu 5 detik.",
                'type' => 'word_chain',
                'min_duration_minutes' => 5,
                'max_duration_minutes' => 10,
                'min_participants' => 5,
                'energy_level' => 'high',
                'requires_movement' => false,
                'requires_device' => false,
                'tags' => json_encode(['kata', 'fokus', 'kecepatan', 'kosakata']),
            ],
            [
                'title' => 'Tebak Fakta atau Mitos (True or Myth)',
                'description' => 'Siswa berdiri atau duduk untuk menebak pernyataan sains/umum dari guru.',
                'instructions' => "1. Guru membacakan fakta menarik yang mengejutkan seputar mata pelajaran.\n2. Siswa yang berpendapat FAKTA berdiri tegak dan mengangkat kedua tangan.\n3. Siswa yang berpendapat MITOS tetap duduk dan menyilangkan tangan di dada.\n4. Buka jawaban dan berikan poin pengetahuan singkat.",
                'type' => 'fact_myth',
                'min_duration_minutes' => 5,
                'max_duration_minutes' => 10,
                'min_participants' => 10,
                'energy_level' => 'medium',
                'requires_movement' => true,
                'requires_device' => false,
                'tags' => json_encode(['mitos-fakta', 'gerak', 'literasi-sains']),
            ],
            [
                'title' => 'Dua Benar Satu Bohong (Two Truths and a Lie)',
                'description' => 'Mengenal teman kelas lebih dekat dengan menebak 1 kebohongan di antara 2 kebenaran.',
                'instructions' => "1. Siswa terpilih menuliskan 3 kalimat tentang dirinya (2 fakta sebenarnya dan 1 karangan/bohong).\n2. Seluruh kelas melakukan voting menebak mana kalimat yang bohong.\n3. Sangat efektif untuk membangun empati dan kebersamaan di awal semester.",
                'type' => 'two_truths',
                'min_duration_minutes' => 8,
                'max_duration_minutes' => 15,
                'min_participants' => 5,
                'energy_level' => 'medium',
                'requires_movement' => false,
                'requires_device' => false,
                'tags' => json_encode(['empati', 'kenalan', 'profil-pelajar-pancasila']),
            ],
            [
                'title' => 'Senam Otak 1-2-3 (Brain Gym Energizer)',
                'description' => 'Gerakan koordinasi jari tangan kanan dan kiri untuk mengembalikan konsentrasi yang buyar.',
                'instructions' => "1. Tangan kanan membentuk simbol angka 2 (peace), tangan kiri membentuk simbol jempol (oke).\n2. Saat guru bertepuk tangan, ubah posisi secara serentak: tangan kanan jempol, kiri angka 2.\n3. Percepat tempo secara bertahap hingga seluruh kelas tertawa dan fokus kembali.",
                'type' => 'brain_gym',
                'min_duration_minutes' => 3,
                'max_duration_minutes' => 5,
                'min_participants' => 2,
                'energy_level' => 'medium',
                'requires_movement' => true,
                'requires_device' => false,
                'tags' => json_encode(['fokus', 'senam-otak', 'konsentrasi', 'cepat']),
            ],
            [
                'title' => 'Tebak Emotikon Istilah Pelajaran (Emoji Riddle)',
                'description' => 'Guru menampilkan kombinasi emoji di layar proyeksi, siswa berebut menebak maknanya.',
                'instructions' => "1. Tampilkan 2-3 emoji di layar (misal: ☀️ + 🌿 + 💧 = Fotosintesis).\n2. Siswa mengangkat tangan tercepat untuk menjawab.\n3. Merangsang logika visual dan asosiasi konsep.",
                'type' => 'emoji_riddle',
                'min_duration_minutes' => 5,
                'max_duration_minutes' => 10,
                'min_participants' => 5,
                'energy_level' => 'high',
                'requires_movement' => false,
                'requires_device' => false,
                'tags' => json_encode(['visual', 'tebak-tebakan', 'digital']),
            ],
        ];

        foreach ($activities as $act) {
            DB::table('icebreaker_activities')->updateOrInsert(
                ['title' => $act['title']],
                array_merge($act, [
                    'id' => Str::uuid()->toString(),
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
