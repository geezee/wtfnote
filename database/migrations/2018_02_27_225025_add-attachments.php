<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAttachments extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('attachment', function(Blueprint $table) {
            $table->increments('id');
            $table->string('uri');
            $table->dateTimeTz('createdAt');
            $table->unsignedInteger('note_id');
        });

        Schema::table('attachment', function(Blueprint $table) {
            $table->foreign('note_id')->references('id')->on('note')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attachment');
    }
}
