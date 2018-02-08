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
Route::get('/note/{id}/setPin', 'ApiController@setPin');
Route::get('/note/{id}/create', 'ApiController@create');
Route::get('/note/{id}/delete', 'ApiController@delete');
