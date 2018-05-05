const AutoSave = {
    state: {
        titleDirty: false,
        tagsDirty: false,
        bodyDirty: false,

        body: '',
        originalBody: '',

        delay: 1000,
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

            // store the diff if it saves more space
            if (state.bodyDirty) {
                modNote.body = JSON.stringify({
                    diff: false,
                    text: state.body
                });

                if (getters.getSelection.number_versions % 5 > 0) {
                    const diff = Diff.diff(getters.getSelection.versions[0].body, state.body);
                    console.log("diffing result", diff.length*100/state.body.length);
                    if (diff.length < state.body.length) {
                        modNote.body = JSON.stringify({
                            diff: true,
                            text: diff
                        });
                    }
                }
            }

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
                    () => dispatch('FLUSH_AUTOSAVE_QUEUE').then(resolve, reject),
                    state.delay);
            });
        },

        FLUSH_AUTOSAVE_QUEUE: ({ state, getters, commit }) => {
            return new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;
                if (!state.titleDirty && !state.tagsDirty && !state.bodyDirty) return;

                if (!state.timer != null) {
                    clearTimeout(state.timer);
                }

                let payload = {
                    modified: getters.getModifications,
                    note: getters.getModificationsOfSelectedNote
                };

                state.saving = true;
                const note_id = getters.getSelection.id;

                Vue.http.post(`./api/note/${note_id}/update`, payload)
                    .then((request) => {
                        if (state.bodyDirty) {
                            commit('ADD_VERSION_NOTE', {
                                noteId: note_id,
                                version: {
                                    body: request.body.note.body,
                                    createdAt: request.body.timestamp
                                }
                            });
                        }
                        state.saving = false;
                        commit('MARK_UPTODATE');
                        if (typeof resolve === "function") resolve();
                    }, reject);
            });
        },
    },
}
