<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json(Certification::create($data), 201);
    }

    public function update(Request $request, Certification $certification): JsonResponse
    {
        $data = $this->validated($request);

        if (isset($data['image_path']) || ($data['remove_image'] ?? false)) {
            if ($certification->image_path) {
                Storage::disk('public')->delete($certification->image_path);
            }
            $data['image_path'] ??= null;
        }
        unset($data['remove_image']);

        $certification->update($data);

        return response()->json($certification);
    }

    public function destroy(Certification $certification): JsonResponse
    {
        if ($certification->image_path) {
            Storage::disk('public')->delete($certification->image_path);
        }
        $certification->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:certifications,id',
            'items.*.order' => 'required|integer|min:0',
        ])['items'];

        foreach ($items as $item) {
            Certification::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['ok' => true]);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'issuer' => 'nullable|string|max:255',
            'issue_date' => 'nullable|string|max:50',
            'credential_url' => 'nullable|url|max:500',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'remove_image' => 'boolean',
            'order' => 'integer|min:0',
        ]);

        if (array_key_exists('description', $data)) {
            $data['description'] = HtmlSanitizer::purify($data['description'] ?? '');
        }

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('certifications', 'public');
        }
        unset($data['image']);

        return $data;
    }
}
