<?php

namespace Tests\Feature\Api;

use App\Models\Certification;
use App\Models\User;
use Database\Factories\CertificationFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'AWS SAA',
            'issuer' => 'Amazon',
            'issue_date' => '2024-05',
            'credential_url' => 'https://example.com/cred',
            'description' => '<p>Cert</p>',
            'order' => 1,
        ], $overrides);
    }

    private function login(): void
    {
        $this->actingAs(User::factory()->create());
    }

    private function certWithImage(): Certification
    {
        $path = UploadedFile::fake()->image('old.png')->store('certifications', 'public');

        return CertificationFactory::new()->create(['image_path' => $path]);
    }

    public function test_endpoints_require_authentication(): void
    {
        $c = CertificationFactory::new()->create();

        $this->postJson('/api/portfolio/certifications', $this->payload())->assertUnauthorized();
        $this->putJson("/api/portfolio/certifications/{$c->id}", $this->payload())->assertUnauthorized();
        $this->deleteJson("/api/portfolio/certifications/{$c->id}")->assertUnauthorized();
        $this->postJson('/api/portfolio/certifications/reorder', ['items' => []])->assertUnauthorized();
    }

    public function test_store_creates_certification_without_image(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/certifications', $this->payload())
            ->assertCreated()
            ->assertJsonPath('title', 'AWS SAA')
            ->assertJsonPath('image_url', null)
            ->assertJsonMissingPath('image_path');

        $this->assertDatabaseHas('certifications', ['title' => 'AWS SAA', 'issuer' => 'Amazon', 'image_path' => null]);
    }

    public function test_store_with_valid_image_stores_file_under_certifications(): void
    {
        $this->login();

        $response = $this->post('/api/portfolio/certifications', $this->payload([
            'image' => UploadedFile::fake()->image('cert.png', 100, 100),
        ]), ['Accept' => 'application/json'])->assertCreated();

        $cert = Certification::firstOrFail();
        $this->assertStringStartsWith('certifications/', $cert->image_path);
        Storage::disk('public')->assertExists($cert->image_path);
        $this->assertStringContainsString($cert->image_path, $response->json('image_url'));
        $response->assertJsonMissingPath('image_path')->assertJsonMissingPath('image');
    }

    public function test_store_rejects_invalid_image(): void
    {
        $this->login();
        $headers = ['Accept' => 'application/json'];

        $this->post('/api/portfolio/certifications', $this->payload([
            'image' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ]), $headers)->assertUnprocessable()->assertJsonValidationErrors(['image']);

        $this->post('/api/portfolio/certifications', $this->payload([
            'image' => UploadedFile::fake()->image('big.png')->size(5121),
        ]), $headers)->assertUnprocessable()->assertJsonValidationErrors(['image']);

        $this->post('/api/portfolio/certifications', $this->payload([
            'image' => UploadedFile::fake()->create('fake.png', 10, 'text/plain'),
        ]), $headers)->assertUnprocessable()->assertJsonValidationErrors(['image']);

        $this->assertDatabaseCount('certifications', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_store_accepts_image_of_exactly_5mb(): void
    {
        $this->login();

        $this->post('/api/portfolio/certifications', $this->payload([
            'image' => UploadedFile::fake()->image('ok.jpg')->size(5120),
        ]), ['Accept' => 'application/json'])->assertCreated();
    }

    public function test_store_validation_errors(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/certifications', [])->assertUnprocessable()->assertJsonValidationErrors(['title']);
        $this->postJson('/api/portfolio/certifications', $this->payload([
            'credential_url' => 'not-a-url', 'order' => -1, 'remove_image' => 'maybe',
            'issue_date' => str_repeat('a', 51),
        ]))->assertUnprocessable()
            ->assertJsonValidationErrors(['credential_url', 'order', 'remove_image', 'issue_date']);
    }

    public function test_store_accepts_null_optional_fields(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/certifications', $this->payload([
            'issuer' => null, 'issue_date' => null, 'credential_url' => null, 'description' => null,
        ]))->assertCreated();
    }

    public function test_description_is_purified(): void
    {
        $this->login();

        $this->postJson('/api/portfolio/certifications', $this->payload(['description' => '<p>x</p><script>a()</script>']))
            ->assertCreated()->assertJsonPath('description', '<p>x</p>');
    }

    public function test_update_without_image_keeps_existing_image(): void
    {
        $this->login();
        $c = $this->certWithImage();
        $old = $c->image_path;

        $this->putJson("/api/portfolio/certifications/{$c->id}", $this->payload(['title' => 'Renamed']))
            ->assertOk()->assertJsonPath('title', 'Renamed');

        $this->assertSame($old, $c->fresh()->image_path);
        Storage::disk('public')->assertExists($old);
    }

    public function test_update_with_new_image_replaces_and_deletes_old_file(): void
    {
        $this->login();
        $c = $this->certWithImage();
        $old = $c->image_path;

        $this->post("/api/portfolio/certifications/{$c->id}", $this->payload([
            '_method' => 'PUT',
            'image' => UploadedFile::fake()->image('new.png'),
        ]), ['Accept' => 'application/json'])->assertOk();

        $new = $c->fresh()->image_path;
        $this->assertNotSame($old, $new);
        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($new);
    }

    public function test_update_with_remove_image_deletes_file_and_nulls_path(): void
    {
        $this->login();
        $c = $this->certWithImage();
        $old = $c->image_path;

        $this->putJson("/api/portfolio/certifications/{$c->id}", $this->payload(['remove_image' => true]))
            ->assertOk()->assertJsonPath('image_url', null);

        $this->assertNull($c->fresh()->image_path);
        Storage::disk('public')->assertMissing($old);
    }

    public function test_update_remove_image_false_keeps_image(): void
    {
        $this->login();
        $c = $this->certWithImage();

        $this->putJson("/api/portfolio/certifications/{$c->id}", $this->payload(['remove_image' => false]))->assertOk();

        $this->assertNotNull($c->fresh()->image_path);
        Storage::disk('public')->assertExists($c->image_path);
    }

    public function test_update_validation_and_not_found(): void
    {
        $this->login();
        $c = CertificationFactory::new()->create();

        $this->putJson("/api/portfolio/certifications/{$c->id}", [])->assertUnprocessable();
        $this->putJson('/api/portfolio/certifications/9999', $this->payload())->assertNotFound();
    }

    public function test_destroy_deletes_record_and_file(): void
    {
        $this->login();
        $c = $this->certWithImage();
        $path = $c->image_path;

        $this->deleteJson("/api/portfolio/certifications/{$c->id}")->assertNoContent();

        $this->assertDatabaseMissing('certifications', ['id' => $c->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_destroy_without_image_works(): void
    {
        $this->login();
        $c = CertificationFactory::new()->create();

        $this->deleteJson("/api/portfolio/certifications/{$c->id}")->assertNoContent();
        $this->assertDatabaseMissing('certifications', ['id' => $c->id]);
    }

    public function test_reorder_persists_and_validates(): void
    {
        $this->login();
        $a = CertificationFactory::new()->create(['order' => 0]);
        $b = CertificationFactory::new()->create(['order' => 1]);

        $this->postJson('/api/portfolio/certifications/reorder', [
            'items' => [['id' => $a->id, 'order' => 1], ['id' => $b->id, 'order' => 0]],
        ])->assertOk()->assertExactJson(['ok' => true]);
        $this->assertSame(1, $a->fresh()->order);
        $this->assertSame(0, $b->fresh()->order);

        $this->postJson('/api/portfolio/certifications/reorder', [])->assertUnprocessable()->assertJsonValidationErrors(['items']);
        $this->postJson('/api/portfolio/certifications/reorder', ['items' => [['id' => 9999, 'order' => 1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.id']);
        $this->postJson('/api/portfolio/certifications/reorder', ['items' => [['id' => $a->id, 'order' => -1]]])
            ->assertUnprocessable()->assertJsonValidationErrors(['items.0.order']);
    }
}
