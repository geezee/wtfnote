<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::post('/login', 'Controller@postLogin');
Route::get('/login', 'Controller@getLogin')->name('login');
Route::get('/logout', 'Controller@getLogout');
Route::get('/', 'Controller@getApplication')->name('home');
Route::get('/settings', 'Controller@getSettings');
Route::post('/settings', 'Controller@changePassword');
Route::post('/upload', 'Controller@uploadFile');
