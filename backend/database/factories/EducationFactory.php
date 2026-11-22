<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Education>
 */
class EducationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'institution' => fake()->company() . ' University',
            'degree' => 'BSc',
            'field_of_study' => 'Computer Science',
            'start_date' => '2018',
            'end_date' => '2022',
            'description' => '<p>' . fake()->sentence() . '</p>',
            'gpa' => '3.5',
            'order' => 0,
        ];
    }
}
