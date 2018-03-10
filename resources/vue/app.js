// require ./store/index.js

const app = {
    el: '#app',

    store,

    data: {
        searchQuery: ''
    },

    computed: {
        ...Vuex.mapGetters({
            versionNumber: 'getVersionNumber',
            selection: 'getSelection',
            hasSelection: 'hasSelection',
            isVersioning: 'isVersioning',
            isEditing: 'isEditing',
            selectionVersion: 'getSelectionVersion',
            lastSaved: 'getLastSaved',
            saving: 'isSaving',
            modal: 'getModal',
        }),

        getDeleteWarning: function() {
            return {
                body: `Are you sure you want to delete <strong>${this.selection.title}</strong>?`,
                callback: _ => store.dispatch('DELETE_SELECTED_NOTE')
            };
        },

        getRestoreWarning: function() {
            return {
                body: `Are you sure you want to restore <strong>${this.selection.title}</strong> ` +
                      `to the version of ${this.selectionVersion.createdAt}?`,
                callback: _ => store.dispatch('RESTORE_VERSION')
            };
        },
    },

    beforeMount() {
        store.dispatch('LOAD_NOTES')
            .then(() => {
                store.dispatch('SELECT_FIRST_NOTE');
            }, error => {
                console.error('LOAD_NOTES', error);
            });
    },

    methods: {
        getNoteBodyPreview: function(note) {
            if (note.versions.length == 0 || note.versions[0].body == null) {
                return "";
            }
            var line = note.versions[0].body.split('\n')[0];
            if (line.length > 100) {
                return line.substring(0, 100)+"...";
            } else return line;
        },

        getNoteTitlePreview: function(note) {
            return note.title.length < 25 ?
                note.title :
                note.title.substring(0, 25).replace(/\s*$/, '')+'..';
        },

        getSelectedNoteTags: function() {
            return store.getters.getSelection.tags.join(', ');
        },

        updateSelectedTag: function(e) {
            const rawTags = e.target.value.split(',');

            let cleanTags = rawTags
                .slice(0, rawTags.length - 1)
                .map(tag => tag.replace(/^\s+/g, '').replace(/\s+$/g, ''))
                .filter(tag => tag.length > 0);

            cleanTags.push(rawTags[rawTags.length - 1].replace(/^\s+/g, ''));

            Vue.set(store.state.selectedNote.selectedNote, 'tags', cleanTags);
        },
        
    }

};

new Vue(app);
