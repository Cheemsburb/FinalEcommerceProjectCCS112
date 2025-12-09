<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;       
use App\Http\Controllers\Api\ProductController;   
use App\Http\Controllers\Api\UserController;      
use App\Http\Controllers\Api\CartController;     
use App\Http\Controllers\Api\OrderController;     
use App\Http\Controllers\Api\ReviewController;    
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminController;


// ===============================================
// === PUBLIC ROUTES (No login needed) ===
// ===============================================

// --- Auth ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Products ---
// Everyone can see the products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);


// ===============================================
// === PROTECTED ROUTES (Login required) ===
// ===============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // --- Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- User ---
    // Get the currently logged-in user's details
    Route::get('/user', [UserController::class, 'show']);
    // (You'll add routes for managing user addresses here later)

    // === ADMIN ROUTES ===
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // --- Cart ---
    // Manages the user's personal shopping cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);         // Add an item to the cart
    Route::put('/cart/{cartItem}', [CartController::class, 'update']); // Update item quantity
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']); // Remove item from cart

    // --- Orders ---
    // Manages the user's orders
    Route::get('/orders', [OrderController::class, 'index']);      // Get my order history
    Route::post('/orders', [OrderController::class, 'store']);     // Place a new order (checkout)
    Route::get('/orders/{order}', [OrderController::class, 'show']); // Get details of a single past order

    // --- Reviews ---
    // A user must be logged in to post a review
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

    // --- Address ---
    // Get all my addresses, create a new address
    Route::apiResource('/addresses', AddressController::class); 
    
    // A custom route to set an address as the default
    Route::patch('/addresses/{address}/set-default', [AddressController::class, 'setAsDefault']);

    // ===============================================
    // === ADMIN-ONLY ROUTES ===
    // ===============================================
    // (For now, these are just protected by login.
    // Later, you can add an admin middleware to this group.)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    // --- Product Management (Admin) ---
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});