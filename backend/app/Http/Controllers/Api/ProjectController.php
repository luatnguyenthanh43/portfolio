<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Project::orderBy('order')->get());
    }

    private function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:255',
            'summary' => 'nullable|string|max:300',
            'description' => 'nullable|string',
            'tech_stack' => 'nullable|array',
            'tech_stack.*' => 'string|max:100',
            'image_url' => 'nullable|url|max:500',
            'demo_url' => 'nullable|url|max:500',
            'github_url' => 'nullable|url|max:500',
            'status' => 'nullable|string|max:50',
            'featured' => 'boolean',
            'category' => 'nullable|string|max:100',
            'year' => 'nullable|string|max:10',
            'order' => 'integer|min:0',
        ];
    }

    private function sanitize(array $data): array
    {
        if (array_key_exists('description', $data)) {
            $data['description'] = HtmlSanitizer::purify($data['description'] ?? '');
        }

        return $data;
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->sanitize($request->validate($this->rules()));

        return response()->json(Project::create($data), 201);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $this->sanitize($request->validate($this->rules()));

        $project->update($data);

        return response()->json($project);
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(null, 204);
    }
}
