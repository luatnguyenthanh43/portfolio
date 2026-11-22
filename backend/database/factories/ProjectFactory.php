<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'company' => fake()->company(),
            'role' => fake()->jobTitle(),
            'summary' => fake()->sentence(),
            'description' => '<p>' . fake()->paragraph() . '</p>',
            'tech_stack' => ['Laravel', 'React'],
            'image_url' => fake()->imageUrl(),
            'demo_url' => fake()->url(),
            'github_url' => fake()->url(),
            'status' => 'Completed',
            'featured' => false,
            'category' => fake()->word(),
            'year' => '2024',
            'order' => 0,
        ];
    }
}
