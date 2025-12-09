<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $guarded = []; // <-- ADD THIS LINE

    /**
     * An Address belongs to one User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}