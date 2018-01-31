<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class InitalDb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("settings", function(Blueprint $table) {
            $table->string("key", 100)->unique();
            $table->text("value");
        });

        Schema::create("note", function(Blueprint $table) {
            $table->increments("id");
            $table->string("title", 100)->unique();
            $table->boolean("isPinned");
        });

        Schema::create("content", function(Blueprint $table) {
            $table->increments("id");
            $table->text("body");
            $table->dateTimeTz("createdAt");
            $table->unsignedInteger("note_id");
        });

        Schema::create("tag", function(Blueprint $table) {
            $table->increments("id");
            $table->string("title", 100)->unique();
        });

        Schema::create("note_tag", function(Blueprint $table) {
            $table->unsignedInteger("note_id");
            $table->unsignedInteger("tag_id");
        });

        Schema::table("note_tag", function(Blueprint $table) {
            $table->foreign("note_id")->references("id")->on("note")->onDelete("cascade");
            $table->foreign("tag_id")->references("id")->on("tag")->onDelete("cascade");
        });

        Schema::table("content", function(Blueprint $table) {
            $table->foreign("note_id")->references("id")->on("note")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("settings");
        Schema::dropIfExists("note");
        Schema::dropIfExists("content");
        Schema::dropIfExists("tag");
        Schema::dropIfExists("note_tag");
    }
}
