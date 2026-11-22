<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Experience::orderBy('order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'start_date' => 'nullable|string|max:50',
            'end_date' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:100',
            'tech_stack' => 'nullable|array',
            'tech_stack.*' => 'string|max:100',
            'key_achievements' => 'nullable|array',
            'key_achievements.*' => 'string',
            'order' => 'integer|min:0',
        ]);

        return response()->json(Experience::create($data), 201);
    }

    public function update(Request $request, Experience $experience): JsonResponse
    {
        $data = $request->validate([
            'company' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'start_date' => 'nullable|string|max:50',
            'end_date' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'nullable|string|max:100',
            'tech_stack' => 'nullable|array',
            'tech_stack.*' => 'string|max:100',
            'key_achievements' => 'nullable|array',
            'key_achievements.*' => 'string',
            'order' => 'integer|min:0',
        ]);

        $experience->update($data);

        return response()->json($experience);
    }

    public function destroy(Experience $experience): JsonResponse
    {
        $experience->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:experiences,id',
            'items.*.order' => 'required|integer|min:0',
        ])['items'];

        foreach ($items as $item) {
            Experience::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['ok' => true]);
    }
}
