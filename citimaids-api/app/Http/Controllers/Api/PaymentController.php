<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\AdcbPacePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * List all payments (admin, with filters).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['booking.service', 'client', 'transactions'])
            ->orderByDesc('created_at');

        // ── Filters ──
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('reference_number', 'like', "%{$s}%")
                  ->orWhere('external_reference', 'like', "%{$s}%")
                  ->orWhereHas('client', fn($cq) => $cq->where('name', 'like', "%{$s}%"));
            });
        }

        $payments = $query->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    /**
     * Show a single payment with transactions.
     */
    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['booking.service', 'booking.client', 'client', 'transactions.processedBy'])
            ->findOrFail($id);

        return response()->json($payment);
    }

    /**
     * Create a payment for a booking and generate ADCB Pace Pay link.
     */
    public function createForBooking(Request $request, int $bookingId): JsonResponse
    {
        $booking = Booking::with('client')->findOrFail($bookingId);

        // Validate
        $request->validate([
            'amount'         => 'required|numeric|min:1',
            'payment_method' => 'required|in:adcb_pace_pay,bank_transfer,cash,card',
            'notes'          => 'nullable|string|max:1000',
        ]);

        // Create payment record
        $payment = Payment::create([
            'booking_id'       => $booking->id,
            'client_id'        => $booking->client_id,
            'amount'           => $request->amount,
            'currency'         => 'AED',
            'payment_method'   => $request->payment_method,
            'status'           => 'pending',
            'reference_number' => Payment::generateReference(),
            'notes'            => $request->notes,
        ]);

        // If ADCB Pace Pay, generate the payment link
        if ($request->payment_method === 'adcb_pace_pay') {
            $adcb   = new AdcbPacePayService();
            $result = $adcb->generatePaymentLink($payment);

            $payment->update([
                'payment_link'            => $result['link'],
                'payment_link_expires_at' => $result['expires_at'],
                'external_reference'      => $result['external_reference'],
            ]);
        }

        // Create initial charge transaction
        Transaction::create([
            'payment_id'           => $payment->id,
            'type'                 => 'charge',
            'amount'               => $payment->amount,
            'status'               => 'pending',
            'description'          => "Payment created for Booking #{$booking->id}",
            'processed_by_user_id' => $request->user()?->id,
        ]);

        // Update booking payment info
        $booking->update([
            'total_amount'   => $request->amount,
            'payment_status' => 'unpaid',
            'payment_method' => $request->payment_method,
        ]);

        $payment->load(['transactions', 'client', 'booking']);

        return response()->json([
            'message' => 'Payment created successfully',
            'payment' => $payment,
        ], 201);
    }

    /**
     * Update payment status (mark as paid, failed, expired).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,paid,failed,expired',
        ]);

        $oldStatus = $payment->status;
        $newStatus = $request->status;

        $payment->update([
            'status'  => $newStatus,
            'paid_at' => $newStatus === 'paid' ? now() : $payment->paid_at,
        ]);

        // Update the charge transaction status
        if (in_array($newStatus, ['paid', 'failed'])) {
            $payment->transactions()
                ->where('type', 'charge')
                ->where('status', 'pending')
                ->update(['status' => $newStatus === 'paid' ? 'success' : 'failed']);
        }

        // Sync booking payment_status
        if ($newStatus === 'paid') {
            $payment->booking()->update(['payment_status' => 'paid']);
        }

        return response()->json([
            'message' => "Payment status updated from {$oldStatus} to {$newStatus}",
            'payment' => $payment->fresh(['transactions', 'booking']),
        ]);
    }

    /**
     * Process a refund for a payment.
     */
    public function refund(Request $request, int $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'paid') {
            return response()->json([
                'message' => 'Only paid payments can be refunded',
            ], 422);
        }

        $request->validate([
            'amount' => 'nullable|numeric|min:0.01|max:' . $payment->amount,
            'reason' => 'nullable|string|max:500',
        ]);

        $refundAmount = $request->get('amount', $payment->amount);

        // If ADCB Pace Pay, process through the gateway
        $gatewayResponse = null;
        if ($payment->payment_method === 'adcb_pace_pay') {
            $adcb   = new AdcbPacePayService();
            $result = $adcb->processRefund($payment, $refundAmount);
            $gatewayResponse = $result['raw'];

            if (!$result['success']) {
                return response()->json([
                    'message' => 'Gateway refund failed',
                    'details' => $result['raw'],
                ], 502);
            }
        }

        // Create refund transaction
        Transaction::create([
            'payment_id'           => $payment->id,
            'type'                 => 'refund',
            'amount'               => $refundAmount,
            'status'               => 'success',
            'gateway_response'     => $gatewayResponse,
            'description'          => $request->get('reason', 'Refund processed'),
            'processed_by_user_id' => $request->user()?->id,
        ]);

        // Update payment status
        $payment->update(['status' => 'refunded']);
        $payment->booking()->update(['payment_status' => 'refunded']);

        return response()->json([
            'message' => "AED {$refundAmount} refunded successfully",
            'payment' => $payment->fresh(['transactions', 'booking']),
        ]);
    }
}
