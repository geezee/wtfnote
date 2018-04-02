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
    console.log("resolving diff");
    const body = JSON.parse(version.body);
    if (body.diff) {
        version.body = Diff.apply(versions[0].body, body.text)
    } else {
        version.body = body.text;
    }
    versions.splice(0, 0, version);
    return versions;
}
