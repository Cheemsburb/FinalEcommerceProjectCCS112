<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// === ADD THESE 'use' STATEMENTS ===
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth; // Auth facade
// === END ===

class CartController extends Controller
{
    /**
     * Display the user's cart.
     */
    public function index(Request $request)
    {
        // 1. Get the authenticated user
        $user = $request->user();

        // 2. Find the user's cart (which was created at registration)
        // and load all the 'items' in that cart,
        // and for each 'item', also load the 'product' details.
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart) {
            return response()->json(['message' => 'No cart found for user.'], 404);
        }

        return response()->json($cart);
    }

    /**
     * Add an item to the cart.
     */
    public function store(Request $request)
    {
        // 1. Validate the incoming request
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        // 2. Get the user and their cart
        $user = $request->user();
        $cart = $user->cart;

        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');

        // 3. Check if the product is already in the cart
        $cartItem = $cart->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            // If it is, just update the quantity
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            // If it's not, create a new cart item
            $cartItem = $cart->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }

        return response()->json($cartItem, 201);
    }

    /**
     * Update the quantity of an item in the cart.
     */
    public function update(Request $request, $cartItemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Find the cart item
        $cartItem = CartItem::find($cartItemId);

        // Check if it exists
        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        // Check if this item belongs to the authenticated user's cart
        if ($cartItem->cart_id !== $request->user()->cart->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update the quantity
        $cartItem->quantity = $request->input('quantity');
        $cartItem->save();

        return response()->json($cartItem);
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(Request $request, $cartItemId)
    {
        // Find the cart item
        $cartItem = CartItem::find($cartItemId);

        // Check if it exists
        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        // Check if this item belongs to the authenticated user's cart
        if ($cartItem->cart_id !== $request->user()->cart->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete the item
        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart'], 200);
    }
}