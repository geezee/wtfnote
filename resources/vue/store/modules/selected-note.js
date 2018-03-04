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
                    var path = ['./attachments', store.state.selectedNote.id, filename].join('/');
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
                if (!getters.hasSelection) reject();

                const value = state.selectedNote.isPinned;

                Vue.http.post(`./api/note/${state.selectedNote.id}/setPin`, {
                    pin: !value
                }).then(response => {
                    state.selectedNote.isPinned = !value;
                    commit('SORT_NOTES');
                    resolve();
                }, reject);
            }),

        TOGGLE_VERSIONING: ({ state }) =>
            state.versioning = !state.versioning,

        DELETE_SELECTED_NOTE: ({ state, dispatch, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return reject();

                const selectedNoteId = state.selectedNote.id;
                Vue.http.get(`./api/note/${selectedNoteId}/delete`)
                    .then(request => {
                        dispatch('SELECT_FIRST_NOTE');
                        commit('REMOVE_NOTE', selectedNoteId);
                        resolve();
                    }, error => {
                        reject(error);
                    });
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
