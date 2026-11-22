<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Factories\EducationFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EducationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'institution' => 'MIT',
            'degree' => 'BSc',
            'field_of_study' => 'CS',
            'start_date' => '2018',
            'end_date' => '2022',
            'description' => '<p>Studied</p>',
            'gpa' => '3.9',
            'order' => 1,
        ], $overrides);
    }

    private function login(): void
    {
        $this->actingAs(User::factory()->create());
    }

    public function test_endpoints_require_authentication(): void
    {
        $e = EducationFactory::new()->create();

        $this->postJson('/api/portfolio/educations', $this->payload())->assertUnauthorized();
        $this->putJson("/api/portfolio/educations/{$e->id}", $this->payload())->assertUnauthorized();
        $this->deleteJson("/api/portfolio/educations/{$e->id}")->assertUnauthorized();
        $this->postJson('/api/portfolio/educations/reorder', ['items' => []])->assertUnauthorized();
    }

    public function test_store_creates_education(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/educations', $this->payload())
            ->assertCreated()
            ->assertJsonPath('institution', 'MIT')
            ->assertJsonPath('gpa', '3.9');

        $this->assertDatabaseHas('educations', ['institution' => 'MIT', 'degree' => 'BSc']);
    }

    public function test_store_accepts_nulls_including_description(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/educations', [
            'institution' => 'MIT', 'degree' => null, 'field_of_study' => null, 'start_date' => null,
            'end_date' => null, 'description' => null, 'gpa' => null,
        ])->assertCreated()->assertJsonPath('description', null);
    }

    public function test_store_validation_errors(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/educations', [])->assertUnprocessable()->assertJsonValidationErrors(['institution']);
        $this->postJson('/api/portfolio/educations', $this->payload([
            'institution' => str_repeat('a', 256), 'gpa' => str_repeat('a', 51), 'order' => -1,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['institution', 'gpa', 'order']);
        $this->assertDatabaseCount('educations', 0);
    }

    public function test_description_is_purified_on_store_and_update(): void
    {
        $this->login();
        $dirty = '<p style="color:red" onclick="x()">Hi</p><script>alert(1)</script><iframe src="https://e.com"></iframe>';

        $id = $this->postJson('/api/portfolio/educations', $this->payload(['description' => $dirty]))
            ->assertCreated()->assertJsonPath('description', '<p>Hi</p>')->json('id');

        $this->putJson("/api/portfolio/educations/{$id}", $this->payload(['description' => $dirty . '<em>e</em>']))
            ->assertOk()->assertJsonPath('description', '<p>Hi</p><em>e</em>');
    }

    public function test_update_and_destroy(): void
    {
        $this->login();
        $e = EducationFactory::new()->create(['institution' => 'Old']);

        $this->putJson("/api/portfolio/educations/{$e->id}", $this->payload(['institution' => 'New']))
            ->assertOk()->assertJsonPath('institution', 'New');
        $this->assertDatabaseHas('educations', ['id' => $e->id, 'institution' => 'New']);

        $this->putJson("/api/portfolio/educations/{$e->id}", [])->assertUnprocessable();
        $this->putJson('/api/portfolio/educations/9999', $this->payload())->assertNotFound();

        $this->deleteJson("/api/portfolio/educations/{$e->id}")->assertNoContent();
        $this->assertDatabaseMissing('educations', ['id' => $e->id]);
    }

    public function test_reorder_persists_and_validates(): void
    {
        $this->login();
        $a = EducationFactory::new()->create(['order' => 0]);
        $b = EducationFactory::new()->create(['order' => 1]);

        $this->postJson('/api/portfolio/educations/reorder', [
            'items' => [['id' => $a->id, 'order' => 1], ['id' => $b->id, 'order' => 0]],
        ])->assertOk()->assertExactJson(['ok' => true]);
        $this->assertSame(1, $a->fresh()->order);
        $this->assertSame(0, $b->fresh()->order);

        $this->postJson('/api/portfolio/educations/reorder', [])->assertUnprocessable()->assertJsonValidationErrors(['items']);
        $this->postJson('/api/portfolio/educations/reorder', ['items' => [['id' => 9999, 'order' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.id']);
        $this->postJson('/api/portfolio/educations/reorder', ['items' => [['id' => $a->id, 'order' => -1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.order']);
    }
}
