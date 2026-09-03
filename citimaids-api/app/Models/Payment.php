<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'client_id',
        'amount',
        'currency',
        'payment_method',
        'payment_link',
        'payment_link_expires_at',
        'status',
        'reference_number',
        'external_reference',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount'                  => 'decimal:2',
        'payment_link_expires_at' => 'datetime',
        'paid_at'                 => 'datetime',
    ];

    /* ─── Relationships ─── */

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class)->orderByDesc('created_at');
    }

    /* ─── Helpers ─── */

    /**
     * Generate a unique reference number like PAY-20260904-0001
     */
    public static function generateReference(): string
    {
        $date  = Carbon::now()->format('Ymd');
        $last  = static::where('reference_number', 'like', "PAY-{$date}-%")
                       ->orderByDesc('id')
                       ->value('reference_number');

        $seq = 1;
        if ($last) {
            $parts = explode('-', $last);
            $seq   = (int) end($parts) + 1;
        }

        return sprintf('PAY-%s-%04d', $date, $seq);
    }

    /**
     * Check if the payment link has expired.
     */
    public function isLinkExpired(): bool
    {
        return $this->payment_link_expires_at
            && Carbon::now()->greaterThan($this->payment_link_expires_at);
    }
}
