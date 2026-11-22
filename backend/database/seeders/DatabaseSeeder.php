<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\PortfolioProfile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the portfolio from Nguyen-Luat-Resume-SE.pdf.
 * Safe to re-run: portfolio tables are cleared first so rows never duplicate.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);

        foreach ([PortfolioProfile::class, Project::class, Skill::class, Experience::class, Education::class, Certification::class] as $model) {
            $model::query()->delete();
        }

        PortfolioProfile::create([
            'name' => 'Nguyen Thanh Luat',
            'title' => 'Full-Stack Software Engineer',
            'bio' => '<p>Full-stack software engineer with 5 years of experience building automotive digital retail and e-commerce products used by dealerships across multiple markets. Strongest in PHP (Yii2) REST APIs, Angular/NgRx front ends, payment and third-party integrations (Stripe, CAP, VWE, Canadian Black Book, Bitreality), and automated testing with CI/CD.</p>'
                . '<p>Introduced AI-agent workflows that automate requirement analysis, test generation, code review and quality checks. Works effectively in distributed Agile teams across the UK, Singapore and Vietnam.</p>',
            'email' => 'luatnguyen0319@gmail.com',
            'phone' => '076 493 3597',
            'location' => 'Ho Chi Minh City, Vietnam',
            'linkedin_url' => 'https://linkedin.com/in/luat-nguyen-7a9692196/',
        ]);

        $projects = [
            [
                'title' => 'NetDirector Online Payments (Canada)',
                'company' => 'Keyloop', 'role' => 'Software Engineer',
                'summary' => 'Localized the online payments flow for Canadian dealerships, covering pricing, tax and deposit rules.',
                'description' => '<p>Localized NetDirector Online Payments for Canada: adapted pricing, taxation and dealership rules for deposit and full-payment flows.</p><ul><li>Designed payment-service APIs with Saleshub for secure transactions and payment-status synchronization.</li><li>Built the Angular payment widget.</li><li>Added backend and frontend tests for critical payment paths.</li></ul>',
                'tech_stack' => ['PHP', 'Yii2', 'Angular', 'NgRx', 'TypeScript', 'MySQL', 'PHPUnit', 'Codeception', 'Cypress'],
                'category' => 'Payments', 'featured' => true, 'status' => 'Completed', 'order' => 0,
            ],
            [
                'title' => 'NetDirector Experience V2',
                'company' => 'Keyloop', 'role' => 'Software Engineer',
                'summary' => 'Connected Bitreality 3D vehicle assets to dealer sites through configuration-to-drop-code APIs.',
                'description' => '<p>Integrated Bitreality 3D vehicle assets into dealer sites.</p><ul><li>Designed APIs and configuration mapping that link vehicle configurations to drop codes so the frontend loads the correct 3D widget.</li></ul>',
                'tech_stack' => ['PHP', 'Yii2', 'Angular', 'NgRx', 'TypeScript', 'Bitreality', 'MySQL'],
                'category' => '3D Visualization', 'featured' => true, 'status' => 'Completed', 'order' => 1,
            ],
            [
                'title' => 'AI-Agent Delivery Workflow',
                'company' => 'Keyloop', 'role' => 'Software Engineer',
                'summary' => 'AI agents that analyze tickets, write code and tests, review changes and run quality checks in CI/CD.',
                'description' => '<p>Designed an AI-agent workflow that reads development tickets and repositories to analyze requirements, implement changes, generate tests, review code and validate quality.</p><ul><li>Integrated the agents into CI/CD pipelines to automate tests, quality checks and deployment, reducing manual effort.</li></ul>',
                'tech_stack' => ['Claude Code', 'GitHub Copilot', 'CI/CD', 'TeamCity', 'SonarQube'],
                'category' => 'AI / Automation', 'featured' => true, 'status' => 'Completed', 'order' => 2,
            ],
            [
                'title' => 'NetDirector Valuations',
                'company' => 'ATG', 'role' => 'Software Engineer',
                'summary' => 'A valuation widget and API combining CAP, VWE and Canadian Black Book data.',
                'description' => '<p>Valuation widget and API that aggregate and normalize data from CAP, VWE and Canadian Black Book.</p><ul><li>Added dealer configuration for embedding the widget.</li><li>Improved reliability through automated tests and legacy-code refactoring.</li></ul>',
                'tech_stack' => ['PHP', 'Yii2', 'Angular', 'NgRx', 'MySQL', 'Codeception', 'Jest'],
                'category' => 'Automotive Retail', 'featured' => false, 'status' => 'Completed', 'order' => 3,
            ],
            [
                'title' => 'NetDirector Online Payments',
                'company' => 'ATG', 'role' => 'Software Engineer',
                'summary' => 'Stripe-powered deposit and payment widget for dealer websites, synced with internal sales systems.',
                'description' => '<p>Yii2 backend, PHP REST APIs and Angular payment widget for dealer websites.</p><ul><li>Integrated Stripe and synchronized payment status with internal sales systems.</li></ul>',
                'tech_stack' => ['PHP', 'Yii2', 'Angular', 'Stripe', 'MySQL', 'Codeception'],
                'category' => 'Payments', 'featured' => false, 'status' => 'Completed', 'order' => 4,
            ],
            [
                'title' => 'NetDirector Experience V1',
                'company' => 'ATG', 'role' => 'Software Engineer',
                'summary' => 'Embeddable 3D/360° vehicle viewer built with WebGL and Vehicle Data Manager APIs.',
                'description' => '<p>3D/360° vehicle visualization built with WebGL and third-party libraries.</p><ul><li>Integrated Vehicle Data Manager APIs.</li><li>Enabled dealers to generate and embed configurable widgets on their sites.</li></ul>',
                'tech_stack' => ['Angular', 'TypeScript', 'WebGL', 'PHP', 'Yii2'],
                'category' => '3D Visualization', 'featured' => false, 'status' => 'Completed', 'order' => 5,
            ],
            [
                'title' => 'Agency Web & E-commerce Builds',
                'company' => 'CorsivaLab', 'role' => 'Web Developer',
                'summary' => '50+ custom sites and e-commerce stores built from Figma and Adobe XD designs.',
                'description' => '<p>Delivered 50+ custom web applications, corporate sites and e-commerce platforms from Figma and Adobe XD designs, including GlobalTix, AquaFitness, Sol &amp; Ora, Circular Law and Friend Studio.</p>',
                'tech_stack' => ['PHP', 'WordPress', 'WooCommerce', 'TypeRocket', 'MySQL', 'SCSS'],
                'category' => 'Web / E-commerce', 'featured' => false, 'status' => 'Completed', 'order' => 6,
            ],
            [
                'title' => 'Magento 2 Enterprise Stores',
                'company' => 'SmartOSC', 'role' => 'Software Engineer',
                'summary' => 'Magento 2 stores for ASUS Singapore, Club 21 and Melissa Shoes.',
                'description' => '<p>Developed Magento 2 enterprise stores for ASUS Singapore, Club 21 and Melissa Shoes, working alongside senior engineers.</p>',
                'tech_stack' => ['Magento 2', 'PHP', 'MySQL', 'Docker', 'PHPUnit'],
                'category' => 'E-commerce', 'featured' => false, 'status' => 'Completed', 'order' => 7,
            ],
        ];
        foreach ($projects as $project) {
            Project::create($project);
        }

        $skills = [
            ['PHP', 'Languages'], ['TypeScript', 'Languages'], ['JavaScript', 'Languages'],
            ['Yii2', 'Backend'], ['REST API design', 'Backend'], ['MySQL', 'Backend'],
            ['Angular', 'Frontend'], ['NgRx', 'Frontend'], ['RxJS', 'Frontend'],
            ['Angular Material', 'Frontend'], ['HTML5 / SCSS', 'Frontend'],
            ['PHPUnit', 'Testing & Quality'], ['Codeception', 'Testing & Quality'], ['Jest', 'Testing & Quality'],
            ['Cypress', 'Testing & Quality'], ['Jasmine', 'Testing & Quality'], ['SonarQube', 'Testing & Quality'],
            ['AWS (S3, CloudFront, EC2, X-Ray)', 'Cloud & Delivery'], ['Docker', 'Cloud & Delivery'],
            ['TeamCity', 'Cloud & Delivery'], ['Jenkins', 'Cloud & Delivery'], ['GitHub Actions', 'Cloud & Delivery'],
            ['GitHub Copilot', 'AI-Assisted Development'], ['Claude Code', 'AI-Assisted Development'],
            ['AI-agent workflows', 'AI-Assisted Development'],
        ];
        foreach ($skills as $i => [$name, $category]) {
            Skill::create(['name' => $name, 'category' => $category, 'order' => $i]);
        }

        $experiences = [
            [
                'company' => 'Keyloop', 'role' => 'Software Engineer', 'location' => 'UK Remote', 'employment_type' => 'Full-time',
                'start_date' => 'Jul 2024', 'end_date' => 'Sep 2026',
                'description' => '<p>Global automotive technology company providing DMS, digital retail and connected solutions in 90+ countries. Build PHP REST APIs and Angular (NgRx) applications and widgets for vehicle sales, payments, configuration, valuation and customer journeys, integrated with Saleshub APIs across markets.</p>',
                'key_achievements' => [
                    'AI delivery: designed an AI-agent workflow that reads tickets and repositories to analyze requirements, implement changes, generate tests, review code and validate quality.',
                    'CI/CD automation: integrated AI agents into CI/CD pipelines to automate tests, quality checks and deployment, reducing manual effort.',
                    'NetDirector Online Payments (Canada): localized pricing, taxation and dealership rules for deposit and full-payment flows; designed payment-service APIs with Saleshub; built the Angular payment widget; added tests for critical payment paths.',
                    'NetDirector Experience V2: integrated Bitreality 3D vehicle assets and designed APIs/configuration mapping linking vehicle configurations to drop codes.',
                ],
                'tech_stack' => ['PHP 8.4', 'Yii2', 'Angular', 'NgRx', 'TypeScript', 'MySQL 8', 'Docker', 'AWS', 'PHPUnit', 'Codeception', 'Cypress', 'Jest', 'TeamCity'],
                'order' => 0,
            ],
            [
                'company' => 'ATG – Automotive Transformation Group', 'role' => 'Software Engineer', 'location' => 'UK Remote', 'employment_type' => 'Full-time',
                'start_date' => 'Jun 2023', 'end_date' => 'May 2024',
                'description' => '<p>UK automotive SaaS company providing omnichannel retail and e-commerce platforms for OEMs and dealerships. Built NetDirector features for online vehicle sales, payments, valuations and digital customer experiences, including backend services for ordering, financing, payments and enquiries.</p>',
                'key_achievements' => [
                    'Online Payments: developed the Yii2 backend, PHP REST APIs and Angular payment widget for dealer websites; integrated Stripe and synchronized payment status with internal sales systems.',
                    'Valuations: built the valuation widget and API aggregating CAP, VWE and Canadian Black Book data; added dealer configuration for embedding; improved reliability via automated tests and legacy-code refactoring.',
                    'Experience V1: built 3D/360° vehicle visualization with WebGL; integrated Vehicle Data Manager APIs and let dealers generate and embed configurable widgets.',
                ],
                'tech_stack' => ['PHP 8.4', 'Yii2', 'Angular', 'NgRx', 'TypeScript', 'MySQL 8', 'Docker', 'AWS', 'Codeception', 'Cypress', 'Jest', 'TeamCity'],
                'order' => 1,
            ],
            [
                'company' => 'CorsivaLab', 'role' => 'Web Developer', 'location' => 'Singapore (Remote)', 'employment_type' => 'Full-time',
                'start_date' => 'Jun 2021', 'end_date' => 'Apr 2023',
                'description' => '<p>Singapore digital agency delivering web applications and enterprise e-commerce. Built custom WordPress solutions with TypeRocket v5 MVC (plugins, post types, admin tools, reusable components) and managed WooCommerce orders, customers and products.</p>',
                'key_achievements' => [
                    'Delivered 50+ custom web applications, corporate sites and e-commerce platforms from Figma and Adobe XD designs (GlobalTix, AquaFitness, Sol & Ora, Circular Law, Friend Studio).',
                ],
                'tech_stack' => ['PHP', 'WordPress', 'TypeRocket', 'WooCommerce', 'MySQL', 'JavaScript', 'SCSS', 'REST APIs'],
                'order' => 2,
            ],
            [
                'company' => 'SmartOSC', 'role' => 'Software Engineer', 'location' => 'HCMC, Vietnam', 'employment_type' => 'Full-time',
                'start_date' => 'Sep 2020', 'end_date' => 'Jun 2021',
                'description' => '<p>Developed Magento 2 enterprise stores (ASUS Singapore, Club 21, Melissa Shoes) working alongside senior engineers.</p>',
                'key_achievements' => [],
                'tech_stack' => ['Magento 2', 'PHP', 'MySQL', 'REST APIs', 'PHPUnit', 'Docker', 'Git'],
                'order' => 3,
            ],
        ];
        foreach ($experiences as $experience) {
            Experience::create($experience);
        }

        $educations = [
            ['institution' => 'HCMC Open University', 'degree' => "Bachelor's Degree", 'field_of_study' => 'International Business', 'start_date' => 'Jan 2024', 'end_date' => 'Jun 2026 (expected)', 'order' => 0],
            ['institution' => 'HCMC Open University', 'degree' => "Bachelor's Degree", 'field_of_study' => 'Management Information Systems', 'start_date' => 'Sep 2017', 'end_date' => 'Jul 2022', 'order' => 1],
        ];
        foreach ($educations as $education) {
            Education::create($education);
        }

        Certification::create([
            'title' => 'SAFe 6 Practitioner',
            'issuer' => 'Scaled Agile Framework',
            'order' => 0,
        ]);
    }
}
