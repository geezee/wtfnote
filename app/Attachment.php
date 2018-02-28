<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    public $table = "attachment";
    public $timestamps = false;

    protected $fillable = [ 'uri', 'createdAt', 'note_id' ];

    public function note() {
        return $this->hasOne('App\Note', 'note_id');
    }
}
