var app = new Vue({
    el: "#app",
    data: {
        notes: [],
        selectedNote: null,
        selectedNoteTag: "",
        emptyNote: { title: "", tags: [], id: 0, versions: [] },
        editView: true,

        autoSave: {
            saving: false,
            timer: null,
            timeLastSaved: "2 minutes ago"
        }
    },
    computed: {
        isEmpty: function() {
            return this.selectedNote === null || this.selectedNote.id == this.emptyNote.id;
        }
    },
    methods: {
        // TODO remove stub and call actual API
        loadNotes: function() {
            this.notes = [
                {
                    id: 1,
                    title: "King Crimson",
                    isPinned: true,
                    tags: ["music"],
                    versions: [
                        {
                            "body": "Message 1",
                            "createdAt": "2018-01-25 19:00:00"
                        },
                        {
                            "body": "Message",
                            "createdAt": "2018-01-25 18:58:00"
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Leprous",
                    isPinned: false,
                    tags: ["prog-metal", "music"],
                    versions: [{ "body": "Malina is a nice album\nSo is Coal\nI like Leprous!", "createdAt": "2018-01-28 19:00:00" }]
                },
                {
                    id: 3,
                    title: "Recipes",
                    isPinned: false,
                    tags: ["food"],
                    versions: [{ "body": "to be filled later", "createdAt": "2018-01-30 19:00:00" }]
                }
            ];
        },
        
        selectNote: function(note) {
            this.selectedNote = note;
            this.selectedNoteTag = note.tags.join(', ');
        },

        getSelectedNoteBody: function() {
            if (this.selectedNote === null || this.selectedNote.versions.length == 0) {
                return "";
            } else {
                return this.selectedNote.versions[0].body;
            }
        },

        createNewNote: function() {
            var newNote = {
                id: this.notes.map(function(note) { return note.id; })
                        .reduce(function(a, b) { return Math.max(a, b) })+1,
                title: "",
                tags: [],
                versions: []
            };
            this.notes.push(newNote);
            this.selectNote(newNote);
            this.sortNotes();
        },

        deleteSelectedNote: function() {
            var self = this;
            this.notes = this.notes.filter(function(note) {
                return note.id !== self.selectedNote.id;
            });
            if (this.notes.length == 0) {
                this.selectedNote = this.emptyNote;
            } else {
                this.selectedNote = this.notes[0];
            }
        },

        changeToEditMode: function() {
            this.editView = true;
        },

        changeToPreviewMode: function() {
            this.editView = false;
        },

        toggleSelectedNotePin: function() {
            this.selectedNote.isPinned = !this.selectedNote.isPinned;
            this.sortNotes();
        },

        updateSelectedTag: function(event) {
            this.selectedNote.tags = event.target.value.split(",");
        },

        getNoteBodyPreview: function(note) {
            if (note.versions.length == 0 || note.versions[0].body == null) {
                return "";
            }
            var line = note.versions[0].body.split('\n')[0];
            if (line.length > 30) {
                return line.substring(0, 30)+"...";
            } else return line;
        },

        autoSaveTemplate: function(preCall, postCall) {
            var self = this;
            clearTimeout(this.autoSave.timer);
            this.autoSave.timer = setTimeout(function() {
                if (typeof preCall === "function") {
                    preCall();
                }
                self.autoSave.saving = true;
                // Actual AJAX call here
                setTimeout(function() {
                    self.autoSave.saving = false;
                    self.autoSave.timeLastSaved = "Just now";
                    if (typeof postCall === "function") {
                        postCall();
                    }
                }, 500);
            }, 3000);
        },

        autoSaveBody: function(event) {
            var self = this;
            this.autoSaveTemplate(function() {
                self.selectedNote.versions.splice(0, 0, {
                    body: event.target.value,
                    createdAt: "TODO date here"
                });
            });
        },

        autoSaveTitle: function(event) {
            this.autoSaveTemplate();
        },

        autoSaveTags: function(event) {
            this.autoSaveTemplate();
        },

        sortNotes: function() {
            this.notes.sort(function(a, b) {
                // Prioritize the pinned note
                if (a.isPinned && !b.isPinned)
                    return -1;
                else if (!a.isPinned && b.isPinned)
                    return 1;
                // compare by title or id if you can't compare by creation date
                else if (a.versions.length == 0 && b.versions.length == 0) {
                    if (a.title == b.title) return b.id - a.id;
                    else return a.title.localeCompare(b.title);
                }
                // prioritize the one without a content
                else if (a.versions.length == 0)
                    return -1;
                else if (b.versions.length == 0)
                    return 1;
                // finally compare by date
                else return (new Date(b.versions[0].createdAt)).valueOf() -
                            (new Date(a.versions[0].createdAt)).valueOf();
            });
        }
    },
    beforeMount: function() {
        this.loadNotes();
        if (this.notes.length > 0) {
            this.sortNotes();
            this.selectNote(this.notes[0]);
        } else {
            this.selectNote(this.emptyNote);
        }
    }
});
