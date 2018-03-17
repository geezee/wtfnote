function (body) {
    return loadScript('showdown', 'js/showdown.min.js')
    .then(() => {
        return new showdown.Converter().makeHtml(body);
    });
}
