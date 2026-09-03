<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

/**
 * ADCB Pace Pay Service — STUB
 *
 * This is a placeholder for the real ADCB Pace Pay API integration.
 * When merchant credentials are available, replace the stub methods
 * with actual API calls. The rest of the application is already wired up.
 *
 * ADCB Pace Pay flow:
 *   1. Merchant generates a payment link via API
 *   2. Link is sent to customer via SMS/email/WhatsApp
 *   3. Customer clicks link → pays via card, Apple Pay, QR, etc.
 *   4. ADCB sends webhook/callback confirming payment
 *   5. System updates payment status to 'paid'
 */
class AdcbPacePayService
{
    /**
     * Generate a payment link for the given payment.
     *
     * STUB: Returns a simulated link. Replace with real ADCB API call.
     *
     * @param  Payment  $payment
     * @return array  ['link' => string, 'expires_at' => Carbon]
     */
    public function generatePaymentLink(Payment $payment): array
    {
        // ── Real implementation would call ADCB API here ──
        // $response = Http::withHeaders([
        //     'Authorization' => 'Bearer ' . config('services.adcb.api_key'),
        //     'Content-Type'  => 'application/json',
        // ])->post(config('services.adcb.base_url') . '/payment-links', [
        //     'amount'      => $payment->amount,
        //     'currency'    => $payment->currency,
        //     'reference'   => $payment->reference_number,
        //     'description' => 'CitiMaids Booking #' . $payment->booking_id,
        //     'callback_url' => config('app.url') . '/api/webhooks/adcb',
        // ]);

        $stubToken = Str::random(32);
        $link      = "https://pay.adcb.com/pace-pay/link/{$stubToken}";
        $expiresAt = Carbon::now()->addHours(24);

        return [
            'link'       => $link,
            'expires_at' => $expiresAt,
            'external_reference' => 'ADCB-STUB-' . strtoupper(Str::random(8)),
        ];
    }

    /**
     * Verify a payment status with ADCB.
     *
     * STUB: Always returns 'paid'. Replace with real API call.
     *
     * @param  string  $externalReference
     * @return array  ['status' => string, 'paid_at' => ?Carbon, 'raw' => array]
     */
    public function verifyPayment(string $externalReference): array
    {
        // ── Real implementation would call ADCB API here ──

        return [
            'status'  => 'paid',
            'paid_at' => Carbon::now(),
            'raw'     => [
                'stub'      => true,
                'reference' => $externalReference,
                'message'   => 'STUB: Payment verified successfully',
            ],
        ];
    }

    /**
     * Process a refund via ADCB.
     *
     * STUB: Always returns success. Replace with real API call.
     *
     * @param  Payment  $payment
     * @param  float    $amount
     * @return array  ['success' => bool, 'reference' => string, 'raw' => array]
     */
    public function processRefund(Payment $payment, float $amount): array
    {
        // ── Real implementation would call ADCB API here ──

        return [
            'success'   => true,
            'reference' => 'ADCB-REFUND-' . strtoupper(Str::random(8)),
            'raw'       => [
                'stub'    => true,
                'amount'  => $amount,
                'message' => 'STUB: Refund processed successfully',
            ],
        ];
    }
}
