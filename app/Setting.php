<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $table = "settings";
    public $timestamps = false;

    protected $fillable = ["key", "value"];

    public static function get(String $key, $default = null) {
        $field = static::where("key", "=", $key)->first();
        if (is_null($field)) {
            return $default;
        }
        return $field->value;
    }

    public static function set(String $key, String $value) {
        $field = new Setting([ "key" => $key, "value" => $value ]);
        $field->save();
        return $field;
    }
}
