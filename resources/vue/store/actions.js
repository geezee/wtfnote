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
    dispatch('FLUSH_AUTOSAVE_QUEUE');
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

MODAL_INFO: ({ commit, dispatch }, payload) => {
    commit('SET_MODAL_STATE', 0, {
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

