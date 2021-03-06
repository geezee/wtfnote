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

        getSearchUsage: function() {
            return {
                body: document.querySelector('#searchUsage').innerHTML,
                callback: _ => _,
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
            var line = note.body.split('\n')[0];
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
            const rawTags = e.target.value.split(/\s+/);

            let cleanTags = rawTags
                .slice(0, rawTags.length - 1)
                .filter(tag => tag.length > 0);

            cleanTags.push(rawTags[rawTags.length - 1]);

            Vue.set(store.state.selectedNote.selectedNote, 'tags', cleanTags);
        },

        getTags: function() {
            const freq = store.state.notes.reduce((tags, note) => {
                note.tags.forEach(tag => {
                    if (tag in tags) tags[tag] += 1;
                    else tags[tag] = 1;
                });
                return tags;
            }, {});
            
            let sorted = Object.keys(freq).map(key => [key, freq[key]]);
            sorted.sort((a, b) => b[1] - a[1]);
            return sorted;
        }
        
    }

};

new Vue(app);
