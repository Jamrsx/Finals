<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentDetails extends Model
{
    protected $table = 'student_details';

    protected $fillable = [
        'student_id',
        'lname',
        'fname',
        'mname',
        'suffix',
        'email',
        'Phone_number',
        'gender',
        'status',
    ];

    public function account() {
        return $this->belongsTo(StudentAcc::class, 'studentId', 'studentId');
    }

    public function section()
{
    return $this->hasOne(Section::class, 'student_id', 'studentId');
}


    
}
