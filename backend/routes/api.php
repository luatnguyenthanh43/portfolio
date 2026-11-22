<?php

use App\Http\Controllers\Api\CertificationController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public portfolio data (no auth required)
Route::get('/portfolio', [PortfolioController::class, 'index']);

// Authenticated user account routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Admin: manage portfolio content
    Route::put('/portfolio/profile', [PortfolioController::class, 'updateProfile']);
    Route::apiResource('/portfolio/projects', ProjectController::class)->except('index', 'show');
    Route::post('/portfolio/skills/reorder', [SkillController::class, 'reorder']);
    Route::apiResource('/portfolio/skills', SkillController::class)->except('index', 'show');
    Route::post('/portfolio/experiences/reorder', [ExperienceController::class, 'reorder']);
    Route::apiResource('/portfolio/experiences', ExperienceController::class)->except('index', 'show');
    Route::post('/portfolio/educations/reorder', [EducationController::class, 'reorder']);
    Route::apiResource('/portfolio/educations', EducationController::class)->except('index', 'show');
    Route::post('/portfolio/certifications/reorder', [CertificationController::class, 'reorder']);
    Route::apiResource('/portfolio/certifications', CertificationController::class)->except('index', 'show');
});

require __DIR__ . '/auth.php';
