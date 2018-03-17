<?php

use App\Console\Commands\NoteFormatter;



Artisan::command('note-format:list {--all}', function ($all) {
    (new NoteFormatter())->list($all);
})->describe('List the installed formatters. Use --all for all');


Artisan::command('note-format:install {--after=} {plugins*}',
  function ($after, $plugins) {
    return (new NoteFormatter())->install($after, $plugins);
})->describe('Install formatters. Use --after= to indicate the index to add at');


Artisan::command('note-format:remove {plugin}', function ($plugin) {
    return (new NoteFormatter())->remove($plugin);
})->describe('Remove a single formatter (by index)');


Artisan::command('note-format:compile', function () {
    return (new NoteFormatter())->writeToOutput();
})->describe('Generate the note-format.out.js file');
