<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title', 'description', 'tech_stack', 'image_url', 'demo_url', 'github_url',
        'status', 'featured', 'category', 'year', 'order',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'featured' => 'boolean',
    ];
}
