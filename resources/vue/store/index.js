// require ./modules/selected-note.js
// require ./modules/auto-save.js

const store = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote,
        autoSave: AutoSave
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
