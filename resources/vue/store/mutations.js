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


ADD_VERSION_NOTE: (state, { noteId, version }) => {
    const note = state.notes.filter(note => note.id == noteId)[0];
    resolveVersion(note.versions, version);
    note.number_versions++;
},

REMOVE_NOTE_ATTACHMENT: (state, { noteId, index }) => {
    Vue.delete(state.notes.filter(note => note.id == noteId)[0].attachments, index);
    if (state.selectedNote.selectedNote.id == noteId &&
        state.selectedNote.selectedNote.attachments.length == 0) {
        state.selectedNote.selectedNote.hasAttachment = false;
    }
},
