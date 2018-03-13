<?php

use App\Console\Commands\NoteFormatter;



Artisan::command('note-format:list', function () {
    (new NoteFormatter())->list();
})->describe('List all available formatters');


Artisan::command('note-format:install {plugins*}', function ($plugins) {
    (new NoteFormatter())->install($plugins);
})->describe('Install formatters');


Artisan::command('note-format:remove {plugins*}', function ($plugins) {
    (new NoteFormatter())->remove($plugins);
})->describe('Remove formatters');
