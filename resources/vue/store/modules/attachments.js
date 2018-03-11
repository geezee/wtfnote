const Attachments = {
    state: {
        visible: false
    },

    mutations: {
    },

    actions: {
        SHOW_ATTACHMENTS: ({ state }) =>
            state.visible = true,

        HIDE_ATTACHMENTS: ({ state }) =>
            state.visible = false,

        DELETE_ATTACHMENT: ({ commit }, { note, uri, index }) =>
            new Promise((resolve, reject) => {
                Vue.http.post('/api/attachment/delete', { uri: uri }).then(response => {
                    commit('REMOVE_NOTE_ATTACHMENT', { noteId: note, index: index });
                    if (typeof resolve === "function") 
                        resolve();
                }, reject);
            }),
    }
}
