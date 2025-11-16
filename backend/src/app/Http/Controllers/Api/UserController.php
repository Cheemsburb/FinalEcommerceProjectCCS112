<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display the authenticated user's details.
     */
    public function show(Request $request)
    {
        // Laravel's $request->user() automatically finds the
        // user associated with the API token.
        return $request->user();
    }
}