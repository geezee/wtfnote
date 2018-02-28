<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    public $table = 'content';
    public $timestamps = false;

    protected $fillable = ['body', 'createdAt', 'note_id'];

    public function note() {
        return $this->belongsTo('App\Note', 'note_id');
    }
}
