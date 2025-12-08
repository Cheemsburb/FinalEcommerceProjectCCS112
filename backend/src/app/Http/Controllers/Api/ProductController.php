<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function store(Request $request)
    {
        // 1. Validate the request to ensure safety
        $validated = $request->validate([
            'model' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'image_link' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable', // Array or string handling
            'case_size' => 'nullable|string',
            'star_review' => 'nullable|numeric'
        ]);

        // 2. Explicitly create product using validated data
        // This ignores any 'id' passed in the request body
        $product = Product::create($validated);
        
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return $product->load('reviews.user');
    }

    public function update(Request $request, Product $product)
    {
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}