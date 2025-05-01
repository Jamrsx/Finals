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
        return $this->hasOne(StudentDetails::class, 'studentId', 'studentId');
    }

    public function trackEnrollments() {
        return $this->hasMany(trackEnrollment::class, 'studentId', 'studentId');
    }
    


}
