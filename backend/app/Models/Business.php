<?php
 
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'website_url',
        'logo_url',
        'cover_url',
        'services',
    ];

    protected $casts = [
        'services' => 'array',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
