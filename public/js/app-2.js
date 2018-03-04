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
        editing: true,
        versioning: false,
        versionNumber: 0
    },

    mutations: {
        SELECT_NOTE: (state, note) => {
            state.selectedNote = note,
            state.selectedNote.body = '';
            state.versionNumber = 0;
            if (note.versions.length > 0) {
                state.selectedNote.createdAt = note.versions[0].createdAt;
            }
        },

        UPDATE_BODY: state =>
            Vue.set(state.selectedNote, 'body', state.selectedNote.versions.length > 0 ?
                state.selectedNote.versions[state.versionNumber].body : ''),

        DESELECT_NOTE: state =>
            state.selectedNote = emptyNote,

        RENDER_SELECTED_NOTE: state =>
            state.selectedNote.html = new showdown.Converter()
                .makeHtml(state.selectedNote.versions[state.versionNumber].body)
                .replace(/\$asciinema\([^\)\(]+\)/g, match => {
                    var filename = match.substring(11).slice(0, -1);
                    var path = ['./attachments', store.getters.getSelection.id, filename].join('/');
                    return `<asciinema-player src="${path}"></asciinema-player>`;
                }),

        REMOVE_ATTACHMENT: (state, index) =>
            Vue.delete(this.selectedNote.attachments, index),
    },

    getters: {
        hasSelection: state => state.selectedNote.id != emptyNote.id,
        getSelection: state => state.selectedNote,
        isEditing: state => state.editing,
        isVersioning: state => state.versioning,
        getVersionNumber: state => state.versionNumber,
        getSelectionVersion: state =>
            (state.selectedNote.id != emptyNote.id && state.selectedNote.versions.length > 0) ?
                state.selectedNote.versions[state.versionNumber] :
                { createdAt: '', body: '' },
    },

    actions: {
        TOGGLE_PIN_SELECTED_NOTE: ({ state, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;

                const value = state.selectedNote.isPinned;

                Vue.http.post(`./api/note/${state.selectedNote.id}/setPin`, {
                    pin: !value
                }).then(response => {
                    state.selectedNote.isPinned = !value;
                    commit('SORT_NOTES');
                    if (typeof resolve === "function") resolve();
                }, reject);
            }),

        TOGGLE_VERSIONING: ({ state }) =>
            state.versioning = !state.versioning,

        DELETE_SELECTED_NOTE: ({ state, dispatch, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;

                const selectedNoteId = state.selectedNote.id;
                Vue.http.get(`./api/note/${selectedNoteId}/delete`)
                    .then(request => {
                        dispatch('SELECT_FIRST_NOTE');
                        commit('REMOVE_NOTE', selectedNoteId);
                        if (typeof resolve === "function") resolve();
                    }, reject);
            }),

        CHANGE_VERSION ({ state, commit }, version) {
            if (version < state.selectedNote.versions.length) {
                state.versionNumber = version;
                commit('UPDATE_BODY');
            }
        },

        RESTORE_VERSION: ({ state, commit }) =>
            new Promise((resolve, reject) => {
                const version = state.versionNumber;

                Vue.http.post(`./api/note/${state.selectedNote.id}/restore`, {
                    version: version
                }).then(response => {
                    state.selectedNote.versions.splice(0, version);
                    state.versionNumber = 0;
                    commit('UPDATE_BODY');
                    if (typeof resolve === "function") resolve();
                }, reject);
            }),

        EDIT_SELECTED_NOTE: ({ state }) =>
            state.editing = true,

        VIEW_SELECTED_NOTE: ({ state, commit, dispatch }) => {
            state.editing = false;
            commit('RENDER_SELECTED_NOTE');
            dispatch('RENDER_MATHJAX');
        }
    }

}


const AutoSave = {
    state: {
        titleDirty: false,
        tagsDirty: false,
        bodyDirty: false,
        body: '',
        delay: 5000,
        saving: false,
        timer: null,
    },

    mutations: {
        MARK_UPTODATE: state => {
            state.titleDirty = false;
            state.tagsDirty = false;
            state.bodyDirty = false;
            state.body = '';
        }
    },

    getters: {
        getModifications (state) {
            let mod = [];
            if (state.titleDirty) mod.push('title');
            if (state.tagsDirty) mod.push('tag');
            if (state.bodyDirty) mod.push('body');
            return mod;
        },

        getModificationsOfSelectedNote (state, getters) {
            let modNote = {};
            if (state.titleDirty) modNote.title = getters.getSelection.title;
            if (state.tagsDirty) modNote.tag = getters.getSelection.tags;
            if (state.bodyDirty) modNote.body = state.body;
            return modNote;
        },

        getLastSaved: (state, getters) =>
            getters.hasSelection && getters.getSelection.versions.length > 0 ?
                getters.getSelection.versions[0].createdAt : '',

        isSaving: state => state.saving,
    },

    actions: {
        SAVE_TITLE: ({ state, dispatch }) => {
            state.titleDirty = true;
            return dispatch('SAVE');
        },
        SAVE_TAGS: ({ state, dispatch }) => {
            state.tagsDirty = true;
            return dispatch('SAVE');
        },
        SAVE_BODY: ({ state, dispatch }, body) => {
            state.bodyDirty = true;
            state.body = body;
            return dispatch('SAVE');
        },

        SAVE: ({ state, dispatch }) => {
            if (state.timer != null) {
                clearTimeout(state.timer);
            }
            return new Promise((resolve, reject) => {
                state.timer = setTimeout(
                    () => dispatch('FLUSH').then(resolve, reject),
                    state.delay);
            });
        },

        FLUSH: ({ state, getters, commit }) => {
            return new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;
                if (!state.titleDirty && !state.tagsDirty && !state.bodyDirty) return;

                let payload = {
                    modified: getters.getModifications,
                    note: getters.getModificationsOfSelectedNote
                };

                state.saving = true;
                Vue.http.post(`./api/note/${getters.getSelection.id}/update`, payload)
                    .then((request) => {
                        if (state.bodyDirty) {
                            const currentDateTokens = new Date().toISOString()
                                    .match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
                            getters.getSelection.versions.splice(0, 0,
                                {
                                    body: request.body.note.body,
                                    createdAt: currentDateTokens[1] + ' ' + currentDateTokens[2]
                                });
                            commit('UPDATE_BODY');
                        }
                        state.saving = false;
                        commit('MARK_UPTODATE');
                        if (typeof resolve === "function") resolve();
                    }, reject);
            });
        },
    },
}





const store = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote,
        autoSave: AutoSave
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


SELECT_NOTE: ({ commit, dispatch }, note) => {
    dispatch('FLUSH');
    commit('SELECT_NOTE', note);
    commit('UPDATE_BODY');
},
        

SELECT_FIRST_NOTE: ({ state, commit, dispatch }) =>
    state.notes.length > 0 ?
        dispatch('SELECT_NOTE', state.notes[0]) :
        commit('DESELECT_NOTE'),


RENDER_MATHJAX: ctx =>
    Vue.nextTick(_ => MathJax.Hub.Queue(["Typeset", MathJax.Hub])),


CREATE_NOTE: ({ state, commit, dispatch }) =>
    new Promise((resolve, reject) => {
        Vue.http.get(`./api/note/create`).then(request => {
            const newNote = {
                id: request.body.id,
                title: "",
                tags: [],
                attachments: [],
                versions: [],
                isPinned: false
            };
            state.notes.push(newNote);
            dispatch('SELECT_NOTE', newNote);
            commit('SORT_NOTES');
        });
    }),




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


REMOVE_NOTE: (state, id) => {
    console.log(id);
    state.notes = state.notes.filter(note => note.id != id);
},



    },
});




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
            selectionVersion: 'getSelectionVersion',
            lastSaved: 'getLastSaved',
            saving: 'isSaving',
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
        },

        updateSelectedTag: function(e) {
            const rawTags = e.target.value.split(',');

            let cleanTags = rawTags
                .slice(0, rawTags.length - 1)
                .map(tag => tag.replace(/^\s+/g, '').replace(/\s+$/g, ''))
                .filter(tag => tag.length > 0);

            cleanTags.push(rawTags[rawTags.length - 1].replace(/^\s+/g, ''));

            Vue.set(store.state.selectedNote.selectedNote, 'tags', cleanTags);
        },
    }

};

new Vue(app);


