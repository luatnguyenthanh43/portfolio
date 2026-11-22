<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Skill::orderBy('order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'order' => 'integer|min:0',
        ]);

        return response()->json(Skill::create($data), 201);
    }

    public function update(Request $request, Skill $skill): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'order' => 'integer|min:0',
        ]);

        $skill->update($data);

        return response()->json($skill);
    }

    public function destroy(Skill $skill): JsonResponse
    {
        $skill->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $items = $request->validate(['items' => 'required|array', 'items.*.id' => 'required|integer', 'items.*.order' => 'required|integer'])['items'];

        foreach ($items as $item) {
            Skill::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['ok' => true]);
    }
}
