<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    // Laravel's pluralizer leaves "Education" unchanged, inferring the table as `education`.
    protected $table = 'educations';

    protected $fillable = ['institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'description', 'gpa', 'order'];
}
