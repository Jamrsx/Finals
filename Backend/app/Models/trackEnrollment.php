<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class trackEnrollment extends Model
{
    const STATUS_PENDING = 'pending';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_DECLINED = 'declined';

    protected $table = 'track_enrollment';
    protected $fillable = [
        'student_id',
        'track_id',
        'track_name',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function student() {
        return $this->belongsTo(StudentDetails::class, 'student_id', 'student_id');
    }

    public function track() {
        return $this->belongsTo(Tracks::class, 'track_id', 'track_id');
    }

    public static function getValidStatuses()
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_ACCEPTED,
            self::STATUS_DECLINED
        ];
    }
}
