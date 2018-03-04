// require ./modules/selected-note.js

const mainStore = new Vuex.Store({
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
