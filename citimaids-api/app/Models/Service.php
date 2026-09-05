<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name',
        'description',
        'base_price',
        'icon',
        'status',
        'display_order',
    ];

    // Always return services ordered by display_order by default
    protected static function booted(): void
    {
        static::creating(function ($service) {
            if (empty($service->display_order)) {
                $service->display_order = (static::max('display_order') ?? 0) + 1;
            }
        });
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingDetails()
    {
        return $this->hasMany(BookingDetail::class);
    }
}
