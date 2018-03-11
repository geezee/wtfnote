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
