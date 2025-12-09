<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

// === ADD THESE 'use' STATEMENTS ===
use Illuminate\Support\Facades\DB;
use App\Models\Product;
// === END ===

class OrderController extends Controller
{
    /**
     * Display a listing of the user's orders.
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
                    ->with('items.product') // Load items and their product details
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($orders);
    }

    /**
     * Store a newly created order (checkout).
     */
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address_id' => 'required|exists:addresses,id',
            'billing_address_id' => 'required|exists:addresses,id',
        ]);

        $user = $request->user();
        $cart = $user->cart()->with('items.product')->first();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty.'], 400);
        }

        $totalAmount = 0;
        
        // Use a database transaction in case something fails
        $order = DB::transaction(function () use ($user, $cart, $request, &$totalAmount) {
            
            // Calculate total and check stock
            foreach ($cart->items as $item) {
                if ($item->product->stock_quantity < $item->quantity) {
                    // This is a basic check; more complex logic is needed for real-world
                    throw new \Exception('Not enough stock for ' . $item->product->model);
                }
                $totalAmount += $item->product->price * $item->quantity;
            }

            // 1. Create the Order
            $order = $user->orders()->create([
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'shipping_address_id' => $request->input('shipping_address_id'),
                'billing_address_id' => $request->input('billing_address_id'),
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price_at_purchase' => $item->product->price,
            ]);

            // 3. Decrease stock (Uncomment this line)
            $item->product->decrement('stock_quantity', $item->quantity); 
}

            // 4. Clear the user's cart
            $cart->items()->delete();

            return $order;
        });

        return response()->json($order->load('items.product'), 201);
    }

    /**
     * Display the specified order.
     */
    public function show(Request $request, Order $order)
    {
        // Check if this order belongs to the authenticated user
        if ($order->user_id !== $request->user()->id) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order->load('items.product', 'shippingAddress', 'billingAddress'));
    }

    /**
     * ADMIN: Get all orders.
     */
    public function adminIndex()
    {
        // Load user and items with products
        $orders = Order::with(['user', 'items.product'])
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($orders);
    }

    /**
     * ADMIN: Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order->update(['status' => $request->input('status')]);

        return response()->json($order);
    }
}