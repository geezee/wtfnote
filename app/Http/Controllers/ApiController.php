<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App;

class ApiController extends Controller
{

    public function __construct() {
        $this->middleware(function($request, $next) {
            if(!Auth::check()) return abort(403);
            else return $next($request);
        });
    }

    public function getAllNotes() {
        return response()->json(App\Note::all()->map(function($note) {
            return [
                'id' => $note->id,
                'title' => $note->title,
                'isPinned' => (bool) $note->isPinned,
                'tags' => $note->tags->pluck('title'),
                'attachments' => $note->attachments->pluck('uri'),
                'number_versions' => $note->versions()->count(),
                'versions' => $note->versions()->orderBy('createdAt', 'desc')
                    ->take(5)->get()->flatMap(function($version, $i) {
                        return [
                            $i => [
                                'body' => $version->body,
                                'createdAt' => $version->createdAt
                            ]
                        ];
                })
            ];
        }));
    }


    public function getVersion($noteId, $versionIndex) {
        $note = App\Note::find($noteId);
        if (is_null($note)) {
            return response()->json(makeError('Note does not exist'));
        }
        return response()->json($note->versions()->orderBy('createdAt', 'desc')
            ->skip($versionIndex)->take(1)->get([ 'createdAt', 'body' ])->first());
    }


    public function setPin($noteId, Request $request) {
        $pin = $request->input('pin') == 'true';
        $note = App\Note::find($noteId);
        if (is_null($note)) {
            return response()->json(makeError('Note does not exist'));
        }

        $note->isPinned = $pin;
        $note->save();

        return response()->json(noError());
    }


    public function create() {
        $note = App\Note::create([ 'title' => '', 'isPinned' => false ]);

        return response()->json([
          'id' => $note->id
        ]);
    }


    public function delete($noteId) {
        $note = App\Note::find($noteId);
        if (is_null($note)) {
            return response()->json(makeError('Note does not exist'));
        }

        $note->tags()->detach();
        App\Content::where('note_id', $noteId)->delete();
        $note->delete();

        return response()->json(noError());
    }


    public function update($noteId, Request $request) {
        $note = App\Note::find($noteId);

        if (is_null($note)) {
            return response()->json(makeError('Note does not exist'));
        }

        $modified = $request->input('modified');
        $data = $request->input('note');
        $timestamp = date('Y-m-d H:i:s');

        if (in_array('title', $modified)) {
            $note->title = $data['title'];
            $note->save();
        }

        if (in_array('tag', $modified)) {
            $tags = array_map(function ($tag) {
                $t = App\Tag::firstOrCreate([ 'title' => $tag ]);
                return $t->id;
            }, $data['tag']);
            $note->tags()->detach();
            $note->tags()->attach($tags);
        }

        if (in_array('body', $modified)) {
            $content = App\Content::create([
                'body' => $data['body'],
                'note_id' => $note->id,
                'createdAt' => $timestamp
            ]);
        }

        $output = $request->input();
        $output['timestamp'] = $timestamp;
        return response()->json($output);
    }


    public function restore($noteId, Request $request) {
        $note = App\Note::find($noteId);
        $version = $request->input('version', 0);

        if (is_null($note)) {
            return response()->json(makeError('Note does not exist'));
        }

        if ($version <= 0) {
            return response()->json(noError());
        }

        $index = $note->versions->count() - $version - 1;

        $note->versions->slice($index+1)->each(function ($version) {
            $version->delete();
        });

        return response()->json(noError());
    }

    public function deleteAttachment(Request $request) {
        $uri = $request->input('uri');
        App\Attachment::where('uri', $uri)->delete();
        return response()->json(noError());
    }
}
