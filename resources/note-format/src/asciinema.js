function (body, note) {
    return loadScript('asciinema', 'js/asciinema-player.js')
    .then(() => {
        return body.replace(/\$asciinema\([^\)\(]+\)/g, match => {
           var filename = match.substring(11).slice(0, -1);
           var path = ['./attachments', note.id, filename].join('/');
           return `<asciinema-player src="${path}"></asciinema-player>`;
       })
    });
}
