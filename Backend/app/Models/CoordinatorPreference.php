<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoordinatorPreference extends Model
{
    protected $table = 'coordinator_preferences';

    protected $fillable = [
        'coordinator_id',
        'show_accepted_enrollments',
        'show_rejected_enrollments'
    ];

    protected $casts = [
        'show_accepted_enrollments' => 'boolean',
        'show_rejected_enrollments' => 'boolean'
    ];

    public function coordinator()
    {
        return $this->belongsTo(Coordinator::class, 'coordinator_id', 'coordinator_id');
    }
} 