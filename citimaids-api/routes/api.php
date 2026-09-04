<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// Public booking submission (customers)
Route::post('/bookings', [BookingController::class, 'store']);

// Public services list (customer-facing, active only)
Route::get('/services', [ServiceController::class, 'index']);

// ─── Protected Routes (Sanctum Auth Required) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Bookings (admin)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    // Clients
    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

    // Services (admin CRUD)
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    Route::post('/services/reorder', [ServiceController::class, 'reorder']);


    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/bookings/{id}/payment', [PaymentController::class, 'createForBooking']);
    Route::patch('/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/payments/{id}/transactions', [TransactionController::class, 'byPayment']);
});
