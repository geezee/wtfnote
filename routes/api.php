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
Route::group(['middleware' => ['web']], function() {
    Route::get('/note/all', 'ApiController@getAllNotes');
    Route::get('/note/{id}/create', 'ApiController@create');
    Route::get('/note/{id}/delete', 'ApiController@delete');
    Route::post('/note/{id}/setPin', 'ApiController@setPin');
    Route::post('/note/{id}/update', 'ApiController@update');
    Route::post('/note/{id}/restore', 'ApiController@restore');
    Route::post('/attachment/delete', 'ApiController@deleteAttachment');
});
