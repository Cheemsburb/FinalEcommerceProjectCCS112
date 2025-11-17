<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product; // <-- Import the Product model
use Illuminate\Support\Facades\File; // <-- Import the File facade

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Read the JSON file
        $json = File::get(database_path('seeders/products.json'));
        $products = json_decode($json, true);

        if ($products) {
            foreach ($products as $productData) {
                
                // 2. Add random stock (since it wasn't in the JSON)
                $productData['stock_quantity'] = rand(10, 50);

                // 3. Create the Product.
                // This works because the $productData keys
                // perfectly match your database columns.
                Product::create($productData);
            }
        }
    }
}