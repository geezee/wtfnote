let Search = {
    name: 'search',

    data: {
        searchQuery: '',
        result: [],
    },

    methods: {
        query: function() {
            if (this.search.searchQuery.length== 0) {
                this.result = this.notes;
                return;
            }

            var query = this.search.searchQuery.toLowerCase();
            var tokens = query.split(' ');

            var requiredTags = [];
            var incompleteTag = "";
            var requiredTitle = [];
            var requiredBody = [];
            var otherTokens = [];

            var bodyExtractor = note => note.versions[0].body

            // the user could be in the process of typing, the last token
            // should not be as strict to that effect
            var lastToken = tokens.slice(-1)[0];
            if (lastToken.startsWith("tag:")) {
                incompleteTag = lastToken.substring(lastToken.indexOf(':')+1);
                tokens.pop();
            } else if (["tag", "title", "body"].some(qc => qc.startsWith(lastToken))) {
                tokens.pop();
            }

            tokens.forEach(token => {
                token = token.toLowerCase();
                if (token.startsWith("tag:")) {
                    requiredTags.push(token.substring(4));
                } else if (token.startsWith("title:")) {
                    requiredTitle.push(token.substring(6));
                } else if (token.startsWith("body:")) {
                    requiredBody.push(token.substring(5));
                } else if (token.length >= 3) {
                    otherTokens.push(token);
                }
            });

            this.result = this.notes.filter(note => {
                // I assume the law of the excluded middle in all conditions
                // all explicit tags (in requiredTags) should exist
                if (requiredTags.some(tag => !note.tags.includes(tag))
                 || note.tags.every(tag => !tag.startsWith(incompleteTag)))
                    return false;
                // condition that fails a field for not containing a message
                var cond = field => msg => field(note).toLowerCase().indexOf(msg) > -1;
                var failedCond = field => msg => !cond(field)(msg);
                // all explicit titles should be part of the title
                if (requiredTitle.some(failedCond(note => note.title)))
                    return false;
                // all explicit body parts should be contained in the body
                if (requiredBody.some(failedCond(note => note.versions[0].body)))
                    return false;
                // other tokens are used to search in title, tags, or body
                // and not all are required to exist
                if (otherTokens.length == 0)
                    return true;
                return otherTokens.some(token => 
                            cond(bodyExtractor)(token)
                         || cond(note => note.title)(token)
                         || note.tags.some(tag => tag.startsWith(token)))
            });
        },
    }
};
