<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Review;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'description' => 'nullable|string',
        ]);

        // Check if user has already reviewed this product
        $existingReview = $product->reviews()->where('user_id', $request->user()->id)->first();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        $review = $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $request->input('rating'),
            'description' => $request->input('description'),
        ]);

        // Optional: Recalculate and update the product's average 'star_review'
        $product->star_review = $product->reviews()->avg('rating');
        $product->save();

        return response()->json($review, 201);
    }
}