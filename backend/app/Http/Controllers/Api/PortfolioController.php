<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\PortfolioProfile;
use App\Models\Project;
use App\Models\Skill;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'profile' => PortfolioProfile::first(),
            'projects' => Project::orderBy('order')->get(),
            'skills' => Skill::orderBy('order')->get(),
            'experiences' => Experience::orderBy('order')->get(),
            'educations' => Education::orderBy('order')->get(),
            'certifications' => Certification::orderBy('order')->get(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'avatar_url' => 'nullable|url|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'github_url' => 'nullable|url|max:500',
            'linkedin_url' => 'nullable|url|max:500',
        ]);

        if (array_key_exists('bio', $data)) {
            $data['bio'] = HtmlSanitizer::purify($data['bio']);
        }

        $profile = PortfolioProfile::firstOrNew([]);
        $profile->fill($data)->save();

        return response()->json($profile);
    }
}
