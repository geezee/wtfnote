function getConfig(key, def) {
    if (typeof window.noteFormatConfig === 'undefined') {
        window.noteFormatConfig = {};
        return def;
    }
    const val = window.noteFormatConfig[key];
    return val === undefined ? def : val;
}

function setConfig(key, val) {
    if (typeof window.noteFormatConfig === 'undefined') {
        window.noteFormatConfig = {};
    }
    window.noteFormatConfig[key] = val;
}

function loadScript(name, src) {
    console.log('NoteFormat requesting', name, src);

    const isLoaded = getConfig(name+'.loaded', false);

    return new Promise((resolve, reject) => {
        if (isLoaded) {
            console.log('NoteFormat script already loaded', name);
            if (typeof resolve === 'function') {
                resolve();
                return;
            }
        }

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;

        script.onload = _ => {
            console.log('NoteFormat loaded', name);
            window.SHOWDOWN_LOADED = true;
            setConfig(name+'.loaded', true);
            if (typeof resolve === 'function') {
                resolve();
            }
        }

        document.body.appendChild(script);
    });
}



const formatters=[function (body) {
    return loadScript('showdown', 'js/showdown.min.js')
    .then(() => {
        return new showdown.Converter().makeHtml(body);
    });
}
,function (body, note) {
    return loadScript('asciinema', 'js/asciinema-player.js')
    .then(() => {
        return body.replace(/\$asciinema\([^\)\(]+\)/g, match => {
           var filename = match.substring(11).slice(0, -1);
           var path = ['./attachments', note.id, filename].join('/');
           return `<asciinema-player src="${path}"></asciinema-player>`;
       })
    });
}
,function (body) {
    return loadScript('mathjax',
        'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?' +
        'config=TeX-MML-AM_CHTML')
    .then(() => {
        Vue.nextTick(_ => MathJax.Hub.Queue(["Typeset", MathJax.Hub]));
        return body;
    });
}
,function (body) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = body;

    Array.from(sandbox.querySelectorAll('iframe')).forEach(iframe => {
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
    });

    return Promise.resolve(sandbox.innerHTML);
}
,function (body, note) {
    const sandbox = document.createElement('div');
    sandbox.innerHTML = body;

    Array.from(sandbox.querySelectorAll('code.js')).forEach(elm => {
        const escaper = document.createElement('textarea');
        escaper.innerHTML = elm.innerHTML;

        if (escaper.value.split('\n')[0].trim() !== '!eval') {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.className = 'javascript';
        iframe.srcdoc = '<script>'
            + escaper.value.substring(6)
            + '</script>';

        elm.parentNode.replaceChild(iframe, elm);
    });

    return Promise.resolve(sandbox.innerHTML);
}
,]

function makeEmptyNote() {
    return {
        id: 0,
        title: '',
        body: '',
        tags: [],
        attachments: [],
        versions: [],
        isPinned: false,
        visible: true,
    };
}


const SelectedNote = {
    
    state: {
        selectedNote: makeEmptyNote(),
        editing: true,
        versioning: false,
        versionNumber: 0,
        emptyNoteTemplate: makeEmptyNote(),
    },

    mutations: {
        SELECT_NOTE: (state, note) => {
            state.selectedNote = note,
            state.versionNumber = 0;
            state.selectedNote.hasAttachment = note.attachments.length > 0;
            if (note.versions.length > 0) {
                state.selectedNote.createdAt = note.versions[0].createdAt;
            }
        },

        UPDATE_BODY: state =>
            state.selectedNote.body =
                state.selectedNote.versions.length > state.versionNumber ?
                    state.selectedNote.versions[state.versionNumber].body : '',

        DESELECT_NOTE: state =>
            state.selectedNote = makeEmptyNote(),

        RENDER_SELECTED_NOTE: state => {
            // chain all the formatters so one feeds its body to the other
            formatters.reduce((promise, formatter) =>
                promise.then(body => formatter(body, state.selectedNote)),
              Promise.resolve(state.selectedNote.body))
            // then set the html property
            .then(html => {
                Vue.set(state.selectedNote, 'html', html);
            });
        },

        REMOVE_ATTACHMENT: (state, index) =>
            Vue.delete(this.selectedNote.attachments, index),
    },

    getters: {
        hasSelection: state => state.selectedNote.id != state.emptyNoteTemplate.id,
        getSelection: state => state.selectedNote,
        isEditing: state => state.editing,
        isVersioning: state => state.versioning,
        getVersionNumber: state => state.versionNumber,
        hasAttachment: state => state.selectedNote.attachments.length > 0,
        getSelectionVersion: state =>
            (state.selectedNote.id != state.emptyNoteTemplate.id
            && state.selectedNote.versions.length > 0) ?
                state.selectedNote.versions[state.versionNumber] :
                { createdAt: '', body: '' },
    },

    actions: {
        TOGGLE_PIN_SELECTED_NOTE: ({ state, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;

                const value = state.selectedNote.isPinned;

                Vue.http.post(`./api/note/${state.selectedNote.id}/setPin`, {
                    pin: !value
                }).then(response => {
                    state.selectedNote.isPinned = !value;
                    commit('SORT_NOTES');
                    if (typeof resolve === "function") resolve();
                }, reject);
            }),

        TOGGLE_VERSIONING: ({ state, dispatch }) => {
            state.versioning = !state.versioning;
            if (state.versioning) {
                dispatch('EDIT_SELECTED_NOTE');
            }
        },

        DELETE_SELECTED_NOTE: ({ state, dispatch, commit, getters }) =>
            new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;

                const selectedNoteId = state.selectedNote.id;
                Vue.http.get(`./api/note/${selectedNoteId}/delete`)
                    .then(request => {
                        commit('REMOVE_NOTE', selectedNoteId);
                        dispatch('SELECT_FIRST_NOTE');
                        if (typeof resolve === "function") resolve();
                    }, reject);
            }),

        CHANGE_VERSION ({ state, commit }, version) {
            if (version < state.selectedNote.versions.length) {
                state.versionNumber = version;
                commit('UPDATE_BODY');
            }
        },

        RESTORE_VERSION: ({ state, commit }) =>
            new Promise((resolve, reject) => {
                const version = state.versionNumber;

                Vue.http.post(`./api/note/${state.selectedNote.id}/restore`, {
                    version: version
                }).then(response => {
                    state.selectedNote.versions.splice(0, version);
                    state.versionNumber = 0;
                    commit('UPDATE_BODY');
                    if (typeof resolve === "function") resolve();
                }, reject);
            }),

        EDIT_SELECTED_NOTE: ({ state }) =>
            state.editing = true,

        VIEW_SELECTED_NOTE: ({ state, commit, dispatch }) => {
            state.editing = false;
            state.versioning = false;
            commit('RENDER_SELECTED_NOTE');
        }
    }

}


const AutoSave = {
    state: {
        titleDirty: false,
        tagsDirty: false,
        bodyDirty: false,
        body: '',
        delay: 5000,
        saving: false,
        timer: null,
    },

    mutations: {
        MARK_UPTODATE: state => {
            state.titleDirty = false;
            state.tagsDirty = false;
            state.bodyDirty = false;
            state.body = '';
        }
    },

    getters: {
        getModifications (state) {
            let mod = [];
            if (state.titleDirty) mod.push('title');
            if (state.tagsDirty) mod.push('tag');
            if (state.bodyDirty) mod.push('body');
            return mod;
        },

        getModificationsOfSelectedNote (state, getters) {
            let modNote = {};
            if (state.titleDirty) modNote.title = getters.getSelection.title;
            if (state.tagsDirty) modNote.tag = getters.getSelection.tags;
            if (state.bodyDirty) modNote.body = state.body;
            return modNote;
        },

        getLastSaved: (state, getters) =>
            getters.hasSelection && getters.getSelection.versions.length > 0 ?
                getters.getSelection.versions[0].createdAt : '',

        isSaving: state => state.saving,
    },

    actions: {
        SAVE_TITLE: ({ state, dispatch }) => {
            state.titleDirty = true;
            return dispatch('SAVE');
        },
        SAVE_TAGS: ({ state, dispatch }) => {
            state.tagsDirty = true;
            return dispatch('SAVE');
        },
        SAVE_BODY: ({ state, dispatch }, body) => {
            state.bodyDirty = true;
            state.body = body;
            return dispatch('SAVE');
        },

        SAVE: ({ state, dispatch }) => {
            if (state.timer != null) {
                clearTimeout(state.timer);
            }
            return new Promise((resolve, reject) => {
                state.timer = setTimeout(
                    () => dispatch('FLUSH_AUTOSAVE_QUEUE').then(resolve, reject),
                    state.delay);
            });
        },

        FLUSH_AUTOSAVE_QUEUE: ({ state, getters, commit }) => {
            return new Promise((resolve, reject) => {
                if (!getters.hasSelection) return;
                if (!state.titleDirty && !state.tagsDirty && !state.bodyDirty) return;

                if (!state.timer != null) {
                    clearTimeout(state.timer);
                }

                let payload = {
                    modified: getters.getModifications,
                    note: getters.getModificationsOfSelectedNote
                };

                state.saving = true;
                const note_id = getters.getSelection.id;

                Vue.http.post(`./api/note/${note_id}/update`, payload)
                    .then((request) => {
                        if (state.bodyDirty) {
                            commit('ADD_VERSION_NOTE', {
                                noteId: note_id,
                                version: {
                                    body: request.body.note.body,
                                    createdAt: request.body.timestamp
                                }
                            });
                        }
                        state.saving = false;
                        commit('MARK_UPTODATE');
                        if (typeof resolve === "function") resolve();
                    }, reject);
            });
        },
    },
}


const Modal = {
    state: {
        visible: false,
        body: '',
        callback: _ => _,
        type: 0 // 0 for info, 1 for warning, 2 for error
    },

    getters: {
        getModal: state => state,
    },

    mutations: {
        SET_MODAL_STATE: (state, { type, body, callback }) => {
            state.body = body;
            state.type = type;
            state.callback = typeof callback == "function" ? callback : _ => _;
        }
    },

    actions: {
        SHOW_MODAL: ({ state }) =>
            state.visible = true,

        CLOSE_MODAL: ({ state }) =>
            state.visible = false,

        CONFIRM_MODAL: ({ state }) => {
            state.visible = false;
            state.callback();
        }
    }
}


const TAG_PREFIX = 'tag:';
const TITLE_PREFIX = 'title:';
const NEGATED_CHAR = '~'; // implementation assumes single character

function _note_satisfies(searchQuery) {
    if (searchQuery.length == 0) {
        return note => true;
    }

    const ors = searchQuery.split(';')
        .filter(expr => expr.trim().length > 0)
        .map(expr => {
            const tokens = expr.trim().split(/\s+/);

            let inTags = [],
                inTitle = [],
                other = [];

            tokens.forEach(tk => {
                const negated = tk.charAt(0) == NEGATED_CHAR;
                if (negated) tk = tk.substring(1);
                tk = tk.toLowerCase();

                if (tk.startsWith(TAG_PREFIX)) {
                    const val = tk.substring(TAG_PREFIX.length);
                    val.length > 0 && inTags.push({
                        val: val,
                        negated: negated
                    });
                } else if (tk.startsWith(TITLE_PREFIX)) {
                    const val = tk.substring(TITLE_PREFIX.length);
                    val.length > 0 && inTitle.push({
                        val: tk.substring(TITLE_PREFIX.length).toLowerCase(),
                        negated: negated
                    });
                } else {
                    other.push({ val: tk, negated: negated });
                }
            });

            return { tag: inTags, title: inTitle, other: other };
        });

    _noteHasntTag = (note, { val, negated }) =>
        note.tags.map(tag => tag.toLowerCase()).indexOf(val) > -1 == negated;

    _noteHasntTitle = (note, { val, negated }) =>
        note.title.toLowerCase().indexOf(val) > -1 == negated;

    _noteHasntBody = (note, { val, negated }) =>
        note.versions.length > 0 &&
        note.versions[0].body.toLowerCase().indexOf(val) > -1 == negated;

    return note => {
        for (var i=0; i < ors.length; i++) {
            const cond = ors[i];
            var satisfied = true;
            
            for (var j=0; j < cond.tag.length && satisfied; j++) {
                if (_noteHasntTag(note, cond.tag[j])) {
                    satisfied = false;
                }
            }
            for (var j=0; j < cond.title.length && satisfied; j++) {
                if (_noteHasntTitle(note, cond.title[j])) {
                    satisfied = false;
                }
            }
            for (var j=0; j < cond.other.length && satisfied; j++) {
                if (!cond.other[j].negated
                    && _noteHasntBody(note, cond.other[j])
                    && _noteHasntTitle(note, cond.other[j])
                    && _noteHasntTag(note, cond.other[j])) {
                    satisfied = false;
                } else if (cond.other[j].negated
                    && (_noteHasntBody(note, cond.other[j])
                    || _noteHasntTitle(note, cond.other[j])
                    || _noteHasntTag(note, cond.other[j]))) {
                    satisfied = false;
                }
            }

            if (satisfied) return true;
        }

        return false;
    }
}

const Search = {
    state: {
        result: {}, // map from note id to boolean 'note satisfies query'
        query: '',
        tagsVisible: false,
    },

    getters: {
        getSearchResult:
            state => state.result,
    },

    mutations: {
        APPLY_QUERY: (state, { searchQuery, notes }) => {
            let isValid = _note_satisfies(searchQuery);
            state.query = searchQuery;
            notes.forEach(note => state.result[note.id] = isValid(note));
        },

        TOGGLE_TAGS_VISIBILITY: state =>
            state.tagsVisible = !state.tagsVisible,
    }
}


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



//







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
        LOAD_NOTES: ({ commit, state }) =>
    new Promise((resolve, reject) => {
        Vue.http.get("./api/note/all?__nocache="+Math.random())
            .then(request => {
                state.notes = request.body.map(note => {
                    note.visible = true;  
                    note.body = note.versions.length == 0 ? '' : note.versions[0].body;
                    return note;
                });
                commit('SORT_NOTES');
                resolve();
            }, error => {
                reject(error);
            });
    }),


SELECT_NOTE: ({ commit, dispatch, getters }, note) => {
    dispatch('FLUSH_AUTOSAVE_QUEUE');
    commit('SELECT_NOTE', note);
    if (!getters.isEditing) {
        dispatch('VIEW_SELECTED_NOTE');
    }
},
        

SELECT_FIRST_NOTE: ({ state, commit, dispatch }) =>
    state.notes.length > 0 ?
        dispatch('SELECT_NOTE', state.notes[0]) :
        commit('DESELECT_NOTE'),


CREATE_NOTE: ({ state, commit, dispatch }) =>
    new Promise((resolve, reject) => {
        Vue.http.get(`./api/note/create`).then(request => {
            let newNote = makeEmptyNote();
            newNote.id = request.body.id;
            state.notes.push(newNote);
            dispatch('SELECT_NOTE', newNote);
            commit('SORT_NOTES');
        });
    }),

MODAL_INFO: ({ commit, dispatch }, payload) => {
    commit('SET_MODAL_STATE', {
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

SEARCH: ({ state, commit }, searchQuery) => {
    commit('APPLY_QUERY', {
        searchQuery: searchQuery,
        notes: state.notes
    });

    state.notes = state.notes.map(note => {
        note.visible = state.search.result[note.id];
        return note;
    });
},



    },
    mutations: {
        SORT_NOTES: state =>
    state.notes.sort(function(a, b) {
        // Prioritize the pinned note
        if (a.isPinned && !b.isPinned)
            return -1;
        else if (!a.isPinned && b.isPinned)
            return 1;
        // compare by title or id if you can't compare by creation date
        else if (a.versions.length == 0 && b.versions.length == 0) {
            if (a.title == b.title) return b.id - a.id;
            else return a.title.localeCompare(b.title);
        }
        // prioritize the one without a content
        else if (a.versions.length == 0)
            return -1;
        else if (b.versions.length == 0)
            return 1;
        // finally compare by date
        else return (new Date(b.versions[0].createdAt)).valueOf() -
                    (new Date(a.versions[0].createdAt)).valueOf();
    }),


REMOVE_NOTE: (state, id) =>
    state.notes = state.notes.filter(note => note.id != id),


ADD_VERSION_NOTE: (state, { noteId, version }) =>
    state.notes.filter(note => note.id == noteId)[0].versions.splice(0, 0, version),

REMOVE_NOTE_ATTACHMENT: (state, { noteId, index }) => {
    Vue.delete(state.notes.filter(note => note.id == noteId)[0].attachments, index);
    if (state.selectedNote.selectedNote.id == noteId &&
        state.selectedNote.selectedNote.attachments.length == 0) {
        state.selectedNote.selectedNote.hasAttachment = false;
    }
},



    },
});




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


