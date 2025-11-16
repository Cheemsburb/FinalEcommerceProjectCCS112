<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request) { /* Logic to get user's past orders */ }
    public function store(Request $request) { /* Logic to create a new order (checkout) */ }
    public function show(Request $request, Order $order) { /* Logic to show a single past order */ }
}