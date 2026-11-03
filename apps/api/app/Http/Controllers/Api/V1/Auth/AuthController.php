<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Domain\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Find user by email or username
        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Email/username atau password salah.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Akun Anda tidak aktif. Hubungi administrator.',
            ], 403);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Revoke old tokens (optional: keep last N)
        $user->tokens()->delete();

        $token = $user->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $token,
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * GET /api/v1/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'school');

        return response()->json([
            'data' => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    /**
     * PUT /api/v1/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        $user->tokens()->delete(); // Force re-login after password change

        return response()->json(['message' => 'Password berhasil diubah. Silakan login kembali.']);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'avatar_url' => $user->avatar_path
                ? asset('storage/' . $user->avatar_path)
                : null,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'roles' => $user->roles->pluck('name')->toArray(),
            'permissions' => $user->roles
                ->flatMap(fn ($r) => $r->permissions->pluck('name'))
                ->unique()
                ->values()
                ->toArray(),
            'school' => $user->relationLoaded('school') ? [
                'id' => $user->school->id,
                'name' => $user->school->name,
                'logo_url' => $user->school->logo_path
                    ? asset('storage/' . $user->school->logo_path)
                    : null,
            ] : null,
        ];
    }
}
