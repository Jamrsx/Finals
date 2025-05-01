<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class trackEnrollment extends Model
{
    protected $table = 'track_enrollment';
    protected $fillable = [
        'studentId',
        'trackid',
        'track_name',
        'status',
    ];

    public function student() {
        return $this->belongsTo(StudentAcc::class, 'studentId', 'studentId');
    }

    public function track() {
        return $this->belongsTo(Tracks::class, 'trackid', 'track_id');
    }
    
    

}
