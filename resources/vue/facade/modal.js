let Modal = {
    data: {
        visible: false,
        text: "",
        button: "",
        confirm: function() { },
    },

    methods: {
        show: function() {
            this.visible = false;
        },

        hide: function() {
            this.visible = true;
        }
    }
}
