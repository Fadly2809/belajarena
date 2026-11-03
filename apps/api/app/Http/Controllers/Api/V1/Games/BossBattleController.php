<?php

namespace App\Http\Controllers\Api\V1\Games;

use App\Domain\Games\BossBattleEngine;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BossBattleController extends Controller
{
    /** @var array<string, array<string, mixed>> */
    private static array $sessions = [];

    /** @var array<string, array<string, mixed>> */
    private static array $history = [];

    public function catalog(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'quiz_types' => [
                    ['id' => 'ulangan_harian', 'label' => 'Ulangan Harian'],
                    ['id' => 'kuis_formatif', 'label' => 'Kuis Formatif'],
                    ['id' => 'ulangan_bab', 'label' => 'Ulangan Bab atau Materi'],
                    ['id' => 'remedial', 'label' => 'Remedial'],
                    ['id' => 'latihan_evaluasi', 'label' => 'Latihan Evaluasi'],
                ],
                'boss_characters' => [
                    ['id' => 'rakus-maximus', 'name' => 'Rakus Maximus'],
                    ['id' => 'robot-glitch', 'name' => 'Robot Glitch'],
                    ['id' => 'virus-lambda', 'name' => 'Virus Lambda'],
                    ['id' => 'bugzilla', 'name' => 'Bugzilla Compiler'],
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quiz_type' => 'required|string',
            'title' => 'required|string|max:255',
            'topic' => 'required|string|max:255',
            'classroom_id' => 'required|string',
            'official_participant_ids' => 'required|array|min:1',
            'kkm' => 'required|numeric|min:1|max:100',
            'question_count' => 'required|integer|min:1',
            'duration_minutes' => 'required|integer|min:1',
            'initial_boss_hp' => 'required|numeric|min:1',
            'boss' => 'required|array',
            'settings' => 'sometimes|array',
        ]);

        $id = 'uhg-'.Str::uuid();
        $official = count($validated['official_participant_ids']);
        $session = [
            'id' => $id,
            'quiz_type' => $validated['quiz_type'],
            'title' => $validated['title'],
            'topic' => $validated['topic'],
            'classroom_id' => $validated['classroom_id'],
            'official_participant_ids' => $validated['official_participant_ids'],
            'official_count' => $official,
            'kkm' => (float) $validated['kkm'],
            'question_count' => (int) $validated['question_count'],
            'duration_minutes' => (int) $validated['duration_minutes'],
            'initial_boss_hp' => (float) $validated['initial_boss_hp'],
            'boss_hp_exact' => (float) $validated['initial_boss_hp'],
            'ketuntasan_exact' => 0.0,
            'passed_count' => 0,
            'boss' => $validated['boss'],
            'settings' => $validated['settings'] ?? [],
            'status' => 'waiting',
            'outcome' => 'ongoing',
            'config_locked' => false,
            'academic_locked' => false,
            'learning_mode' => false,
            'participants' => array_map(fn ($pid) => [
                'id' => $pid,
                'academic_score' => 0,
                'correct' => 0,
                'answered' => 0,
                'reached_kkm' => false,
            ], $validated['official_participant_ids']),
            'seen_answer_keys' => [],
            'join_code' => strtoupper(Str::random(6)),
        ];

        self::$sessions[$id] = $session;

        return response()->json(['status' => 'success', 'data' => $this->present($session)], 201);
    }

    public function show(string $id): JsonResponse
    {
        $session = $this->find($id);

        return response()->json(['status' => 'success', 'data' => $this->present($session)]);
    }

    public function preview(Request $request, string $id): JsonResponse
    {
        $session = $this->find($id);
        $kind = $request->input('kind', 'arena');

        return response()->json([
            'status' => 'success',
            'data' => [
                'preview' => true,
                'kind' => $kind,
                'preview_id' => 'preview-'.$id.'-'.Str::random(4),
                'source_session_id' => $id,
                'affects_active_session' => false,
                'boss' => $session['boss'],
                'title' => $session['title'],
                'hp_display' => BossBattleEngine::displayRound((float) $session['initial_boss_hp']),
            ],
        ]);
    }

    public function start(string $id): JsonResponse
    {
        $session = $this->find($id);
        $session['status'] = 'active';
        $session['config_locked'] = true;
        $session['locked_config'] = [
            'classroom_id' => $session['classroom_id'],
            'official_participant_ids' => $session['official_participant_ids'],
            'kkm' => $session['kkm'],
            'question_source' => $session['settings']['question_source'] ?? 'bank_soal',
            'quiz_type' => $session['quiz_type'],
            'boss_snapshot' => $session['boss'],
        ];
        self::$sessions[$id] = $session;

        return response()->json(['status' => 'success', 'data' => $this->present($session)]);
    }

    public function answer(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'participant_id' => 'required|string',
            'question_id' => 'required|string',
            'option_index' => 'required|integer',
            'is_correct' => 'required|boolean',
            'client_event_id' => 'nullable|string',
        ]);

        $session = $this->find($id);
        if ($session['config_locked'] !== true && $session['status'] === 'waiting') {
            return response()->json(['message' => 'Battle belum dimulai.'], 422);
        }

        $session = BossBattleEngine::applyAnswer($session, $validated);
        self::$sessions[$id] = $session;
        if (($session['outcome'] ?? '') !== 'ongoing') {
            self::$history[$id] = [
                'boss_snapshot' => $session['boss'],
                'kkm' => $session['kkm'],
                'official_count' => $session['official_count'],
                'outcome' => $session['outcome'],
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->present($session),
            'duplicate' => (bool) ($session['duplicate'] ?? false),
            'visual_attack' => $session['visual_attack'] ?? null,
        ]);
    }

    public function expire(string $id): JsonResponse
    {
        $session = $this->find($id);
        $passed = (int) $session['passed_count'];
        $official = (int) $session['official_count'];
        $session['outcome'] = BossBattleEngine::resolveOutcome($passed, $official, true);
        $session['status'] = 'completed';
        $session['academic_locked'] = true;
        $session['boss_pose'] = $session['outcome'] === 'class_victory' ? 'defeated' : 'laugh';
        self::$sessions[$id] = $session;
        self::$history[$id] = [
            'boss_snapshot' => $session['boss'],
            'kkm' => $session['kkm'],
            'official_count' => $session['official_count'],
            'outcome' => $session['outcome'],
        ];

        return response()->json(['status' => 'success', 'data' => $this->present($session)]);
    }

    public function learningMode(string $id): JsonResponse
    {
        $session = $this->find($id);
        if (($session['outcome'] ?? 'ongoing') === 'ongoing') {
            return response()->json(['message' => 'Mode belajar hanya setelah hasil ditetapkan.'], 422);
        }
        $session['learning_mode'] = true;
        $session['academic_locked'] = true;
        self::$sessions[$id] = $session;

        return response()->json(['status' => 'success', 'data' => $this->present($session)]);
    }

    public function report(string $id): JsonResponse
    {
        $session = $this->find($id);
        $mvp = BossBattleEngine::computeMvp($session['participants'], (int) $session['question_count']);
        $history = self::$history[$id] ?? [
            'boss_snapshot' => $session['boss'],
            'kkm' => $session['kkm'],
            'official_count' => $session['official_count'],
            'outcome' => $session['outcome'],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'session' => $this->present($session),
                'mvp' => $mvp,
                'historical_config' => $history,
                'remedial_candidates' => array_values(array_filter(
                    $session['participants'],
                    fn ($p) => empty($p['reached_kkm'])
                )),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $session = $this->find($id);
        if (! empty($session['config_locked'])) {
            return response()->json([
                'message' => 'Konfigurasi terkunci. Hentikan sesi atau buat sesi baru.',
            ], 409);
        }
        foreach (['title', 'topic', 'kkm', 'quiz_type'] as $field) {
            if ($request->has($field)) {
                $session[$field] = $request->input($field);
            }
        }
        self::$sessions[$id] = $session;

        return response()->json(['status' => 'success', 'data' => $this->present($session)]);
    }

    /** @return array<string, mixed> */
    private function find(string $id): array
    {
        if (! isset(self::$sessions[$id])) {
            abort(404, 'Sesi ulangan gamifikasi tidak ditemukan.');
        }

        return self::$sessions[$id];
    }

    /** @param array<string, mixed> $session */
    private function present(array $session): array
    {
        $ketuntasan = (float) ($session['ketuntasan_exact'] ?? 0);
        $hp = (float) ($session['boss_hp_exact'] ?? $session['initial_boss_hp']);

        return [
            'id' => $session['id'],
            'quiz_type' => $session['quiz_type'],
            'title' => $session['title'],
            'topic' => $session['topic'],
            'boss' => $session['boss'],
            'status' => $session['status'],
            'outcome' => $session['outcome'],
            'join_code' => $session['join_code'] ?? null,
            'kkm' => $session['kkm'],
            'official_count' => $session['official_count'],
            'passed_count' => $session['passed_count'] ?? 0,
            'not_passed_count' => max(0, (int) $session['official_count'] - (int) ($session['passed_count'] ?? 0)),
            'ketuntasan_exact' => $ketuntasan,
            'ketuntasan_display' => BossBattleEngine::displayRound($ketuntasan),
            'initial_boss_hp' => $session['initial_boss_hp'],
            'boss_hp_exact' => $hp,
            'boss_hp_display' => BossBattleEngine::displayRound($hp),
            'config_locked' => (bool) $session['config_locked'],
            'academic_locked' => (bool) ($session['academic_locked'] ?? false),
            'learning_mode' => (bool) ($session['learning_mode'] ?? false),
            'boss_pose' => $session['boss_pose'] ?? 'idle',
        ];
    }
}
