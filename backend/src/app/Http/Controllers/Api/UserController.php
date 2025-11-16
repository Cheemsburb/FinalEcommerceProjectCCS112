<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; // <-- Make sure this line is here

class UserController extends Controller
{
    /**
     * Display the authenticated user's details.
     */
    public function show(Request $request)
    {
        // This is the only code you need.
        // It automatically finds the user from the token.
        return $request->user();
    }
}