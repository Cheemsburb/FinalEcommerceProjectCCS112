<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses;
        return response()->json($addresses);
    }

    /**
     * Store a newly created address in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'address' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
        ]);

        // Create the address and associate it with the logged-in user
        $address = $request->user()->addresses()->create($validatedData);

        return response()->json($address, 201);
    }

    /**
     * Display the specified address.
     */
    public function show(Request $request, Address $address)
    {
        // Check if the user owns this address
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($address);
    }

    /**
     * Update the specified address in storage.
     */
    public function update(Request $request, Address $address)
    {
        // Check if the user owns this address
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'address' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
        ]);

        $address->update($validatedData);

        return response()->json($address);
    }

    /**
     * Remove the specified address from storage.
     */
    public function destroy(Request $request, Address $address)
    {
        // Check if the user owns this address
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json(null, 204); // 204 = No Content
    }

    /**
     * Set a specific address as the default.
     */
    public function setAsDefault(Request $request, Address $address)
    {
        // Check if the user owns this address
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // First, set all other addresses for this user to 'is_default' = false
        $request->user()->addresses()->update(['is_default' => false]);

        // Now, set the specified address as the default
        $address->is_default = true;
        $address->save();

        return response()->json($address);
    }
}