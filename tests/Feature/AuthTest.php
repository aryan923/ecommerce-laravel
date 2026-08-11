<?php

namespace Tests\Feature;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful customer registration.
     */
    public function test_user_registration_success(): void
    {
        $payload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'mobile' => '+1234567890',
            'password' => 'SecretPassword123!',
            'password_confirmation' => 'SecretPassword123!',
            'terms_accepted' => true,
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User registered successfully.',
                'errors' => null,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'first_name', 'last_name', 'email', 'mobile', 'role', 'status'],
                    'token',
                    'token_type',
                ],
                'errors',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'mobile' => '+1234567890',
            'status' => 'active',
            'role' => 'customer',
        ]);
    }

    /**
     * Test registration fails with duplicate email.
     */
    public function test_user_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'john.doe@example.com']);

        $payload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'password' => 'SecretPassword123!',
            'password_confirmation' => 'SecretPassword123!',
            'terms_accepted' => true,
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
            ])
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test customer login with email.
     */
    public function test_user_login_with_email_success(): void
    {
        $user = User::factory()->create([
            'email' => 'john.doe@example.com',
            'password' => Hash::make('SecretPassword123!'),
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'john.doe@example.com',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonStructure([
                'data' => ['token', 'token_type', 'user'],
            ]);
    }

    /**
     * Test customer login with mobile.
     */
    public function test_user_login_with_mobile_success(): void
    {
        $user = User::factory()->create([
            'mobile' => '+1234567890',
            'password' => Hash::make('SecretPassword123!'),
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => '+1234567890',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ]);
    }

    /**
     * Test login fails with incorrect password.
     */
    public function test_user_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'email' => 'john.doe@example.com',
            'password' => Hash::make('SecretPassword123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'john.doe@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    /**
     * Test login fails for suspended user account.
     */
    public function test_user_login_fails_when_suspended(): void
    {
        User::factory()->create([
            'email' => 'john.doe@example.com',
            'password' => Hash::make('SecretPassword123!'),
            'status' => 'suspended',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'john.doe@example.com',
            'password' => 'SecretPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    /**
     * Test authenticated customer profile endpoint.
     */
    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                    ],
                ],
            ]);
    }

    /**
     * Test logout revokes token.
     */
    public function test_user_logout_revokes_token(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        $this->assertCount(0, $user->fresh()->tokens);
    }

    /**
     * Test forgot password generates OTP record.
     */
    public function test_forgot_password_generates_otp(): void
    {
        User::factory()->create(['email' => 'john.doe@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'identifier' => 'john.doe@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'If the account exists, a password reset code has been sent.',
            ]);

        $this->assertDatabaseHas('otps', [
            'identifier' => 'john.doe@example.com',
            'type' => 'password_reset',
        ]);
    }

    /**
     * Test password reset using valid OTP code.
     */
    public function test_reset_password_with_valid_otp_success(): void
    {
        $user = User::factory()->create(['email' => 'john.doe@example.com']);
        $otpCode = '123456';

        Otp::create([
            'identifier' => 'john.doe@example.com',
            'code' => $otpCode,
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'identifier' => 'john.doe@example.com',
            'otp_code' => $otpCode,
            'password' => 'NewSecretPassword123!',
            'password_confirmation' => 'NewSecretPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password reset successfully.',
            ]);

        $this->assertTrue(Hash::check('NewSecretPassword123!', $user->fresh()->password));
    }
}
