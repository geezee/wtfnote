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


    public function update($noteId, Request $request) {
        $note = App\Note::find($noteId);

        if (is_null($note)) {
            return response()->json(makeError("Note does not exist"));
        }

        $modified = $request->input("modified");
        $data = $request->input("note");

        if (in_array("title", $modified)) {
            $note->title = $data["title"];
            $note->save();
        }

        if (in_array("tag", $modified)) {
            $tags = array_map(function ($tag) {
                $t = App\Tag::firstOrCreate([ "title" => $tag ]);
                return $t->id;
            }, $data["tag"]);
            $note->tags()->detach();
            $note->tags()->attach($tags);
        }

        if (in_array("body", $modified)) {
            $content = App\Content::create([
                "body" => $data["body"],
                "note_id" => $note->id,
                "createdAt" => date('Y-m-d H:i:s')
            ]);
        }

        return response()->json($request->input());
    }
}
