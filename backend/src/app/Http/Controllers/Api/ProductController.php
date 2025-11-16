<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index() { /* Logic to get all products */ }
    public function store(Request $request) { /* Logic to create a product (admin) */ }
    public function show(Product $product) { /* Logic to show a single product */ }
    public function update(Request $request, Product $product) { /* Logic to update a product (admin) */ }
    public function destroy(Product $product) { /* Logic to delete a product (admin) */ }
}