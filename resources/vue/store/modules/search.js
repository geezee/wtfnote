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
                inBody = [];

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
                    inBody.push({ val: tk, negated: negated });
                }
            });

            return { tag: inTags, title: inTitle, body: inBody };
        });

    return note => {
        for (var i=0; i < ors.length; i++) {
            const cond = ors[i];
            var satisfied = true;
            
            for (var j=0; j < cond.tag.length && satisfied; j++) {
                if (note.tags.map(tag => tag.toLowerCase())
                        .indexOf(cond.tag[j].val) > -1 == cond.tag[j].negated) {
                    satisfied = false;
                }
            }
            for (var j=0; j < cond.title.length && satisfied; j++) {
                if (note.title.toLowerCase()
                        .indexOf(cond.title[j].val) > -1 == cond.title[j].negated) {
                    satisfied = false;
                }
            }
            for (var j=0; j < cond.body.length && satisfied; j++) {
                if (note.versions.length > 0 &&
                    note.versions[0].body.toLowerCase()
                        .indexOf(cond.body[j].val) > -1 == cond.body[j].negated) {
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
    },

    getters: {
        getSearchResult:
            state => state.result,
    },

    mutations: {
        APPLY_QUERY: (state, { searchQuery, notes }) => {
            let isValid = _note_satisfies(searchQuery);
            notes.forEach(note => state.result[note.id] = isValid(note));
        },
    }
}
