<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash; // <-- Import Hash

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('seeders/users.json'));
        $users = json_decode($json, true);

        if ($users) {
            foreach ($users as $userData) {
                // Hash the specific password provided in the JSON
                // (e.g., "adminpass" becomes a secure hash)
                $userData['password'] = Hash::make($userData['password']);

                // 1. Create the user
                $user = User::create($userData);

                // 2. Create a cart for each user
                // (Admins usually don't need carts, but customers do)
                if ($user->role === 'customer') {
                    $user->cart()->create();
                }
            }
        }
    }
}