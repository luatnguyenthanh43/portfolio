<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Certification>
 */
class CertificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'issuer' => fake()->company(),
            'issue_date' => '2024-05',
            'credential_url' => fake()->url(),
            'description' => '<p>' . fake()->sentence() . '</p>',
            'image_path' => null,
            'order' => 0,
        ];
    }
}
