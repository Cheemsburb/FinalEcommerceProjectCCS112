<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];
    public function user() { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
    public function shippingAddress() { return $this->belongsTo(Address::class, 'shipping_address_id'); }
    public function billingAddress() { return $this->belongsTo(Address::class, 'billing_address_id'); }
}