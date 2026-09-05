<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Clean existing payment data for idempotent re-runs
        Transaction::query()->delete();
        Payment::query()->delete();

        $bookings = Booking::with('client')->get();

        if ($bookings->isEmpty()) {
            $this->command->warn('No bookings found — skipping PaymentSeeder.');
            return;
        }

        $methods  = ['adcb_pace_pay', 'bank_transfer', 'cash', 'card'];
        $statuses = ['pending', 'paid', 'paid', 'paid', 'failed']; // bias toward 'paid'

        foreach ($bookings->take(8) as $i => $booking) {
            $method = $methods[$i % count($methods)];
            $status = $statuses[$i % count($statuses)];
            $amount = fake()->randomFloat(2, 150, 2500);
            $paidAt = $status === 'paid' ? Carbon::now()->subDays(rand(0, 14)) : null;

            // Update booking totals
            $booking->update([
                'total_amount'   => $amount,
                'payment_status' => $status === 'paid' ? 'paid' : ($status === 'failed' ? 'unpaid' : 'unpaid'),
                'payment_method' => $method,
            ]);

            $payment = Payment::create([
                'booking_id'       => $booking->id,
                'client_id'        => $booking->client_id,
                'amount'           => $amount,
                'currency'         => 'AED',
                'payment_method'   => $method,
                'payment_link'     => $method === 'adcb_pace_pay'
                    ? 'https://pay.adcb.com/pace-pay/link/' . fake()->regexify('[A-Za-z0-9]{32}')
                    : null,
                'payment_link_expires_at' => $method === 'adcb_pace_pay'
                    ? Carbon::now()->addHours(24)
                    : null,
                'status'           => $status,
                'reference_number' => Payment::generateReference(),
                'external_reference' => $method === 'adcb_pace_pay'
                    ? 'ADCB-' . strtoupper(fake()->regexify('[A-Z0-9]{8}'))
                    : null,
                'paid_at'          => $paidAt,
                'notes'            => fake()->optional(0.3)->sentence(),
            ]);

            // Charge transaction
            Transaction::create([
                'payment_id'  => $payment->id,
                'type'        => 'charge',
                'amount'      => $amount,
                'status'      => $status === 'paid' ? 'success' : ($status === 'failed' ? 'failed' : 'pending'),
                'description' => "Payment for Booking #{$booking->id}",
            ]);

            // Add a refund transaction on one payment for variety
            if ($i === 3 && $status === 'paid') {
                $refundAmount = round($amount * 0.5, 2);
                Transaction::create([
                    'payment_id'  => $payment->id,
                    'type'        => 'refund',
                    'amount'      => $refundAmount,
                    'status'      => 'success',
                    'description' => 'Partial refund — customer request',
                ]);
            }
        }

        $this->command->info('PaymentSeeder: Created ' . Payment::count() . ' payments with transactions.');
    }
}
