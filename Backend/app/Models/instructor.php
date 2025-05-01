<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class instructor extends Model
{
    protected $table = 'instructor';
    protected $primaryKey = 'instructor_id';

    protected $fillable = [
        'instructor_id',
        'lname',
        'fname',
        'email',
        'phone',
       
    ];

    public function section()
    {
        return $this->hasOne(Section::class, 'instructor_id', 'instructor_id');
    }
}
