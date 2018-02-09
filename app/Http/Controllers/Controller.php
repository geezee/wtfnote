<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;

use App;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function getLogin() {
        return view("login");
    }

    public function postLogin(Request $request) {
        $userData = [
            'name' => env('APP_NAME'),
            'password' => $request->input('password', '')
        ];

        Auth::attempt($userData, $request->input('_remember_me', false) == 'on');
        return redirect()->route('home');
    }

    public function getLogout() {
        Auth::logout();
        return redirect('./login');
    }

    public function getApplication() {
        if (!Auth::check()) {
            return redirect('./login');
        } else {
            return response()->file(resource_path().'/views/index.html');
        }
    }
}
