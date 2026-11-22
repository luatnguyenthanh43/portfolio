<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteSurfaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_resources_expose_no_index_route_reads_go_through_portfolio(): void
    {
        $this->actingAs(User::factory()->create());

        foreach (['projects', 'skills', 'experiences', 'educations', 'certifications'] as $resource) {
            $this->getJson("/api/portfolio/{$resource}")->assertStatus(405);
        }
    }
}
