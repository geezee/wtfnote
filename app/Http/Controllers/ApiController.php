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
}
