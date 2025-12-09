<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('reviews.user')->get();
    }

    public function store(Request $request)
    {
       
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

      
        do {
            $uniqueId = random_int(100000, 999999);
        } while (Product::where('id', $uniqueId)->exists());

        
        $validated['id'] = $uniqueId;

        $product = Product::create($validated);
        
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return $product->load('reviews.user');
    }

    public function update(Request $request, Product $product)
    {
        
        $validated = $request->validate([
            'model' => 'sometimes|string|max:255',
            'brand' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric',
            'stock_quantity' => 'sometimes|integer',
            'image_link' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable', 
            'case_size' => 'nullable|string',
            'star_review' => 'nullable|numeric'
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}