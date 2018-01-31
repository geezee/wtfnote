<!DOCTYPE html>
<html>
    <head>
        <title>WTFnote</title>
        <meta charset="utf-8">
        <link rel="stylesheet" href="css/bootstrap.css">
        <link rel="stylesheet" href="css/open-iconic.css">
        <link rel="stylesheet" href="css/style.css">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    </head>

    <body>
        <div id="app" class="container-fluid">
            <div class="row">

                <div class="col-3 left">
                    <div class="row search">
                        <div class="col-12">
                            <input type="text" class="form-control" placeholder="Search">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <ul class="list-group">
                                <li v-for="note in notes" v-on:click="selectNote(note)" class="list-group-item"
                                    v-bind:class="{ focused: selectedNote.id == note.id }">
                                    <h2><span class="oi" data-glyph="bolt" v-if="note.isPinned"></span> @{{ note.title }}</h2>
                                    <p>Test paragraph</p>
                                    <span v-for="tag in note.tags">
                                        <span class="badge badge-light">@{{ tag }}</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


                <div class="col-9 right">
                    <div class="row status-bar">
                        <div class="col-4">
                            <button type="button" class="btn btn-primary" v-on:click="createNewNote()">
                                <span class="oi" data-glyph="plus"></span>
                            </button>
                            <button type="button" class="btn" v-on:click="toggleSelectedNotePin()"
                                v-bind:class="{ 'btn-success': selectedNote.isPinned, 'btn-light': !selectedNote.isPinned }">
                                <span class="oi" data-glyph="bolt"></span>
                            </button>
                            <button type="button" class="btn btn-light" id="info-button" v-if="!isEmpty">
                                <span class="oi" data-glyph="info"></span>
                            </button>
                            <div class="info-window">
                                Created (insert date here)
                            </div>
                            <button type="button" class="btn btn-light" v-if="!isEmpty">
                                <span class="oi" data-glyph="timer"></span>
                            </button>
                            <button type="button" class="btn btn-danger" v-on:click="deleteSelectedNote()" v-if="!isEmpty">
                                <span class="oi" data-glyph="trash"></span>
                            </button>
                        </div>
                        <div class="col-4 text-center">
                            <button type='button' class='btn' v-bind:class="{ 'btn-primary': editView, 'btn-light': !editView }"
                                v-on:click="changeToEditMode()">
                                <span class="oi" data-glyph="pencil"></span>
                            </button>
                            <button type="button" class="btn" v-bind:class="{ 'btn-primary': !editView, 'btn-light': editView }"
                                v-on:click="changeToPreviewMode()">
                                <span class="oi" data-glyph="eye"></span>
                            </button>
                        </div>
                        <div class="col-4 text-right">
                            <button type="button" class="btn btn-link">Sign out</button>
                        </div>
                    </div>
                    <div class="row edit-view" v-show="editView">
                        <input type="text" class="form-control title" v-model="selectedNote.title" placeholder="Title">
                        <input type="text" class="form-control tags" placeholder="Tags" v-on:keypress="updateSelectedTag">
                        <div class="content-editor">
                            <textarea class="form-control">@{{ getSelectedNoteBody() }}</textarea>
                        </div>
                    </div>
                    <div class="row preview-view" v-show="!editView">
                        We will preview here
                    </div>
                </div>

            </div>
        </div>

        <script src="js/vue.js"></script>
        <script src="js/app.js"></script>
    </body>
</html>
