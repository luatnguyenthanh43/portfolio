<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://localhost:3000');
    }

    public function test_forgot_password_sends_notification_for_known_email(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_password_validates_email(): void
    {
        $this->postJson('/api/forgot-password', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->postJson('/api/forgot-password', ['email' => 'not-an-email'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_does_not_notify_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);

        Notification::assertNothingSent();
    }

    public function test_reset_link_handles_frontend_url_with_trailing_slash(): void
    {
        config(['app.frontend_url' => 'https://portfolio.example.com/']);
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function ($n) use ($user) {
            $url = $n->toMail($user)->actionUrl;

            return str_starts_with($url, 'https://portfolio.example.com/reset-password?token=')
                && ! str_contains($url, '.com//');
        });
    }

    public function test_reset_password_with_valid_token_changes_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-1')]);
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-1')]);

        $this->postJson('/api/reset-password', [
            'token' => 'bad-token',
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->assertTrue(Hash::check('old-password-1', $user->fresh()->password));
    }

    public function test_reset_password_validates_payload(): void
    {
        $this->postJson('/api/reset-password', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['token', 'email', 'password']);
    }
}
