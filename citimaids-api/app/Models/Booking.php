<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'client_id',
        'service_id',
        'processed_by_user_id',
        'preferred_date',
        'address',
        'notes',
        'status',
        'total_amount',
        'payment_status',
        'payment_method',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'total_amount'   => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public function details()
    {
        return $this->hasMany(BookingDetail::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
