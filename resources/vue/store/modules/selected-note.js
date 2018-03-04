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
