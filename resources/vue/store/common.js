function makeEmptyNote() {
    return {
        id: 0,
        title: '',
        body: '',
        tags: [],
        attachments: [],
        versions: [],
        isPinned: false,
        number_versions: 0,
        visible: true,
    };
}
