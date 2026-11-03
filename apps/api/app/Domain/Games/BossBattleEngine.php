<?php

namespace App\Domain\Games;

class BossBattleEngine
{
    /**
     * Persentase ketuntasan = (jumlah siswa mencapai KKM / jumlah peserta resmi) × 100.
     * Penyebut adalah peserta resmi yang dikunci sebelum battle, bukan jumlah siswa yang sedang daring.
     */
    public static function ketuntasanPercent(int $passedCount, int $officialCount): float
    {
        if ($officialCount <= 0) {
            return 0.0;
        }

        $passed = max(0, min($passedCount, $officialCount));

        return ($passed / $officialCount) * 100.0;
    }

    /**
     * HP boss = HP awal × (1 − persentase ketuntasan / 100).
     * Presisi internal dipertahankan. Tidak boleh negatif.
     */
    public static function bossHp(float $initialHp, float $ketuntasanPercent): float
    {
        $hp = $initialHp * (1 - ($ketuntasanPercent / 100.0));

        return $hp < 0 ? 0.0 : $hp;
    }

    public static function displayRound(float $value): int
    {
        return (int) round($value);
    }

    public static function classVictory(int $passedCount, int $officialCount): bool
    {
        return $officialCount > 0 && $passedCount >= $officialCount;
    }

    /**
     * @return 'ongoing'|'class_victory'|'boss_victory'
     */
    public static function resolveOutcome(int $passedCount, int $officialCount, bool $timeExpired): string
    {
        if (self::classVictory($passedCount, $officialCount)) {
            return 'class_victory';
        }

        if ($timeExpired) {
            return 'boss_victory';
        }

        return 'ongoing';
    }

    public static function academicScore(int $correctAnswers, int $totalQuestions): float
    {
        if ($totalQuestions <= 0) {
            return 0.0;
        }

        return ($correctAnswers / $totalQuestions) * 100.0;
    }

    /**
     * MVP memakai akurasi, skor akhir, dan cakupan soal. Bukan damage visual.
     *
     * @param  array<int, array{participant_id:string,name:string,avatar?:string,academic_score:float,correct:int,answered:int,reached_kkm:bool,reached_kkm_at?:?int}>  $participants
     * @return array<int, array<string, mixed>>
     */
    public static function computeMvp(array $participants, int $totalQuestions, int $limit = 3): array
    {
        $ranked = [];

        foreach ($participants as $p) {
            $answered = (int) ($p['answered'] ?? 0);
            $correct = (int) ($p['correct'] ?? 0);
            $accuracy = $answered > 0 ? $correct / $answered : 0.0;
            $coverage = $totalQuestions > 0 ? $correct / $totalQuestions : 0.0;
            $kkmBonus = ! empty($p['reached_kkm']) ? 10.0 : 0.0;
            $score = (float) ($p['academic_score'] ?? 0);
            $mvpScore = ($accuracy * 40.0) + ($score * 0.4) + ($coverage * 20.0) + $kkmBonus;

            $ranked[] = [
                'participant_id' => $p['participant_id'],
                'name' => $p['name'],
                'avatar' => $p['avatar'] ?? '🧑',
                'final_score' => $score,
                'accuracy' => $accuracy,
                'contribution' => $coverage,
                'mvp_score' => $mvpScore,
                'explain' => sprintf(
                    'Akurasi %d%%, skor akhir %d, cakupan soal %d%%%s.',
                    (int) round($accuracy * 100),
                    (int) round($score),
                    (int) round($coverage * 100),
                    ! empty($p['reached_kkm']) ? ', mencapai KKM' : ''
                ),
            ];
        }

        usort($ranked, fn ($a, $b) => $b['mvp_score'] <=> $a['mvp_score']);
        $ranked = array_slice($ranked, 0, min($limit, count($ranked)));

        foreach ($ranked as $i => &$row) {
            $row['rank'] = $i + 1;
        }

        return $ranked;
    }

    /**
     * @param  array<string, mixed>  $session
     * @return array<string, mixed>
     */
    public static function applyAnswer(array $session, array $answer): array
    {
        $key = $session['id'].':'.$answer['participant_id'].':'.$answer['question_id'].':'.($answer['client_event_id'] ?? 'default');
        $seen = $session['seen_answer_keys'] ?? [];

        if (in_array($key, $seen, true)) {
            $session['duplicate'] = true;
            $session['visual_attack'] = null;
            $session['academic_updated'] = false;

            return $session;
        }

        $seen[] = $key;
        $session['seen_answer_keys'] = $seen;
        $session['duplicate'] = false;

        $academicLocked = (bool) ($session['academic_locked'] ?? false);
        $outcome = $session['outcome'] ?? 'ongoing';
        $visualOnly = $academicLocked || $outcome !== 'ongoing';
        $isCorrect = (bool) ($answer['is_correct'] ?? false);
        $hpBefore = (float) ($session['boss_hp_exact'] ?? 0);

        if (! $visualOnly) {
            foreach ($session['participants'] as &$p) {
                if ($p['id'] !== $answer['participant_id']) {
                    continue;
                }
                $p['answered'] = (int) $p['answered'] + 1;
                if ($isCorrect) {
                    $p['correct'] = (int) $p['correct'] + 1;
                }
                $p['academic_score'] = self::academicScore((int) $p['correct'], (int) $session['question_count']);
                if (! $p['reached_kkm'] && $p['academic_score'] >= (float) $session['kkm']) {
                    $p['reached_kkm'] = true;
                    $p['reached_kkm_at'] = $answer['now'] ?? time();
                }
            }
            unset($p);

            $passed = count(array_filter($session['participants'], fn ($p) => ! empty($p['reached_kkm'])));
            $official = (int) $session['official_count'];
            $session['passed_count'] = $passed;
            $session['ketuntasan_exact'] = self::ketuntasanPercent($passed, $official);
            $session['boss_hp_exact'] = self::bossHp((float) $session['initial_boss_hp'], $session['ketuntasan_exact']);
            $session['academic_updated'] = true;

            $next = self::resolveOutcome($passed, $official, false);
            if ($next === 'class_victory') {
                $session['outcome'] = 'class_victory';
                $session['status'] = 'completed';
                $session['academic_locked'] = true;
                $session['boss_pose'] = 'defeated';
            }
        } else {
            $session['academic_updated'] = false;
        }

        $session['visual_attack'] = $isCorrect ? [
            'event_id' => 'anim:'.$key,
            'participant_id' => $answer['participant_id'],
            'correct' => true,
            'visual_only' => $visualOnly,
            'hp_changed' => ((float) $session['boss_hp_exact']) !== $hpBefore,
        ] : null;

        $session['boss_hp_display'] = self::displayRound((float) $session['boss_hp_exact']);
        $session['ketuntasan_display'] = self::displayRound((float) $session['ketuntasan_exact']);

        return $session;
    }
}
