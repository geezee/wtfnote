var app = new Vue({
    el: "#app",
    data: {
        notes: [],
        displayedNotes: [],
        selectedNote: null,
        selectedNoteTag: "",
        emptyNote: { title: "", tags: [], id: 0, versions: [] },
        biggestId: 0,
        editView: true,

        searchQuery: "",

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
            this.biggestId = this.notes.map(n => n.id).reduce((a,b) => Math.max(a,b));
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
            this.biggestId++;
            var newNote = {
                id: JSON.parse(JSON.stringify(this.biggestId)),
                title: "",
                tags: [],
                versions: []
            };
            this.notes.push(newNote);
            this.selectNote(newNote);
            this.sortNotes();
            this.queryNotes();
        },

        deleteSelectedNote: function() {
            var self = this;

            function remove(arr) {
                return arr.filter(note => note.id !== self.selectedNote.id);
            }

            this.notes = remove(this.notes);
            this.displayedNotes = remove(this.displayedNotes);

            if (this.displayedNotes.length == 0) {
                this.selectNote(JSON.parse(JSON.stringify(this.emptyNote)));
            } else {
                this.selectNote(this.displayedNotes[0]);
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
        },

        queryNotes: function() {
            if (this.searchQuery == 0) {
                this.displayedNotes = this.notes;
                return;
            }

            var query = this.searchQuery.toLowerCase();
            var tokens = query.split(' ');

            var requiredTags = [];
            var incompleteTag = "";
            var requiredTitle = [];
            var requiredBody = [];
            var otherTokens = [];

            var bodyExtractor = note => note.versions[0].body

            // the user could be in the process of typing, the last token
            // should not be as strict to that effect
            var lastToken = tokens.slice(-1)[0];
            if (lastToken.startsWith("tag:")) {
                incompleteTag = lastToken.substring(lastToken.indexOf(':')+1);
                tokens.pop();
            } else if (["tag", "title", "body"].some(qc => qc.startsWith(lastToken))) {
                tokens.pop();
            }

            tokens.forEach(token => {
                token = token.toLowerCase();
                if (token.startsWith("tag:")) {
                    requiredTags.push(token.substring(4));
                } else if (token.startsWith("title:")) {
                    requiredTitle.push(token.substring(6));
                } else if (token.startsWith("body:")) {
                    requiredBody.push(token.substring(5));
                } else if (token.length >= 3) {
                    otherTokens.push(token);
                }
            });

            this.displayedNotes = this.notes.filter(note => {
                // I assume the law of the excluded middle in all conditions
                // all explicit tags (in requiredTags) should exist
                if (requiredTags.some(tag => !note.tags.includes(tag))
                 || note.tags.every(tag => !tag.startsWith(incompleteTag)))
                    return false;
                // condition that fails a field for not containing a message
                var cond = field => msg => field(note).toLowerCase().indexOf(msg) > -1;
                var failedCond = field => msg => !cond(field)(msg);
                // all explicit titles should be part of the title
                if (requiredTitle.some(failedCond(note => note.title)))
                    return false;
                // all explicit body parts should be contained in the body
                if (requiredBody.some(failedCond(note => note.versions[0].body)))
                    return false;
                // other tokens are used to search in title, tags, or body
                // and not all are required to exist
                if (otherTokens.length == 0)
                    return true;
                return otherTokens.some(token => 
                            cond(bodyExtractor)(token)
                         || cond(note => note.title)(token)
                         || note.tags.some(tag => tag.startsWith(token)))
            });
        }
    },
    beforeMount: function() {
        this.loadNotes();
        if (this.notes.length > 0) {
            this.sortNotes();
            this.selectNote(this.notes[0]);
            this.displayedNotes = this.notes;
        } else {
            this.selectNote(this.emptyNote);
        }
    }
});
