<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * List all transactions (admin, filterable, searchable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['payment.booking.service', 'payment.client', 'processedBy'])
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_id')) {
            $query->where('payment_id', $request->payment_id);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('amount', 'like', "%{$s}%")
                  ->orWhere('type', 'like', "%{$s}%")
                  ->orWhere('status', 'like', "%{$s}%")
                  ->orWhereHas('payment', function ($pq) use ($s) {
                      $pq->where('reference_number', 'like', "%{$s}%")
                         ->orWhere('external_reference', 'like', "%{$s}%")
                         ->orWhereHas('client', fn($cq) => $cq->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
                         ->orWhereHas('booking', fn($bq) => $bq->where('id', 'like', "%{$s}%"));
                  });
            });
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    /**
     * Show a single transaction with associations.
     */
    public function show(int $id): JsonResponse
    {
        $transaction = Transaction::with(['payment.booking.service', 'payment.client', 'processedBy'])
            ->findOrFail($id);

        return response()->json($transaction);
    }

    /**
     * Retry a failed transaction.
     */
    public function retry(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::with(['payment.booking.service', 'payment.client', 'processedBy'])
            ->findOrFail($id);

        $transaction->update([
            'status' => 'pending',
            'description' => $transaction->description ? ($transaction->description . ' (Retry initiated)') : 'Payment retry initiated',
            'processed_by_user_id' => $request->user()?->id ?? $transaction->processed_by_user_id,
        ]);

        if ($transaction->payment) {
            $transaction->payment->update(['status' => 'pending']);
            if ($transaction->payment->booking) {
                $transaction->payment->booking->update(['payment_status' => 'unpaid']);
            }
        }

        return response()->json([
            'message' => "Transaction #{$id} retry initiated successfully",
            'transaction' => $transaction->fresh(['payment.booking.service', 'payment.client', 'processedBy']),
        ]);
    }

    /**
     * Remove / Dismiss a transaction (especially failed).
     */
    public function destroy(int $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);
        $txId = $transaction->id;
        $transaction->delete();

        return response()->json([
            'message' => "Transaction #{$txId} dismissed and removed successfully",
        ]);
    }

    /**
     * Dismiss action endpoint alias for failed transaction.
     */
    public function dismiss(int $id): JsonResponse
    {
        return $this->destroy($id);
    }

    /**
     * Get receipt details for a transaction.
     */
    public function receipt(int $id): JsonResponse
    {
        $transaction = Transaction::with(['payment.booking.service', 'payment.client', 'processedBy'])
            ->findOrFail($id);

        return response()->json([
            'receipt_number' => 'RCP-' . str_pad((string)$transaction->id, 6, '0', STR_PAD_LEFT),
            'issued_at' => now()->toIso8601String(),
            'transaction' => $transaction,
        ]);
    }

    /**
     * List transactions for a specific payment.
     */
    public function byPayment(int $paymentId): JsonResponse
    {
        $transactions = Transaction::with('processedBy')
            ->where('payment_id', $paymentId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($transactions);
    }

    /**
     * Update transaction details (description, notes, reference_number).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);

        $request->validate([
            'description'      => 'nullable|string|max:1000',
            'notes'            => 'nullable|string|max:2000',
            'reference_number' => 'nullable|string|max:100',
        ]);

        if ($request->has('description')) {
            $transaction->update(['description' => $request->description]);
        }

        if ($transaction->payment) {
            $paymentUpdates = [];
            if ($request->has('notes')) $paymentUpdates['notes'] = $request->notes;
            if ($request->has('reference_number')) $paymentUpdates['reference_number'] = $request->reference_number;
            if (!empty($paymentUpdates)) {
                $transaction->payment->update($paymentUpdates);
            }
        }

        return response()->json([
            'message' => 'Transaction details updated successfully',
            'transaction' => $transaction->fresh(['payment.booking.service', 'payment.client', 'processedBy']),
        ]);
    }

    /**
     * Update transaction status (success, failed, pending).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,success,failed']);

        $transaction->update(['status' => $request->status]);

        if ($transaction->payment) {
            $paymentStatus = $request->status === 'success' ? 'paid' : ($request->status === 'failed' ? 'failed' : 'pending');
            $transaction->payment->update([
                'status'  => $paymentStatus,
                'paid_at' => $paymentStatus === 'paid' ? now() : $transaction->payment->paid_at,
            ]);
            if ($transaction->payment->booking && $paymentStatus === 'paid') {
                $transaction->payment->booking->update(['payment_status' => 'paid']);
            }
        }

        return response()->json([
            'message' => "Transaction status updated to {$request->status}",
            'transaction' => $transaction->fresh(['payment.booking.service', 'payment.client', 'processedBy']),
        ]);
    }
}
