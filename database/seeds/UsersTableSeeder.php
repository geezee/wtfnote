<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'name' => env('APP_NAME'),
            'email' => env('APP_NAME'),
            'password' => Hash::make('admin'),
            'remember_token' => ''
        ]);
    }
}
