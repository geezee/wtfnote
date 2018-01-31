/**
TODO:
1. add timer to autosave
2. add new note
3. implement the history control
4. implement the preview tab
*/
var app = new Vue({
    el: "#app",
    data: {
        notes: [],
        selectedNote: null,
        emptyNote: { title: "", tags: [], id: 0, versions: [] },
        editView: true
    },
    computed: {
        selectedNoteTags: function() {
            return this.selectedNote.tags.join(", ");
        },
        isEmpty: function() {
            return this.selectedNote === null || this.selectedNote.id == this.emptyNote.id;
        }
    },
    methods: {
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
                    versions: [{ "body": "Malina is a nice album", "createdAt": "2018-01-28 19:00:00" }]
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
            console.log(newNote);
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
