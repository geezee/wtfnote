LOAD_NOTES: ({ commit, state }) =>
    new Promise((resolve, reject) => {
        Vue.http.get("./api/note/all?__nocache="+Math.random())
            .then(request => {
                state.notes = request.body.map(note => {
                    note.visible = true;  
                    note.versions = note.versions.reverse().reduce(resolveVersion, [], note.versions);
                    note.body = note.versions.length == 0 ? '' : note.versions[0].body;
                    return note;
                });
                commit('SORT_NOTES');
                resolve();
            }, error => {
                reject(error);
            });
    }),


SELECT_NOTE: ({ commit, dispatch, getters }, note) => {
    dispatch('FLUSH_AUTOSAVE_QUEUE');
    commit('SELECT_NOTE', note);
    if (!getters.isEditing) {
        dispatch('VIEW_SELECTED_NOTE');
    }
},
        

SELECT_FIRST_NOTE: ({ state, commit, dispatch }) =>
    state.notes.length > 0 ?
        dispatch('SELECT_NOTE', state.notes[0]) :
        commit('DESELECT_NOTE'),


CREATE_NOTE: ({ state, commit, dispatch }) =>
    new Promise((resolve, reject) => {
        Vue.http.get(`./api/note/create`).then(request => {
            let newNote = makeEmptyNote();
            newNote.id = request.body.id;
            state.notes.push(newNote);
            dispatch('SELECT_NOTE', newNote);
            commit('SORT_NOTES');
        });
    }),

MODAL_INFO: ({ commit, dispatch }, payload) => {
    commit('SET_MODAL_STATE', {
        ...payload,
        type: 0,
    });
    dispatch('SHOW_MODAL');
},

MODAL_WARN: ({ commit, dispatch }, payload) => {
    commit('SET_MODAL_STATE', {
        ...payload,
        type: 1,
    });
    dispatch('SHOW_MODAL');
},

MODAL_ERROR: ({ commit, dispatch }, payload) => {
    commit('SET_MODAL_STATE', {
        ...payload,
        type: 2,
    });
    dispatch('SHOW_MODAL');
},

SEARCH: ({ state, commit }, searchQuery) => {
    commit('APPLY_QUERY', {
        searchQuery: searchQuery,
        notes: state.notes
    });

    state.notes = state.notes.map(note => {
        note.visible = state.search.result[note.id];
        return note;
    });
},
