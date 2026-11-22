<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccountProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Session middleware is only applied to API requests from Sanctum stateful domains.
        $this->withHeader('Referer', 'http://localhost:3000');
    }

    public function test_endpoints_require_authentication(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
        $this->patchJson('/api/profile', ['name' => 'x', 'email' => 'x@example.com'])->assertUnauthorized();
        $this->deleteJson('/api/profile', ['password' => 'password'])->assertUnauthorized();
    }

    public function test_show_returns_user_and_must_verify_flag(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('mustVerifyEmail', false)
            ->assertJsonMissingPath('user.password');
    }

    public function test_update_changes_name_and_email(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patchJson('/api/profile', ['name' => 'New Name', 'email' => 'new@example.com'])
            ->assertOk()
            ->assertJsonPath('user.name', 'New Name')
            ->assertJsonPath('user.email', 'new@example.com');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name', 'email' => 'new@example.com']);
    }

    public function test_changing_email_resets_verification(): void
    {
        $user = User::factory()->create();
        $this->assertNotNull($user->email_verified_at);

        $this->actingAs($user)->patchJson('/api/profile', ['name' => $user->name, 'email' => 'changed@example.com'])
            ->assertOk();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_keeping_same_email_preserves_verification(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patchJson('/api/profile', ['name' => 'Other', 'email' => $user->email])->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_update_validation_errors(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($user)->patchJson('/api/profile', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'email']);
        $this->actingAs($user)->patchJson('/api/profile', ['name' => 'x', 'email' => $other->email])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->actingAs($user)->patchJson('/api/profile', ['name' => 'x', 'email' => 'Upper@Example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->actingAs($user)->patchJson('/api/profile', ['name' => 'x', 'email' => 'not-an-email'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_destroy_requires_current_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('right-password')]);

        $this->actingAs($user)->deleteJson('/api/profile', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        $this->actingAs($user)->deleteJson('/api/profile', ['password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_destroy_deletes_account(): void
    {
        // BUG: ProfileController::destroy calls Auth::logout() while auth:sanctum has made the
        // RequestGuard the default guard, which has no logout() -> 500 and the user is not deleted.
        $user = User::factory()->create(['password' => Hash::make('right-password')]);

        $this->actingAs($user)->deleteJson('/api/profile', ['password' => 'right-password'])
            ->assertOk()->assertJsonPath('message', 'Account deleted');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
