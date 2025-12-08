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
     * Show the currently logged-in user.
     */
    public function show(Request $request)
    {
        return $request->user();
    }

    /**
     * Update the currently logged-in user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validatedData = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20', 
            'email' => [
                'sometimes', 
                'email', 
                Rule::unique('users')->ignore($user->id),
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
     * [ADMIN ONLY] List all users.
     */
    public function index(Request $request)
    {
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
        // 1. Log that we reached this method
        \Illuminate\Support\Facades\Log::info('Admin attempting to create user', $request->all());

        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,customer',
        ]);

        // 2. Log the validated data
        \Illuminate\Support\Facades\Log::info('Validation passed', $validatedData);

        $user = User::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'phone_number' => $validatedData['phone_number'],
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'],
        ]);

        // 3. Log the created user ID
        \Illuminate\Support\Facades\Log::info('User created with ID: ' . $user->id);

        if ($user->role === 'customer') {
            $user->cart()->create();
        }

        return response()->json($user, 201);
    }

    /**
     * [ADMIN ONLY] Update a specific user's details.
     */
    public function updateUser(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'required|string|max:20',
            'role'       => 'required|in:admin,customer',
            'password'   => 'nullable|string|min:8',
        ]);

        $user->first_name = $validatedData['first_name'];
        $user->last_name  = $validatedData['last_name'];
        $user->email      = $validatedData['email'];
        $user->phone_number = $validatedData['phone_number'];
        $user->role       = $validatedData['role'];

        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * [ADMIN ONLY] Delete a user.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userToDelete = User::find($id);

        if (!$userToDelete) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($userToDelete->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account via this endpoint.'], 400);
        }

        $userToDelete->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}