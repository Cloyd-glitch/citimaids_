<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * List all transactions (admin, filterable).
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

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json($transactions);
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
}
