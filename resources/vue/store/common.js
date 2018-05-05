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

function resolveVersion(versions, version) {
    try {
        const body = JSON.parse(version.body);
        version.body = body.diff ?
            Diff.apply(versions[0].body, body.text) : body.text;
    } catch { }
    versions.splice(0, 0, version);
    return versions;
}
