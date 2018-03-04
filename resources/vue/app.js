// require ./store/index.js

const app = {
    el: '#app',

    store,

    data: {
        searchQuery: ''
    },

    computed: {
        ...Vuex.mapGetters({
            versionNumber: 'getVersionNumber',
            selection: 'getSelection',
            hasSelection: 'hasSelection',
            isVersioning: 'isVersioning',
            isEditing: 'isEditing',
            selectionVersion: 'getSelectionVersion'
        })
    },

    beforeMount() {
        store.dispatch('LOAD_NOTES')
            .then(() => {
                store.dispatch('SELECT_FIRST_NOTE');
            }, error => {
                console.error('LOAD_NOTES', error);
            });
    },

    methods: {
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
            return store.getters.getSelection.tags.join(', ');
        }
    }

};

new Vue(app);
