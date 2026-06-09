<?php
 
namespace Database\Seeders;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Super Admin account
        User::create([
            'name' => 'Chief Admin',
            'email' => 'admin@reviewpulse.com',
            'password' => Hash::make('Admin@Aceads123.'),
            'role' => 'superadmin',
        ]);
    }
}
