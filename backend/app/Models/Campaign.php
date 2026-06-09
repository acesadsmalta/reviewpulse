<?php
 
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    use HasUuids;

    protected $fillable = [
        'business_id',
        'name',
        'status',
        'sent',
        'pending',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
