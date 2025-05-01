<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coordinator extends Model
{
    protected $table = 'coordinator';
    protected $primaryKey = 'coordinator_id';

    protected $fillable = [
        'coordinator_id',
        'lname',
        'fname',
        'mname',
        'suffix',
        'gender',
        'email',
        'password',
       
    ];

}
