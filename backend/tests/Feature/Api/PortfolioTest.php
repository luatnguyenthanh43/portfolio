<?php

namespace Tests\Feature\Api;

use App\Models\PortfolioProfile;
use App\Models\User;
use Database\Factories\CertificationFactory;
use Database\Factories\EducationFactory;
use Database\Factories\ExperienceFactory;
use Database\Factories\PortfolioProfileFactory;
use Database\Factories\ProjectFactory;
use Database\Factories\SkillFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    private function validProfile(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'title' => 'Developer',
            'bio' => '<p>Hello</p>',
            'avatar_url' => 'https://example.com/a.png',
            'email' => 'jane@example.com',
            'phone' => '123',
            'location' => 'Hanoi',
            'github_url' => 'https://github.com/jane',
            'linkedin_url' => 'https://linkedin.com/in/jane',
        ], $overrides);
    }

    public function test_tests_run_on_in_memory_sqlite(): void
    {
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
    }

    public function test_index_is_public_and_empty_db_returns_null_profile_and_empty_lists(): void
    {
        $this->getJson('/api/portfolio')
            ->assertOk()
            ->assertExactJsonStructure(['profile', 'projects', 'skills', 'experiences', 'educations', 'certifications'])
            ->assertJson([
                'profile' => null,
                'projects' => [],
                'skills' => [],
                'experiences' => [],
                'educations' => [],
                'certifications' => [],
            ]);
    }

    public function test_index_returns_all_sections_ordered_by_order(): void
    {
        PortfolioProfileFactory::new()->create(['name' => 'Jane']);
        ProjectFactory::new()->create(['title' => 'B', 'order' => 2]);
        ProjectFactory::new()->create(['title' => 'A', 'order' => 1]);
        SkillFactory::new()->create(['name' => 'Two', 'order' => 2]);
        SkillFactory::new()->create(['name' => 'One', 'order' => 1]);
        ExperienceFactory::new()->create(['company' => 'Second', 'order' => 2]);
        ExperienceFactory::new()->create(['company' => 'First', 'order' => 1]);
        EducationFactory::new()->create(['institution' => 'Second', 'order' => 2]);
        EducationFactory::new()->create(['institution' => 'First', 'order' => 1]);
        CertificationFactory::new()->create(['title' => 'Second', 'order' => 2]);
        CertificationFactory::new()->create(['title' => 'First', 'order' => 1]);

        $response = $this->getJson('/api/portfolio')->assertOk();

        $this->assertSame('Jane', $response->json('profile.name'));
        $this->assertSame(['A', 'B'], $response->json('projects.*.title'));
        $this->assertSame(['One', 'Two'], $response->json('skills.*.name'));
        $this->assertSame(['First', 'Second'], $response->json('experiences.*.company'));
        $this->assertSame(['First', 'Second'], $response->json('educations.*.institution'));
        $this->assertSame(['First', 'Second'], $response->json('certifications.*.title'));
        $this->assertArrayHasKey('image_url', $response->json('certifications.0'));
        $this->assertArrayNotHasKey('image_path', $response->json('certifications.0'));
    }

    public function test_update_profile_requires_authentication(): void
    {
        $this->putJson('/api/portfolio/profile', $this->validProfile())->assertUnauthorized();
        $this->assertDatabaseCount('profile', 0);
    }

    public function test_update_profile_creates_the_row_when_missing(): void
    {
        $this->actingAs(User::factory()->create());

        $this->putJson('/api/portfolio/profile', $this->validProfile())
            ->assertOk()
            ->assertJsonPath('name', 'Jane Doe')
            ->assertJsonPath('title', 'Developer')
            ->assertJsonStructure(['id', 'created_at', 'updated_at']);

        $this->assertDatabaseCount('profile', 1);
        $this->assertDatabaseHas('profile', ['name' => 'Jane Doe', 'email' => 'jane@example.com']);
    }

    public function test_update_profile_updates_the_single_existing_row(): void
    {
        $this->actingAs(User::factory()->create());
        $existing = PortfolioProfileFactory::new()->create(['name' => 'Old']);

        $this->putJson('/api/portfolio/profile', $this->validProfile(['name' => 'New']))
            ->assertOk()
            ->assertJsonPath('id', $existing->id);

        $this->assertDatabaseCount('profile', 1);
        $this->assertSame('New', PortfolioProfile::first()->name);
    }

    public function test_update_profile_purifies_bio(): void
    {
        $this->actingAs(User::factory()->create());

        $bio = '<p onclick="x()">Hi</p><script>alert(1)</script><iframe src="https://e.com"></iframe><strong>b</strong>';
        $response = $this->putJson('/api/portfolio/profile', $this->validProfile(['bio' => $bio]))->assertOk();

        $this->assertSame('<p>Hi</p><strong>b</strong>', $response->json('bio'));
        $this->assertSame('<p>Hi</p><strong>b</strong>', PortfolioProfile::first()->bio);
    }

    public function test_update_profile_accepts_null_optional_fields(): void
    {
        $this->actingAs(User::factory()->create());

        $this->putJson('/api/portfolio/profile', [
            'name' => 'Jane',
            'title' => 'Dev',
            'bio' => null,
            'avatar_url' => null,
            'email' => null,
            'phone' => null,
            'location' => null,
            'github_url' => null,
            'linkedin_url' => null,
        ])->assertOk()->assertJsonPath('bio', null);
    }

    public function test_update_profile_validation_errors(): void
    {
        $this->actingAs(User::factory()->create());

        $this->putJson('/api/portfolio/profile', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'title']);

        $this->putJson('/api/portfolio/profile', $this->validProfile([
            'avatar_url' => 'nope',
            'email' => 'not-an-email',
            'github_url' => 'nope',
            'linkedin_url' => 'nope',
            'name' => str_repeat('a', 256),
        ]))->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar_url', 'email', 'github_url', 'linkedin_url', 'name']);

        $this->assertDatabaseCount('profile', 0);
    }
}
