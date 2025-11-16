<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review; // <-- Import Review
use Illuminate\Support\Facades\File; // <-- Import File

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/reviews.json'));
        $reviews = json_decode($json, true);

        if ($reviews) {
            foreach ($reviews as $reviewData) {
                // Keys match the database columns, so we can create directly
                Review::create($reviewData);
            }
        }
    }
}