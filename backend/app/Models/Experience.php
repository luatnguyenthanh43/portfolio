<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = ['company', 'role', 'start_date', 'end_date', 'description', 'location', 'employment_type', 'tech_stack', 'key_achievements', 'order'];

    protected $casts = ['tech_stack' => 'array', 'key_achievements' => 'array'];
}
