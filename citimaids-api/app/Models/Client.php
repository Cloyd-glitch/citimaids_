<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'name',
        'contact_number',
        'email',
        'address',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
