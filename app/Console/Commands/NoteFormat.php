<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class NoteFormatter extends Command
{
    private $map;

    public function __construct() {
        $this->map = $this->getMap();
    }

    const DIR = "./resources/note-format/";
    const REPOSITORY = "./resources/note-format/repository.json";
    const OUT  = "./resources/note-format/note-format.out.js";


    public function getContent() {
        return json_decode(File::get(NoteFormatter::REPOSITORY));
    }


    public function getMap() {
        return collect(NoteFormatter::getContent())->reduce(function($map, $plugin) {
            $map[$plugin->name] = $plugin;
            return $map;
        });
    }

    public function getInstalled() {
        return collect(array_keys($this->map))->filter(function($name) {
            return $this->map[$name]->installed;
        });
    }

    public function writeToOutput() {
        $out = "const formatters = {\n";
        foreach ($this->getInstalled() as $installed) {
            $out .= sprintf("%s: %s,\n",
                $installed, File::get($this::DIR.$this->map[$installed]->src));
        }
        $out .= "}";

        File::put($this::OUT, $out);
    }


    public function list() {
        $plugins = json_decode(File::get($this::REPOSITORY), true);
        printf("%d available formatters\n\n", count(array_keys($plugins)));
        foreach ($plugins as $name=>$plugin) {
            printf("%s%-20s - %s\n",
                $plugin["installed"] ? "* " : "  ", $name, $plugin["description"]);
        }
    }


    public function install($requested) {
        foreach ($requested as $plugin) {
            if (!isset($this->map[$plugin])) {
                printf("[ERROR] Formatter $plugin does not exist\n");
                return;
            }
        }

        foreach ($requested as $plugin) {
            $this->map[$plugin]->installed = true;
        }

        $this->writeToOutput();

        File::put($this::REPOSITORY, json_encode($this->map, JSON_PRETTY_PRINT));
    }


    public function remove($requested) {
         foreach ($requested as $plugin) {
            if (!isset($this->map[$plugin])) {
                printf("[ERROR] Formatter $plugin does not exist\n");
                return;
            }
        }

        foreach ($requested as $plugin) {
            $this->map[$plugin]->installed = false;
        }

        $this->writeToOutput();

        File::put($this::REPOSITORY, json_encode($this->map, JSON_PRETTY_PRINT));
   }

    
}
