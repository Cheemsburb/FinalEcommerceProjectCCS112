<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product; // <-- 1. ADD THIS IMPORT
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 2. ADD THIS LINE
        return Product::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Logic to create a product (admin only)
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // 3. ADD THIS LINE (for your next test)
        // This works because of Laravel's "Route Model Binding"
        return $product;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Logic to update a product (admin only)
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Logic to delete a product (admin only)
    }
}