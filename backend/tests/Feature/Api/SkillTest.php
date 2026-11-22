<?php

namespace Tests\Feature\Api;

use App\Models\Skill;
use App\Models\User;
use Database\Factories\SkillFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillTest extends TestCase
{
    use RefreshDatabase;

    private function login(): void
    {
        $this->actingAs(User::factory()->create());
    }

    public function test_endpoints_require_authentication(): void
    {
        $skill = SkillFactory::new()->create();

        $this->postJson('/api/portfolio/skills', ['name' => 'PHP'])->assertUnauthorized();
        $this->putJson("/api/portfolio/skills/{$skill->id}", ['name' => 'PHP'])->assertUnauthorized();
        $this->deleteJson("/api/portfolio/skills/{$skill->id}")->assertUnauthorized();
        $this->postJson('/api/portfolio/skills/reorder', ['items' => []])->assertUnauthorized();
    }

    public function test_store_creates_skill(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/skills', ['name' => 'PHP', 'category' => 'Backend', 'order' => 2])
            ->assertCreated()
            ->assertJsonPath('name', 'PHP')
            ->assertJsonPath('category', 'Backend')
            ->assertJsonPath('order', 2);

        $this->assertDatabaseHas('skills', ['name' => 'PHP', 'category' => 'Backend', 'order' => 2]);
    }

    public function test_store_accepts_null_category_and_defaults_order(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/skills', ['name' => 'PHP', 'category' => null])->assertCreated();
        $this->assertDatabaseHas('skills', ['name' => 'PHP', 'category' => null, 'order' => 0]);
    }

    public function test_store_validation_errors(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/skills', [])->assertUnprocessable()->assertJsonValidationErrors(['name']);
        $this->postJson('/api/portfolio/skills', ['name' => str_repeat('a', 256), 'category' => str_repeat('a', 256), 'order' => -1])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'category', 'order']);
        $this->assertDatabaseCount('skills', 0);
    }

    public function test_update_and_destroy(): void
    {
        $this->login();
        $skill = SkillFactory::new()->create(['name' => 'Old']);

        $this->putJson("/api/portfolio/skills/{$skill->id}", ['name' => 'New', 'category' => 'X'])
            ->assertOk()->assertJsonPath('name', 'New');
        $this->assertDatabaseHas('skills', ['id' => $skill->id, 'name' => 'New', 'category' => 'X']);

        $this->putJson("/api/portfolio/skills/{$skill->id}", [])->assertUnprocessable();
        $this->putJson('/api/portfolio/skills/9999', ['name' => 'x'])->assertNotFound();

        $this->deleteJson("/api/portfolio/skills/{$skill->id}")->assertNoContent();
        $this->assertDatabaseMissing('skills', ['id' => $skill->id]);
    }

    public function test_reorder_persists_new_order(): void
    {
        $this->login();
        $a = SkillFactory::new()->create(['order' => 0]);
        $b = SkillFactory::new()->create(['order' => 1]);

        $this->postJson('/api/portfolio/skills/reorder', [
            'items' => [['id' => $a->id, 'order' => 5], ['id' => $b->id, 'order' => 4]],
        ])->assertOk()->assertExactJson(['ok' => true]);

        $this->assertSame(5, $a->fresh()->order);
        $this->assertSame(4, $b->fresh()->order);
    }

    public function test_reorder_validates_payload(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/skills/reorder', [])->assertUnprocessable()->assertJsonValidationErrors(['items']);
        $this->postJson('/api/portfolio/skills/reorder', ['items' => [['id' => 'x', 'order' => 'y']]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.id', 'items.0.order']);
        $this->postJson('/api/portfolio/skills/reorder', ['items' => [['order' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.id']);
    }

    public function test_reorder_rejects_unknown_id_and_negative_order(): void
    {
        $this->login();
        $skill = SkillFactory::new()->create(['order' => 0]);

        $this->postJson('/api/portfolio/skills/reorder', [
            'items' => [['id' => 9999, 'order' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.id']);

        $this->postJson('/api/portfolio/skills/reorder', [
            'items' => [['id' => $skill->id, 'order' => -3]],
        ])->assertStatus(422)->assertJsonValidationErrors(['items.0.order']);

        $this->assertSame(0, Skill::find($skill->id)->order);
    }
}
