<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_revenue' => Order::sum('total_amount'),
            'total_orders' => Order::count(),
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'total_products' => Product::count(),
            'low_stock_count' => Product::where('stock_quantity', '<', 5)->count(),
        ]);
    }
}