<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App;

class ApiController extends Controller
{
    public function getAllNotes() {
        return response()->json(App\Note::all()->map(function($note) {
            return [
                "id" => $note->id,
                "title" => $note->title,
                "isPinned" => (bool) $note->isPinned,
                "tags" => $note->tags->pluck("title"),
                "versions" => $note->versions()->orderBy('createdAt', 'desc')
                    ->get()->map(function($version) {
                        return [
                            "body" => $version->body,
                            "createdAt" => $version->createdAt
                        ];
                })
            ];
        }));
    }


    public function setPin($noteId, Request $request) {
        $pin = strtolower($request->input("pin")) === "true";
        $note = App\Note::find($noteId);
        if (is_null($note)) {
            return response()->json(makeError("Note does not exist"));
        }

        $note->isPinned = $pin;
        $note->save();

        return response()->json(noError());
    }


    public function create($noteId) {
        $note = App\Note::find($noteId);
        if (!is_null($note)) {
            return response()->json(makeError("Note exists"));
        }

        $note = App\Note::create([ "title" => "", "isPinned" => false ]);
        $note->id = $noteId;
        $note->save();

        return response()->json(noError());
    }


    public function delete($noteId) {
        $note = App\Note::find($noteId);
        if (is_null($note)) {
            return response()->json(makeError("Note does not exist"));
        }

        $note->tags()->detach();
        App\Content::where("note_id", $noteId)->delete();
        $note->delete();

        return response()->json(noError());
    }
}
