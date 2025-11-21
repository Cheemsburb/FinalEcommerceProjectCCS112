<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Product;
use App\Models\User;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Define a pool of realistic reviews to pick from
        $reviewTemplates = [
            ['rating' => 5, 'description' => "Excellent quality, exceeded my expectations!"],
            ['rating' => 4, 'description' => "Very good product, worth the price."],
            ['rating' => 3, 'description' => "It works fine but could be improved."],
            ['rating' => 5, 'description' => "Absolutely loved it! Highly recommended."],
            ['rating' => 4, 'description' => "Good quality and fast shipping."],
            ['rating' => 2, 'description' => "Not the best experience. Had some issues."],
            ['rating' => 5, 'description' => "Fantastic product. Will buy again!"],
            ['rating' => 4, 'description' => "Solid and reliable. Pretty satisfied."],
            ['rating' => 3, 'description' => "Average quality. You get what you pay for."],
            ['rating' => 5, 'description' => "Perfect item! No complaints at all."],
            ['rating' => 5, 'description' => "Best purchase I've made all year."],
            ['rating' => 1, 'description' => "Delivery was slow, but the item is okay."]
        ];

        // 2. Get all products
        $products = Product::all();
        
        // 3. Get ONLY 'customer' users (Exclude admins)
        $users = User::where('role', 'customer')->get();

        if ($products->isEmpty() || $users->isEmpty()) {
            return;
        }

        // 4. Loop through EVERY product
        foreach ($products as $product) {
            
            // Create exactly 6 reviews for this product
            for ($i = 0; $i < 6; $i++) {
                // Pick a random review template
                $template = $reviewTemplates[array_rand($reviewTemplates)];
                
                // Pick a random user (from the filtered customer list)
                $randomUser = $users->random();

                Review::create([
                    'user_id' => $randomUser->id,
                    'product_id' => $product->id,
                    'rating' => $template['rating'],
                    'description' => $template['description'],
                ]);
            }

            // 5. Update the product's average star rating
            $product->star_review = $product->reviews()->avg('rating');
            $product->save();
        }
    }
}