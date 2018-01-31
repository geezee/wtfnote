<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    public $table = "note";
    public $timestamps = false;

    protected $fillable = ["title", "isPinned"];

    public function tags() {
        return $this->belongsToMany("App\Tag", "note_tag", "tag_id", "note_id");
    }

    public function versions() {
        return $this->hasMany("App\Content", "note_id");
    }

    // TODO: setNewestVersionAttribute
    // TODO: getNewestVersionAttribute
    // TODO: getVersionNumberAttribute
    // TODO: getCreatedAtAttribute
}
