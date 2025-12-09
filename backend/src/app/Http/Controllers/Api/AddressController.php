<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses;
        return response()->json($addresses);
    }

   
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'address' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:20',
        ]);

        
        $address = $request->user()->addresses()->create($validatedData);

        return response()->json($address, 201);
    }

    
    public function show(Request $request, Address $address)
    {
        
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($address);
    }

    
    public function update(Request $request, Address $address)
    {
        
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

    
    public function destroy(Request $request, Address $address)
    {
     
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();

        return response()->json(null, 204); 
    }

    
    public function setAsDefault(Request $request, Address $address)
    {
        
        if ($request->user()->id !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        
        $request->user()->addresses()->update(['is_default' => false]);

        
        $address->is_default = true;
        $address->save();

        return response()->json($address);
    }
}