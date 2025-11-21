<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display the authenticated user's details.
     */
    public function show(Request $request)
    {
        return $request->user();
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes', 
                'email', 
                Rule::unique('users')->ignore($user->id), // Allow them to keep their current email
            ],
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json($user);
    }

    /**
     * [ADMIN ONLY] Display a listing of all users.
     */
    public function index(Request $request)
    {
        // Check if the requester is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return User::all();
    }

    /**
     * [ADMIN ONLY] Delete a specific user.
     */
    public function destroy(Request $request, $id)
    {
        // Check if the requester is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userToDelete = User::find($id);

        if (!$userToDelete) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent admin from deleting themselves
        if ($userToDelete->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account via this endpoint.'], 400);
        }

        $userToDelete->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}