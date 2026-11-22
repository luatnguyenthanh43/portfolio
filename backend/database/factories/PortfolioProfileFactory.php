<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortfolioProfile>
 */
class PortfolioProfileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'title' => fake()->jobTitle(),
            'bio' => '<p>' . fake()->paragraph() . '</p>',
            'avatar_url' => fake()->imageUrl(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'location' => fake()->city(),
            'github_url' => 'https://github.com/example',
            'linkedin_url' => 'https://linkedin.com/in/example',
        ];
    }
}
