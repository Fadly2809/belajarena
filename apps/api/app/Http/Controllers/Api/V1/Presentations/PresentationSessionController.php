<?php

namespace App\Http\Controllers\Api\V1\Presentations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PresentationSessionController extends Controller
{
    /**
     * POST /api/v1/presentation-sessions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'presentation_id' => 'required|string',
            'classroom_id' => 'required|string',
            'title' => 'required|string|max:255',
        ]);

        $accessCode = strtoupper(Str::random(6)); // e.g., 'PRS849'

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi presentasi interaktif berhasil dibuat.',
            'data' => [
                'session_id' => 'ses-prs-' . Str::random(8),
                'presentation_id' => $validated['presentation_id'],
                'classroom_id' => $validated['classroom_id'],
                'title' => $validated['title'],
                'access_code' => $accessCode,
                'active_slide' => 1,
                'state_version' => 1,
                'status' => 'draft',
                'created_at' => now()->toIso8601String()
            ]
        ], 201);
    }

    /**
     * POST /api/v1/presentation-sessions/{id}/navigate
     */
    public function navigate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'slide_index' => 'required|integer|min:1',
            'current_version' => 'required|integer',
        ]);

        $newVersion = $validated['current_version'] + 1;
        $seq = (int) (microtime(true) * 1000);

        // In production, broadcasts to Reverb/Pusher channel: presence-session.{id}
        // Event: SlideChanged(sessionId, slideIndex, version, seq)

        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $id,
                'active_slide' => $validated['slide_index'],
                'state_version' => $newVersion,
                'seq' => $seq,
                'timestamp' => now()->toIso8601String()
            ]
        ]);
    }

    /**
     * POST /api/v1/presentation-sessions/{id}/heartbeat
     */
    public function heartbeat(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'participant_id' => 'required|string',
            'current_slide' => 'required|integer',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $id,
                'participant_id' => $validated['participant_id'],
                'last_heartbeat_at' => now()->toIso8601String(),
                'connection_status' => 'connected'
            ]
        ]);
    }

    /**
     * POST /api/v1/presentation-sessions/{id}/acknowledge-slide
     */
    public function acknowledgeSlide(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'participant_id' => 'required|string',
            'slide_index' => 'required|integer',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $id,
                'participant_id' => $validated['participant_id'],
                'acknowledged_slide' => $validated['slide_index'],
                'confirmed_at' => now()->toIso8601String()
            ]
        ]);
    }

    /**
     * POST /api/v1/presentation-sessions/{id}/votes
     */
    public function createVote(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'vote_type' => 'required|string|in:single_choice,multiple_choice,yes_no,true_false,rating_scale,short_text',
            'options' => 'required|array|min:2',
            'is_anonymous' => 'boolean',
            'time_limit_seconds' => 'nullable|integer',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => array_merge($validated, [
                'vote_id' => 'vote-' . Str::random(8),
                'session_id' => $id,
                'status' => 'open',
                'opened_at' => now()->toIso8601String()
            ])
        ], 201);
    }

    /**
     * GET /api/v1/presentation-sessions/{id}/report
     */
    public function getReport(string $id): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'session_id' => $id,
                'title' => 'Sesi Presentasi Interaktif Arsitektur Komputer',
                'classroom' => 'VII-A',
                'teacher' => 'Bapak Guru Informatika, S.Kom.',
                'date' => '24 Oktober 2024',
                'duration_minutes' => 45,
                'invited_count' => 30,
                'joined_count' => 28,
                'attendance_rate' => 93.3,
                'average_connectivity_rate' => 96.5,
                'slide_sync_rate' => 98.2,
                'votes_conducted' => 3,
                'total_responses' => 84,
                'created_at' => now()->toIso8601String()
            ]
        ]);
    }
}
