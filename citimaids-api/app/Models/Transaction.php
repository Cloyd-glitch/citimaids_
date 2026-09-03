<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'payment_id',
        'type',
        'amount',
        'status',
        'gateway_response',
        'description',
        'processed_by_user_id',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'gateway_response' => 'array',
    ];

    /* ─── Relationships ─── */

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }
}
