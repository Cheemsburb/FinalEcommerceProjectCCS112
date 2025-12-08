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
        // 1. Validate the request
        $validated = $request->validate([
            'model' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'image_link' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable', 
            'case_size' => 'nullable|string',
            'star_review' => 'nullable|numeric'
        ]);

        // 2. Generate a unique ID (Fix for "Field 'id' doesn't have a default value")
        // We generate a random 6-digit ID and ensure it doesn't already exist.
        do {
            $uniqueId = random_int(100000, 999999);
        } while (Product::where('id', $uniqueId)->exists());

        // Assign the generated ID to the data
        $validated['id'] = $uniqueId;

        // 3. Create product
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