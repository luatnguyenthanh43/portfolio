<?php

namespace Tests\Feature\Api;

use App\Models\Experience;
use App\Models\User;
use Database\Factories\ExperienceFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExperienceTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'company' => 'Acme',
            'role' => 'Engineer',
            'start_date' => '2022-01',
            'end_date' => null,
            'description' => 'Did things',
            'location' => 'Remote',
            'employment_type' => 'Full-time',
            'tech_stack' => ['PHP', 'Vue'],
            'key_achievements' => ['Shipped X', 'Cut costs'],
            'order' => 1,
        ], $overrides);
    }

    private function login(): void
    {
        $this->actingAs(User::factory()->create());
    }

    public function test_endpoints_require_authentication(): void
    {
        $e = ExperienceFactory::new()->create();

        $this->postJson('/api/portfolio/experiences', $this->payload())->assertUnauthorized();
        $this->putJson("/api/portfolio/experiences/{$e->id}", $this->payload())->assertUnauthorized();
        $this->deleteJson("/api/portfolio/experiences/{$e->id}")->assertUnauthorized();
        $this->postJson('/api/portfolio/experiences/reorder', ['items' => []])->assertUnauthorized();
    }

    public function test_store_creates_experience_and_round_trips_array_casts(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/experiences', $this->payload())
            ->assertCreated()
            ->assertJsonPath('company', 'Acme')
            ->assertJsonPath('tech_stack', ['PHP', 'Vue'])
            ->assertJsonPath('key_achievements', ['Shipped X', 'Cut costs']);

        $e = Experience::firstOrFail();
        $this->assertSame(['PHP', 'Vue'], $e->tech_stack);
        $this->assertSame(['Shipped X', 'Cut costs'], $e->key_achievements);
    }

    public function test_store_allows_null_start_date_and_nullable_arrays(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/experiences', $this->payload([
            'start_date' => null, 'tech_stack' => null, 'key_achievements' => null,
        ]))->assertCreated()->assertJsonPath('tech_stack', null);
    }

    public function test_store_validation_errors(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/experiences', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['company', 'role']);
        $this->postJson('/api/portfolio/experiences', $this->payload([
            'tech_stack' => 'x', 'key_achievements' => 'y', 'order' => -1, 'employment_type' => str_repeat('a', 101),
        ]))->assertUnprocessable()
            ->assertJsonValidationErrors(['tech_stack', 'key_achievements', 'order', 'employment_type']);
        $this->postJson('/api/portfolio/experiences', $this->payload(['tech_stack' => [str_repeat('a', 101)]]))
            ->assertUnprocessable()->assertJsonValidationErrors(['tech_stack.0']);
        $this->assertDatabaseCount('experiences', 0);
    }

    public function test_update_and_destroy(): void
    {
        $this->login();
        $e = ExperienceFactory::new()->create(['company' => 'Old']);

        $this->putJson("/api/portfolio/experiences/{$e->id}", $this->payload(['company' => 'New']))
            ->assertOk()->assertJsonPath('company', 'New');
        $this->assertDatabaseHas('experiences', ['id' => $e->id, 'company' => 'New']);

        $this->putJson("/api/portfolio/experiences/{$e->id}", [])->assertUnprocessable();
        $this->putJson('/api/portfolio/experiences/9999', $this->payload())->assertNotFound();

        $this->deleteJson("/api/portfolio/experiences/{$e->id}")->assertNoContent();
        $this->assertDatabaseMissing('experiences', ['id' => $e->id]);
    }

    public function test_description_is_purified(): void
    {
        // BUG: ExperienceController never calls HtmlSanitizer::purify(). This test documents the
        // *desired* behaviour (scripts stripped) and fails until the controller is fixed.
        $this->login();

        $response = $this->postJson('/api/portfolio/experiences', $this->payload([
            'description' => '<p>Hi</p><script>alert(1)</script>',
        ]))->assertCreated();

        $this->assertStringNotContainsString('<script>', $response->json('description'));
    }

    public function test_reorder_persists_and_validates(): void
    {
        $this->login();
        $a = ExperienceFactory::new()->create(['order' => 0]);
        $b = ExperienceFactory::new()->create(['order' => 1]);

        $this->postJson('/api/portfolio/experiences/reorder', [
            'items' => [['id' => $a->id, 'order' => 1], ['id' => $b->id, 'order' => 0]],
        ])->assertOk()->assertExactJson(['ok' => true]);
        $this->assertSame(1, $a->fresh()->order);
        $this->assertSame(0, $b->fresh()->order);

        $this->postJson('/api/portfolio/experiences/reorder', [])->assertUnprocessable()->assertJsonValidationErrors(['items']);
        $this->postJson('/api/portfolio/experiences/reorder', ['items' => [['id' => 9999, 'order' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.id']);
        $this->postJson('/api/portfolio/experiences/reorder', ['items' => [['id' => $a->id, 'order' => -1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.order']);
    }
}
