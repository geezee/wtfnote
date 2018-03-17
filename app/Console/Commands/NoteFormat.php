<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class NoteFormatter
{
    private $state;
    private $repo;

    public function __construct() {
        $this->state = $this->getState();
        $this->repo = $this->getRepositoryMap();
    }

    const DIR = "./resources/note-format/";
    const STATE = "./resources/note-format/state.json";
    const REPOSITORY = "./resources/note-format/repository.json";
    const OUT  = "./resources/note-format/note-format.out.js";
    const COMMON_JS = "./resources/note-format/src/common.js";


    public function getRepository() {
        return json_decode(File::get(NoteFormatter::REPOSITORY));
    }


    public function getRepositoryMap() {
        return collect(NoteFormatter::getRepository())->reduce(function($map, $plugin) {
            $map[$plugin->name] = $plugin;
            return $map;
        });
    }

    public function getState() {
        return json_decode(File::get(NoteFormatter::STATE));
    }

    public function writeToOutput() {
        $out = File::get(NoteFormatter::COMMON_JS)."\nconst formatters=[";
        foreach ($this->state->installed as $installed) {
            $out .= sprintf("%s,", File::get($this::DIR.$this->repo[$installed]->src));
        }
        $out .= "]";

        return File::put($this::OUT, $out);
    }


    public function list($all) {
        if ($all) {
            printf("%d available formatters\n\n", count(array_keys($this->repo)));
            foreach ($this->repo as $plugin) {
                printf("%s%-20s - %s\n",
                    in_array($plugin->name, $this->state->installed) ? "* " : "  ",
                    $plugin->name, $plugin->description);
            }
        } else {
            $index = 1;
            foreach ($this->state->installed as $name) {
                printf("%3d. %-20s - %s\n", $index, $name, $this->repo[$name]->description);
                $index++;
            }
        }
    }


    public function install($after, $requested) {
        if (strlen($after) == 0) {
            $index = 0;
        } else {
            $index = intval($after);
            if ($index === false || $index > count($this->state->installed)) {
                printf("[ERROR] Index $after does not exist\n");
                $this->list(false);
                return -1;
            }
        }

        foreach ($requested as $plugin) {
            if (!isset($this->repo[$plugin])) {
                printf("[ERROR] Formatter $plugin does not exist\n");
                return -1;
            }
        }

        array_splice($this->state->installed, $index, 0, $requested);

        $this->writeToOutput();

        File::put($this::STATE, json_encode($this->state));
    }


    public function remove($index) {
        $index = intval($index);
        if ($index === false || $index <= 0 || $index > count($this->state->installed)) {
            printf("[ERROR] Index does not exist\n");
            return;
        }

        $this->state->installed = array_values(collect($this->state->installed)->forget($index-1)->toArray());

        $this->writeToOutput();

        File::put($this::STATE, json_encode($this->state));
   }

    
}
