<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $table = 'section';

    protected $fillable = [
        'student_id',
        'Course',
        'yearlevel',
        'section',
        'instructor',
        'Track',
    ];


    public function instructor()
    {
        return $this->belongsTo(Instructor::class, 'instructor', 'instructor_id');
    }
    
    public function student()
    {
        return $this->belongsTo(StudentDetails::class, 'student_id', 'student_id');
    }
    
}
