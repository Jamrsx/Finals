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
        return $this->belongsTo(StudentAcc::class, 'student_id', 'student_id');
    }

    public function section()
    {
        return $this->hasOne(Section::class, 'student_id', 'student_id');
    }

    public function getFullNameAttribute()
    {
        $full = $this->fname . ' ' . ($this->mname ? $this->mname . ' ' : '') . $this->lname;
        return trim($full);
    }

    public static function getFullNameByStudentId($student_id)
    {
        $details = self::where('student_id', $student_id)->first();
        if ($details) {
            $full = $details->lname . ', ' . $details->fname . ' ' . ($details->mname ? $details->mname : '');
            return trim($full);
        }
        return null;
    }
}
