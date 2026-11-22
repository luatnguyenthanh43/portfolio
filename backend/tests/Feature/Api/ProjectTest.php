<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\User;
use Database\Factories\ProjectFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'My Project',
            'company' => 'Acme',
            'role' => 'Lead',
            'summary' => 'Short summary',
            'description' => '<p>Desc</p>',
            'tech_stack' => ['Laravel', 'React'],
            'image_url' => 'https://example.com/i.png',
            'demo_url' => 'https://example.com/demo',
            'github_url' => 'https://github.com/x/y',
            'status' => 'Completed',
            'featured' => true,
            'category' => 'Web',
            'year' => '2024',
            'order' => 3,
        ], $overrides);
    }

    private function login(): void
    {
        $this->actingAs(User::factory()->create());
    }

    public function test_endpoints_require_authentication(): void
    {
        $project = ProjectFactory::new()->create();

        $this->postJson('/api/portfolio/projects', $this->payload())->assertUnauthorized();
        $this->putJson("/api/portfolio/projects/{$project->id}", $this->payload())->assertUnauthorized();
        $this->deleteJson("/api/portfolio/projects/{$project->id}")->assertUnauthorized();
        $this->assertDatabaseCount('projects', 1);
    }

    public function test_index_and_show_routes_do_not_exist(): void
    {
        $this->login();
        $project = ProjectFactory::new()->create();

        $this->getJson('/api/portfolio/projects')->assertStatus(405);
        $this->getJson("/api/portfolio/projects/{$project->id}")->assertStatus(405);
    }

    public function test_store_creates_project_and_round_trips_casts(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', $this->payload())
            ->assertCreated()
            ->assertJsonPath('title', 'My Project')
            ->assertJsonPath('tech_stack', ['Laravel', 'React'])
            ->assertJsonPath('featured', true)
            ->assertJsonPath('order', 3)
            ->assertJsonStructure(['id', 'created_at', 'updated_at']);

        $project = Project::firstOrFail();
        $this->assertSame(['Laravel', 'React'], $project->tech_stack);
        $this->assertTrue($project->featured);
    }

    public function test_store_with_only_title_uses_defaults(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', ['title' => 'Min'])
            ->assertCreated();

        $this->assertDatabaseHas('projects', ['title' => 'Min', 'order' => 0]);
    }

    public function test_store_accepts_null_nullable_fields(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', $this->payload([
            'company' => null, 'role' => null, 'summary' => null, 'tech_stack' => null,
            'image_url' => null, 'demo_url' => null, 'github_url' => null, 'category' => null, 'year' => null,
        ]))->assertCreated();
    }

    public function test_store_validation_errors(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', [])
            ->assertUnprocessable()->assertJsonValidationErrors(['title']);

        $this->postJson('/api/portfolio/projects', $this->payload([
            'summary' => str_repeat('a', 301),
            'image_url' => 'nope',
            'demo_url' => 'nope',
            'github_url' => 'nope',
            'tech_stack' => 'not-array',
            'featured' => 'maybe',
            'order' => -1,
            'year' => '12345678901',
        ]))->assertUnprocessable()
            ->assertJsonValidationErrors(['summary', 'image_url', 'demo_url', 'github_url', 'tech_stack', 'featured', 'order', 'year']);

        $this->postJson('/api/portfolio/projects', $this->payload(['tech_stack' => [['x'], str_repeat('a', 101)]]))
            ->assertUnprocessable()->assertJsonValidationErrors(['tech_stack.0', 'tech_stack.1']);

        $this->assertDatabaseCount('projects', 0);
    }

    public function test_summary_of_300_chars_is_accepted(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', $this->payload(['summary' => str_repeat('a', 300)]))->assertCreated();
    }

    public function test_description_is_purified_on_store_and_update(): void
    {
        $this->login();

        $dirty = '<p onclick="x()">Hi</p><script>alert(1)</script><a href="https://e.com">l</a>';

        $id = $this->postJson('/api/portfolio/projects', $this->payload(['description' => $dirty]))
            ->assertCreated()
            ->assertJsonPath('description', '<p>Hi</p><a href="https://e.com" target="_blank" rel="noreferrer noopener">l</a>')
            ->json('id');

        $this->putJson("/api/portfolio/projects/{$id}", $this->payload(['description' => '<p>ok</p><script>x</script>']))
            ->assertOk()->assertJsonPath('description', '<p>ok</p>');
    }

    public function test_null_description_is_stored_as_empty_string(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/projects', $this->payload(['description' => null]))
            ->assertCreated()->assertJsonPath('description', '');
    }

    public function test_update_changes_project(): void
    {
        $this->login();
        $project = ProjectFactory::new()->create(['title' => 'Old', 'featured' => false]);

        $this->putJson("/api/portfolio/projects/{$project->id}", $this->payload(['title' => 'New', 'featured' => true]))
            ->assertOk()
            ->assertJsonPath('id', $project->id)
            ->assertJsonPath('title', 'New')
            ->assertJsonPath('featured', true);

        $this->assertDatabaseHas('projects', ['id' => $project->id, 'title' => 'New', 'featured' => 1]);
    }

    public function test_update_validation_and_not_found(): void
    {
        $this->login();
        $project = ProjectFactory::new()->create();

        $this->putJson("/api/portfolio/projects/{$project->id}", ['title' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors(['title']);
        $this->putJson('/api/portfolio/projects/9999', $this->payload())->assertNotFound();
    }

    public function test_destroy_deletes_project(): void
    {
        $this->login();
        $project = ProjectFactory::new()->create();

        $this->deleteJson("/api/portfolio/projects/{$project->id}")->assertNoContent();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->deleteJson("/api/portfolio/projects/{$project->id}")->assertNotFound();
    }
}
