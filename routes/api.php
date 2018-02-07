<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Returns all the notes in the database with their versions
Route::get('/note/all', 'ApiController@getAllNotes');

// Remove a note from the database
Route::get('/note/delete', function (Request $request) {

});

// Modify a note
Route::get('/note/edit', function (Request $request) {

});
