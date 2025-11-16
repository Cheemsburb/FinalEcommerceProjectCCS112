<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    /**
     * This tells Eloquent that your primary key 'id' is NOT auto-incrementing.
     * This is ESSENTIAL for your seeder.
     */
    public $incrementing = false;

    /**
     * This tells Eloquent to treat the 'category' column as an array.
     * This is ESSENTIAL for your JSON column.
     */
    protected $casts = [
        'category' => 'array',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}