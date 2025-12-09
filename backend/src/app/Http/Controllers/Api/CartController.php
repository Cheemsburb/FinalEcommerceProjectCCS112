<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart) {
            return response()->json(['message' => 'No cart found for user.'], 404);
        }

        return response()->json($cart);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();
        $cart = $user->cart;

        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');

        
        $product = Product::find($productId);
        
        
        if ($product->stock_quantity <= 0) {
             return response()->json(['message' => 'This product is currently out of stock.'], 400);
        }

        
        if ($product->stock_quantity < $quantity) {
             return response()->json(['message' => "Only {$product->stock_quantity} left in stock."], 400);
        }
      

        $cartItem = $cart->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }

        return response()->json($cartItem, 201);
    }

    public function update(Request $request, $cartItemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::find($cartItemId);

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        if ($cartItem->cart_id !== $request->user()->cart->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->quantity = $request->input('quantity');
        $cartItem->save();

        return response()->json($cartItem);
    }

    public function destroy(Request $request, $cartItemId)
    {
        $cartItem = CartItem::find($cartItemId);

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        if ($cartItem->cart_id !== $request->user()->cart->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart'], 200);
    }
}