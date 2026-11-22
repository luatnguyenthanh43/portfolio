<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Certification extends Model
{
    protected $fillable = ['title', 'issuer', 'issue_date', 'credential_url', 'description', 'image_path', 'order'];

    protected $appends = ['image_url'];

    protected $hidden = ['image_path'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset(Storage::url($this->image_path)) : null;
    }
}
