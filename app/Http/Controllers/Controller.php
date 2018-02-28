<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\Redirect;

use App;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function getLogin() {
        return view('login');
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

    public function getSettings() {
        if (!Auth::check()) {
            return redirect('./login');
        } else {
            return view('settings');
        }
    }

	public function changePassword(Request $request) {
        if (!Auth::check()) {
            return redirect('./login');
        }

		$oldpass = $request->input('oldpass');
		$newpass = $request->input('newpass');
        $confpass = $request->input('confpass');

        $user = App\User::where('name', env('APP_NAME'))->get()[0];

        if(!\Hash::check($oldpass, $user->password)) {
            return Redirect::back()->withErrors(['Current password is incorrect']);
        }

        if (strlen($newpass) < 8) {
            return Redirect::back()->withErrors(['Password must be at least 8 characters long']);
        }

        if ($newpass != $confpass) {
            return Redirect::back()->withErrors(['New passwords do not match']);
        }

        $user->password = \Hash::make($newpass);
        $user->save();

        return Redirect::back();
	}

    public function uploadFile(Request $request) {
        $note = App\Note::find($request->input('note_id'));

        if ($note == null) return "Note does not exist";

        $file = $request->file('file');
        $path = $ret = Storage::putFileAs($note->id, $file, $file->getClientOriginalName());

        $attachment = App\Attachment::create([
            'note_id' => $note->id,
            'uri' => 'attachments/'.$path,
            'createdAt' => date('Y-m-d H:i:s')
        ]);

        return Redirect::back();
    }
}
