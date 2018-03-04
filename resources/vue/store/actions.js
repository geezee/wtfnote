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
