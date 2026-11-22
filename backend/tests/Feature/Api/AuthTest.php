<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Session middleware is only applied to API requests from Sanctum stateful domains.
        $this->withHeader('Referer', 'http://localhost:3000');
    }

    private function registerPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'secret-password-123',
            'password_confirmation' => 'secret-password-123',
        ], $overrides);
    }

    public function test_register_creates_user_and_logs_in(): void
    {
        $this->postJson('/api/register', $this->registerPayload())
            ->assertCreated()
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonMissingPath('user.password');

        $user = User::where('email', 'jane@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('secret-password-123', $user->password));
        $this->assertAuthenticatedAs($user);
    }

    public function test_register_validation_errors(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/register', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
        $this->postJson('/api/register', $this->registerPayload(['email' => 'taken@example.com']))
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/register', $this->registerPayload(['password_confirmation' => 'different']))
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->postJson('/api/register', $this->registerPayload(['email' => 'Upper@Example.com']))
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/register', $this->registerPayload(['password' => 'short', 'password_confirmation' => 'short']))
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_register_is_for_guests_only(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/register', $this->registerPayload())->assertStatus(302);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertOk()->assertJsonPath('user.id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_with_bad_credentials_returns_422(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/login', ['email' => 'nobody@example.com', 'password' => 'x'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertGuest();
    }

    public function test_login_requires_email_and_password(): void
    {
        $this->postJson('/api/login', [])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
        $this->postJson('/api/login', ['email' => 'nope', 'password' => 'x'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_login_is_rate_limited_after_five_failures(): void
    {
        $user = User::factory()->create(['password' => Hash::make('right-password')]);
        RateLimiter::clear(strtolower($user->email) . '|127.0.0.1');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable();
        }

        $response = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'right-password'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertStringContainsString('Too many login attempts', $response->json('errors.email.0'));
        $this->assertGuest();
    }

    public function test_login_is_for_guests_only(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(302);
    }

    public function test_logout_requires_authentication(): void
    {
        $this->postJson('/api/logout')->assertUnauthorized();
    }

    public function test_logout_logs_user_out(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/logout')->assertOk()->assertJsonPath('message', 'Logged out');

        $this->assertGuest('web');
    }

    public function test_user_endpoint_returns_401_for_guests_and_user_when_authenticated(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();

        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email)
            ->assertJsonMissingPath('password')
            ->assertJsonMissingPath('remember_token');
    }

    public function test_password_update_requires_authentication(): void
    {
        $this->putJson('/api/password', [])->assertUnauthorized();
    }

    public function test_password_update_changes_password_and_returns_json(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-1')]);

        $this->actingAs($user)->putJson('/api/password', [
            'current_password' => 'old-password-1',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertOk()->assertJson(['message' => 'Password updated']);

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_password_update_requires_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password-1')]);

        $this->actingAs($user)->putJson('/api/password', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['current_password', 'password']);

        $this->actingAs($user)->putJson('/api/password', [
            'current_password' => 'wrong',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['current_password']);

        $this->actingAs($user)->putJson('/api/password', [
            'current_password' => 'old-password-1',
            'password' => 'new-password-123',
            'password_confirmation' => 'mismatch',
        ])->assertUnprocessable()->assertJsonValidationErrors(['password']);

        $this->assertTrue(Hash::check('old-password-1', $user->fresh()->password));
    }
}
