const emptyNote = {
    id: 0,
    title: '',
    tags: [],
    attachments: [],
    versions: []
};

const SelectedNote = {
    
    state: {
        selectedNote: emptyNote,
        editing: true
    },

    mutations: {
        SELECT_NOTE: (state, note) => {
            state.selectedNote = note,
            state.selectedNote.version = 0;
            state.selectedNote.body = '';
        },

        UPDATE_BODY: state =>
            state.selectedNote.body = state.selectedNote.versions[state.selectedNote.version].body,

        DESELECT_NOTE: state =>
            state.selectedNote = emptyNote,

        RENDER_SELECTED_NOTE: state =>
            state.selectedNote.html = new showdown.Converter()
                .makeHtml(state.selectedNote.versions[state.selectedNote.version])
                .replace(/\$asciinema\([^\)\(]+\)/g, match => {
                    var filename = match.substring(11).slice(0, -1);
                    var path = ['./attachments', this.selectedNote.id, filename].join('/');
                    return `<asciinema-player src="${path}"></asciinema-player>`;
                }),

        REMOVE_ATTACHMENT: (state, index) =>
            Vue.delete(this.selectedNote.attachments, index),
    },

    getters: {
        hasSelection: state => state.selectedNote.id != id,
        getSelection: state => state.selectedNote,
        getSelectedVersion: state => state.selectedNote.version[state.selectedNote.version],
        isEditing: state => state.editing,
    },

    actions: {
        PIN_SELECTED_NOTE: ({ state }) =>
            new Promise((resolve, reject) => {
                if (!state.getters.hasSelection) reject();

                const value = state.selectedNote.isPinned;

                Vue.http.post(`./api/notes/${state.selectedNote.id}/setPin`, {
                    pin: !value
                }).then(response => {
                    state.selectedNote.isPinned = !value;
                    resolve();
                }, reject);
            }),

        DELETE_SELECTED_NOTE: ({ state, dispatch }) =>
            new Promise((resolve, reject) => {
                if (state.notes.length == 0) return reject();

                Vue.http.get(`./api/note/${state.selectedNote.id}/delete`)
                    .then(request => {
                        dispatch('SELECT_FIRST_NOTE');
                        commit('REMOVE_NOTE', state.selectedNote.id);
                        resolve();
                    }, error => {
                        reject(error);
                    });
            }),

        CHANGE_VERSION ({ state, commit }, version) {
            if (version < state.selectedNote.versions.length) {
                state.selectedNote.version = version;
                commit('UPDATE_BODY');
            }
        },

        RESTORE_VERSION: ({ state, commit }, version) =>
            new Promise((resolve, reject) => {
                Vue.http.post(`./api/note/${state.selectedNote.id}/restore`, {
                    version: version
                }).then(response => {
                    state.selectedNote.versions.splice(0, version);
                    state.selectedNote.version = 0;
                    commit('UPDATE_BODY');
                }, reject);
            }),

        EDIT_SELECTED_NOTE: ({ state }) =>
            state.editing = true,

        VIEW_SELECTED_NOTE: ({ state, dispatch }) => {
            state.editing = false;
            dispatch('RENDER_SELECTED_NOTE');
            dispatch('RENDER_MATHJAX');
        }
    }

}




const mainStore = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote
    },

    plugins: [ createLogger() ],

    state: {
        notes: [],
    },
    getters: {},

    actions: {
        LOAD_NOTES: ({ commit, state }) =>
    new Promise((resolve, reject) => {
        Vue.http.get("./api/note/all?__nocache="+Math.random())
            .then(request => {
                state.notes = request.body;
                commit('SORT_NOTES');
                resolve();
            }, error => {
                reject(error);
            });
    }),


SELECT_NOTE: ({ commit }, note) => {
    commit('SELECT_NOTE', note);
    commit('UPDATE_BODY');
},
        

SELECT_FIRST_NOTE: ({ state, commit, dispatch }) =>
    state.notes.length > 0 ?
        dispatch('SELECT_NOTE', state.notes[0]) :
        commit('DESELECT_NOTE'),

RENDER_MATHJAX: ctx =>
    Vue.nextTick(_ => MathJax.Hub.Queue(["Typeset", MathJax.Hub]))



    },
    mutations: {
        SORT_NOTES: state =>
    state.notes.sort(function(a, b) {
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
    }),


REMOVE_NOTE: (state, id) =>
    state.notes.filter(note => note.id != selectedNoteId),



    },
});




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


