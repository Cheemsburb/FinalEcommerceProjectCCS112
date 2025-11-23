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
     * [ADMIN ONLY] Create a new user.
     */
    public function store(Request $request)
    {
        // Check if the requester is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate the incoming data
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,customer', // Ensure role is valid
        ]);

        // Create the user
        $user = User::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']), // Hash the password
            'role' => $validatedData['role'],
        ]);

        // Return the new user
        return response()->json($user, 201);
    }

    /**
     * [ADMIN ONLY] Update a specific user's details.
     */
    public function updateUser(Request $request, $id)
    {
        // Check if requester is admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate input
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            // Unique check ignores the current user's ID
            'email'      => 'required|email|unique:users,email,' . $user->id, 
            'role'       => 'required|in:admin,customer',
            'password'   => 'nullable|string|min:8', // Password is optional
        ]);

        // Update fields
        $user->first_name = $validatedData['first_name'];
        $user->last_name  = $validatedData['last_name'];
        $user->email      = $validatedData['email'];
        $user->role       = $validatedData['role'];

        // Only hash and update password if a new one was provided
        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save();

        return response()->json($user);
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