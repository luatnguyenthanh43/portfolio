<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Experience>
 */
class ExperienceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company' => fake()->company(),
            'role' => fake()->jobTitle(),
            'start_date' => '2022-01',
            'end_date' => '2023-01',
            'description' => fake()->paragraph(),
            'location' => fake()->city(),
            'employment_type' => 'Full-time',
            'tech_stack' => ['PHP', 'MySQL'],
            'key_achievements' => [fake()->sentence()],
            'order' => 0,
        ];
    }
}
