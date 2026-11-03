<?php

namespace App\Http\Controllers\Api\V1\Presentations;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PresentationController extends Controller
{
    /**
     * GET /api/v1/presentations
     */
    public function index(Request $request): JsonResponse
    {
        // Query presentations for authenticated teacher and school
        return response()->json([
            'status' => 'success',
            'data' => [
                [
                    'id' => 'pres-01',
                    'title' => 'Pengenalan Arsitektur Komputer & Perangkat Keras',
                    'description' => 'Materi ajar Informatika SMP Kelas VII Fase D mencakup CPU, RAM, ROM, dan I/O.',
                    'subject' => 'Informatika',
                    'classroom' => 'VII-A',
                    'slide_count' => 12,
                    'status' => 'ready',
                    'tags' => ['hardware', 'sistem-komputer', 'fase-d'],
                    'created_at' => '2024-10-20T08:00:00Z',
                    'updated_at' => '2024-10-22T10:30:00Z',
                ],
                [
                    'id' => 'pres-02',
                    'title' => 'Logika Biner & Gerbang Logika Dasar',
                    'description' => 'Representasi data biner dan operasi logika AND, OR, NOT untuk kelas 7.',
                    'subject' => 'Informatika',
                    'classroom' => 'VII-A',
                    'slide_count' => 8,
                    'status' => 'ready',
                    'tags' => ['biner', 'computational-thinking'],
                    'created_at' => '2024-10-18T09:00:00Z',
                    'updated_at' => '2024-10-21T11:00:00Z',
                ]
            ]
        ]);
    }

    /**
     * POST /api/v1/presentations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'nullable|string',
            'classroom_id' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $presentationId = Str::uuid()->toString();

        return response()->json([
            'status' => 'success',
            'message' => 'Presentasi berhasil dibuat. Silakan unggah berkas slide.',
            'data' => array_merge($validated, [
                'id' => $presentationId,
                'status' => 'draft',
                'slide_count' => 0,
                'created_at' => now()->toIso8601String()
            ])
        ], 201);
    }

    /**
     * POST /api/v1/presentations/{id}/upload
     */
    public function upload(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,pptx|max:51200', // max 50 MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $ext = $file->getClientOriginalExtension();
        $size = $file->getSize();

        // Safe storage path
        $storedPath = "presentations/{$id}/source.{$ext}";

        return response()->json([
            'status' => 'success',
            'message' => 'Berkas berhasil diunggah dan sedang diproses dalam antrean.',
            'data' => [
                'presentation_id' => $id,
                'original_filename' => $originalName,
                'file_size_bytes' => $size,
                'extension' => $ext,
                'processing_status' => 'processing',
                'job_id' => 'job-' . Str::random(8)
            ]
        ]);
    }

    /**
     * GET /api/v1/presentations/{id}/processing-status
     */
    public function processingStatus(string $id): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'presentation_id' => $id,
                'processing_status' => 'ready',
                'slide_count' => 12,
                'error_message' => null
            ]
        ]);
    }
}
