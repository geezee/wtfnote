const SelectedNote = {
    
    state: {
        selectedNote: makeEmptyNote(),
        editing: true,
        versioning: false,
        versionNumber: 0,
        emptyNoteTemplate: makeEmptyNote(),
    },

    mutations: {
        SELECT_NOTE: (state, note) => {
            state.selectedNote = note,
            state.versionNumber = 0;
            state.selectedNote.hasAttachment = note.attachments.length > 0;
            if (note.versions.length > 0) {
                state.selectedNote.createdAt = note.versions[0].createdAt;
            }
        },

        UPDATE_BODY: state =>
            state.selectedNote.body =
                state.selectedNote.versions.length > state.versionNumber ?
                    state.selectedNote.versions[state.versionNumber].body : '',

        DESELECT_NOTE: state =>
            state.selectedNote = makeEmptyNote(),

        RENDER_SELECTED_NOTE: state => {
            // chain all the formatters so one feeds its body to the other
            formatters.reduce((promise, formatter) =>
                promise.then(body => formatter(body, state.selectedNote)),
              Promise.resolve(state.selectedNote.body))
            // then set the html property
            .then(html => {
                Vue.set(state.selectedNote, 'html', html);
            });
        },

        REMOVE_ATTACHMENT: (state, index) =>
            Vue.delete(this.selectedNote.attachments, index),
    },

    getters: {
        hasSelection: state => state.selectedNote.id != state.emptyNoteTemplate.id,
        getSelection: state => state.selectedNote,
        isEditing: state => state.editing,
        isVersioning: state => state.versioning,
        getVersionNumber: state => state.versionNumber,
        hasAttachment: state => state.selectedNote.attachments.length > 0,
        getSelectionVersion: state =>
            (state.selectedNote.id != state.emptyNoteTemplate.id
            && state.selectedNote.versions.length > 0) ?
                state.selectedNote.versions[state.versionNumber] :
                { createdAt: '', body: '' },

        getSelectedNoteVersion: state => {
            return index => new Promise((resolve, reject) => {
                if (index < state.selectedNote.number_versions) {
                    let noteId = state.selectedNote.id;
                    if (!(index in state.selectedNote.versions)) {
                        Vue.http.get(`./api/note/${noteId}/version/${index}`)
                            .then(request => {
                                state.selectedNote.versions[index] = request.body;
                                resolve();
                            }, reject);
                    } else {
                        resolve(state.selectedNote.versions[index]);
                    }
                } else {
                    reject();
                }
            });
        }
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

        TOGGLE_VERSIONING: ({ state, dispatch }) => {
            state.versioning = !state.versioning;
            if (state.versioning) {
                dispatch('EDIT_SELECTED_NOTE');
            }
        },

        DELETE_SELECTED_NOTE: ({ state, dispatch, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;

                const selectedNoteId = state.selectedNote.id;
                Vue.http.get(`./api/note/${selectedNoteId}/delete`)
                    .then(request => {
                        commit('REMOVE_NOTE', selectedNoteId);
                        dispatch('SELECT_FIRST_NOTE');
                        if (typeof resolve === "function") resolve();
                    }, reject);
            }),

        CHANGE_VERSION: ({ state, getters, commit }, version) => {
            console.log(getters.getSelectedNoteVersion);
            getters.getSelectedNoteVersion(version)
                .then(versionObj => {
                    state.versionNumber = version;
                    commit('UPDATE_BODY');
                });
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
            state.versioning = false;
            commit('RENDER_SELECTED_NOTE');
        }
    }

}
