// require ./modules/selected-note.js
// require ./modules/auto-save.js
// require ./modules/modal.js

const store = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote,
        autoSave: AutoSave,
        modal: Modal,
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
