<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // <-- Import User
use Illuminate\Support\Facades\File; // <-- Import File

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/users.json'));
        $users = json_decode($json, true);

        if ($users) {
            foreach ($users as $userData) {
                // 1. Create the user
                // This works because your JSON password is pre-hashed
                $user = User::create($userData);

                // 2. Create a cart for each user, just like in the AuthController
                if ($user->role === 'customer') {
                    $user->cart()->create();
                }
            }
        }
    }
}