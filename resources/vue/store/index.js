// require ./modules/selected-note.js

const store = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote
    },

    plugins: [ createLogger() ],

    state: {
        notes: [],
    },
    getters: {},

    actions: {
        // include_b ./actions.js
    },
    mutations: {
        // include_b ./mutations.js
    },
});
