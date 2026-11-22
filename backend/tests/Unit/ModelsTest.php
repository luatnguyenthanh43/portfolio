<?php

namespace Tests\Unit;

use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\PortfolioProfile;
use App\Models\Project;
use App\Models\Skill;
use Database\Factories\CertificationFactory;
use Database\Factories\ExperienceFactory;
use Database\Factories\ProjectFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_certification_image_url_is_null_without_image(): void
    {
        $this->assertNull((new Certification())->image_url);
    }

    public function test_certification_image_url_points_to_storage(): void
    {
        $c = new Certification(['image_path' => 'certifications/a.png']);

        $this->assertSame(asset('/storage/certifications/a.png'), $c->image_url);
    }

    public function test_certification_serialization_appends_image_url_and_hides_image_path(): void
    {
        $array = CertificationFactory::new()->create(['image_path' => 'certifications/a.png'])->toArray();

        $this->assertArrayHasKey('image_url', $array);
        $this->assertArrayNotHasKey('image_path', $array);
    }

    public function test_project_casts(): void
    {
        $p = ProjectFactory::new()->create(['tech_stack' => ['a', 'b'], 'featured' => 1])->fresh();

        $this->assertSame(['a', 'b'], $p->tech_stack);
        $this->assertTrue($p->featured);
        $this->assertSame(['tech_stack' => 'array', 'featured' => 'boolean'], array_intersect_key($p->getCasts(), ['tech_stack' => 1, 'featured' => 1]));
    }

    public function test_experience_casts(): void
    {
        $e = ExperienceFactory::new()->create(['tech_stack' => ['x'], 'key_achievements' => ['y', 'z']])->fresh();

        $this->assertSame(['x'], $e->tech_stack);
        $this->assertSame(['y', 'z'], $e->key_achievements);
    }

    public function test_fillable_ignores_unlisted_attributes(): void
    {
        $this->assertNull((new Project(['title' => 'x', 'id' => 99, 'created_at' => '2000-01-01']))->id);
        $this->assertNull((new Skill(['name' => 'x', 'id' => 99, 'level' => 5]))->id);
        $this->assertNull((new Skill(['name' => 'x', 'level' => 5]))->level);
        $this->assertNull((new Experience(['company' => 'x', 'id' => 99]))->id);
        $this->assertNull((new Education(['institution' => 'x', 'id' => 99]))->id);
        $this->assertNull((new Certification(['title' => 'x', 'id' => 99]))->id);
        $this->assertNull((new PortfolioProfile(['name' => 'x', 'id' => 99, 'admin' => true]))->admin);
    }

    public function test_fillable_allows_listed_attributes(): void
    {
        $c = new Certification(['title' => 'T', 'image_path' => 'p', 'order' => 2]);

        $this->assertSame('T', $c->title);
        $this->assertSame('p', $c->image_path);
        $this->assertSame(2, $c->order);
    }

    public function test_table_names(): void
    {
        $this->assertSame('profile', (new PortfolioProfile())->getTable());
        $this->assertSame('educations', (new Education())->getTable());
    }
}
