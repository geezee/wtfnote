// require ./store/index.js

const app = {
    el: '#app',

    mainStore,

    data: {
        searchQuery: ''
    },

    beforeMount() {
        mainStore.dispatch('LOAD_NOTES')
            .then(() => {
                mainStore.dispatch('SELECT_FIRST_NOTE');
            }, error => {
                console.error('LOAD_NOTES', error);
            });
    },

    methods: {
        setEdditingMode: function(mode) {
            this.data.mode = mode;
        },

        createNewNote: function() {
            this.biggestId++;
            var newNote = {
                id: JSON.parse(JSON.stringify(this.biggestId)),
                title: "",
                tags: [],
                attachments: [],
                versions: []
            };
            this.notes.push(newNote);
            this.selectNote(newNote);
            this.sortNotes();
            this.queryNotes();
            this.$http.get(`./api/note/${this.biggestId}/create`).then(_ => {});
        },

        getNoteBodyPreview: function(note) {
            if (note.versions.length == 0 || note.versions[0].body == null) {
                return "";
            }
            var line = note.versions[0].body.split('\n')[0];
            if (line.length > 100) {
                return line.substring(0, 100)+"...";
            } else return line;
        },

        getNoteTitlePreview: function(note) {
            return note.title.length < 25 ? note.title : note.title.substring(0, 25).replace(/\s*$/, '')+'..';
        },

        getSelectedNoteTags: function() {
            return mainStore.getters.getSelection.tags.join(', ');
        }
    }

};

new Vue(app);
