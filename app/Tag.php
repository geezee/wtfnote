<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public $table = 'tag';
    public $timestamps = false;

    protected $fillable = ['title'];

    public function notes() {
        return $this->belongsToMany('App\Note', 'note_tag', 'note_id', 'tag_id');
    }
}
