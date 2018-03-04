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
