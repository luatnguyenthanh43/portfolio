<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\PortfolioProfile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        PortfolioProfile::create([
            'name' => 'Your Name',
            'title' => 'Full Stack Developer',
            'bio' => 'I build modern web applications with clean, maintainable code.',
            'email' => 'hello@example.com',
            'github_url' => 'https://github.com',
            'linkedin_url' => 'https://linkedin.com',
        ]);

        $projects = [
            ['title' => 'Portfolio Site', 'description' => 'Personal portfolio built with Laravel + React.', 'tech_stack' => ['Laravel', 'React', 'Tailwind CSS'], 'order' => 0],
            ['title' => 'E-Commerce App', 'description' => 'Full-stack e-commerce platform with payments.', 'tech_stack' => ['Next.js', 'Stripe', 'PostgreSQL'], 'order' => 1],
        ];
        foreach ($projects as $project) {
            Project::create($project);
        }

        $skills = [
            ['name' => 'PHP / Laravel', 'category' => 'Backend', 'level' => 90, 'order' => 0],
            ['name' => 'React', 'category' => 'Frontend', 'level' => 85, 'order' => 1],
            ['name' => 'JavaScript', 'category' => 'Frontend', 'level' => 88, 'order' => 2],
            ['name' => 'Tailwind CSS', 'category' => 'Frontend', 'level' => 80, 'order' => 3],
            ['name' => 'MySQL / SQLite', 'category' => 'Database', 'level' => 75, 'order' => 4],
            ['name' => 'Docker', 'category' => 'DevOps', 'level' => 65, 'order' => 5],
        ];
        foreach ($skills as $skill) {
            Skill::create($skill);
        }

        $experiences = [
            ['company' => 'Acme Corp', 'role' => 'Senior Developer', 'start_date' => 'Jan 2022', 'end_date' => null, 'description' => 'Led development of core product features and mentored junior developers.', 'order' => 0],
            ['company' => 'Startup XYZ', 'role' => 'Full Stack Developer', 'start_date' => 'Mar 2019', 'end_date' => 'Dec 2021', 'description' => 'Built and maintained multiple client-facing web applications.', 'order' => 1],
        ];
        foreach ($experiences as $experience) {
            Experience::create(
                $experience,
            );
        }
    }
}
