<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioProfile extends Model
{
    protected $table = 'profile';

    protected $fillable = [
        'name', 'title', 'bio', 'avatar_url', 'email', 'phone', 'location', 'github_url', 'linkedin_url',
    ];
}
