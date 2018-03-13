// require ../../note-format/note-format.out.js
//
// require ./modules/selected-note.js
// require ./modules/auto-save.js
// require ./modules/modal.js
// require ./modules/search.js
// require ./modules/attachments.js

const store = new Vuex.Store({
    modules: {
        selectedNote: SelectedNote,
        autoSave: AutoSave,
        modal: Modal,
        search: Search,
        attachments: Attachments
    },

    plugins: [ createLogger() ],

    state: {
        notes: [],
    },
    getters: {
    },

    actions: {
        // include_b ./actions.js
    },
    mutations: {
        // include_b ./mutations.js
    },
});
