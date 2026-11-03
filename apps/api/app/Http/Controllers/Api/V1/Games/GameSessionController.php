<?php

namespace App\Http\Controllers\Api\V1\Games;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameSessionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => []]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'gs-'.Str::random(8),
                'title' => $validated['title'],
                'type' => $validated['type'],
                'join_code' => strtoupper(Str::random(6)),
                'status' => 'waiting',
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'status' => 'waiting']]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id]]);
    }

    public function destroy(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'Sesi dihapus.', 'id' => $id]);
    }

    public function start(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'status' => 'active']]);
    }

    public function pause(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'status' => 'paused']]);
    }

    public function end(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'status' => 'completed']]);
    }

    public function answer(Request $request, string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'accepted' => true]]);
    }

    public function leaderboard(string $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['id' => $id, 'leaderboard' => []]]);
    }

    public function joinByCode(string $code): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['join_code' => $code, 'status' => 'waiting'],
        ]);
    }
}
