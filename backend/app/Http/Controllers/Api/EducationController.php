<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Education;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json(Education::create($data), 201);
    }

    public function update(Request $request, Education $education): JsonResponse
    {
        $data = $this->validated($request);

        $education->update($data);

        return response()->json($education);
    }

    public function destroy(Education $education): JsonResponse
    {
        $education->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:educations,id',
            'items.*.order' => 'required|integer|min:0',
        ])['items'];

        foreach ($items as $item) {
            Education::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['ok' => true]);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'nullable|string|max:50',
            'end_date' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'gpa' => 'nullable|string|max:50',
            'order' => 'integer|min:0',
        ]);

        if (array_key_exists('description', $data)) {
            $data['description'] = HtmlSanitizer::purify($data['description']);
        }

        return $data;
    }
}
