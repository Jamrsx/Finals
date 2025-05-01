<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tracks extends Model
{
    protected $table = 'track';
    protected $fillable = [
        'track_id',
        'track_name',
        'description',
    ];

    public function enrollments() {
        return $this->hasMany(trackEnrollment::class, 'trackid', 'track_id');
    }
    
}
