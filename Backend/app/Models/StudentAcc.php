<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAcc extends Model
{
    protected $table = 'student_acc';

    protected $fillable = [
        'student_id',
        'password',
        'status',
    ];

    public function details() {
        return $this->hasOne(StudentDetails::class, 'student_id', 'student_id');
    }

    public function trackEnrollments() {
        return $this->hasMany(trackEnrollment::class, 'student_id', 'student_id');
    }

    public function getFullNameAttribute()
    {
        return $this->details ? $this->details->full_name : null;
    }
}
