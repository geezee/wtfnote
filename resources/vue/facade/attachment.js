let Attachment = {
    name: 'attachments',

    data: {
        visible: false,
    },

    methods: {
        show: function() {
            this.attachments.visible = true;
        },

        hide: function() {
            this.attachments.visible = false
        },

        purge: function(index) {
            this.$http.post('/api/attachment/delete', {
                uri: this.selectedNote.attachments[index],
            }).then(request => this.selectedNote.purgeAttachment(index));
        }
    }
}
