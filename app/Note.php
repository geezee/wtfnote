<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    public $table = 'note';
    public $timestamps = false;

    protected $fillable = ['id', 'title', 'isPinned'];

    public function tags() {
        return $this->belongsToMany('App\Tag', 'note_tag', 'note_id', 'tag_id');
    }

    public function versions() {
        return $this->hasMany('App\Content', 'note_id');
    }

    public function attachments() {
        return $this->hasMany('App\Attachment', 'note_id');
    }
}
