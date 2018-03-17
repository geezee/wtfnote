function getConfig(key, def) {
    if (typeof window.noteFormatConfig === 'undefined') {
        window.noteFormatConfig = {};
        return def;
    }
    const val = window.noteFormatConfig[key];
    return val === undefined ? def : val;
}

function setConfig(key, val) {
    if (typeof window.noteFormatConfig === 'undefined') {
        window.noteFormatConfig = {};
    }
    window.noteFormatConfig[key] = val;
}

function loadScript(name, src) {
    console.log('NoteFormat requesting', name, src);

    const isLoaded = getConfig(name+'.loaded', false);

    return new Promise((resolve, reject) => {
        if (isLoaded) {
            console.log('NoteFormat script already loaded', name);
            if (typeof resolve === 'function') {
                resolve();
                return;
            }
        }

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;

        script.onload = _ => {
            console.log('NoteFormat loaded', name);
            window.SHOWDOWN_LOADED = true;
            setConfig(name+'.loaded', true);
            if (typeof resolve === 'function') {
                resolve();
            }
        }

        document.body.appendChild(script);
    });
}



const formatters=[function (body) {
    return loadScript('showdown', 'js/showdown.min.js')
    .then(() => {
        return new showdown.Converter().makeHtml(body);
    });
}
,function (body, note) {
    return loadScript('asciinema', 'js/asciinema-player.js')
    .then(() => {
        return body.replace(/\$asciinema\([^\)\(]+\)/g, match => {
           var filename = match.substring(11).slice(0, -1);
           var path = ['./attachments', note.id, filename].join('/');
           return `<asciinema-player src="${path}"></asciinema-player>`;
       })
    });
}
,function (body) {
    return loadScript('mathjax',
        'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?' +
        'config=TeX-MML-AM_CHTML')
    .then(() => {
        Vue.nextTick(_ => MathJax.Hub.Queue(["Typeset", MathJax.Hub]));
        return body;
    });
}
,function (body) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = body;

    Array.from(sandbox.querySelectorAll('iframe')).forEach(iframe => {
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
    });

    return Promise.resolve(sandbox.innerHTML);
}
,function (body, note) {
    const sandbox = document.createElement('div');
    sandbox.innerHTML = body;

    Array.from(sandbox.querySelectorAll('code.js')).forEach(elm => {
        const escaper = document.createElement('textarea');
        escaper.innerHTML = elm.innerHTML;

        if (escaper.value.split('\n')[0].trim() !== '!eval') {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.className = 'javascript';
        iframe.srcdoc = '<script>' + escaper.value + '</script>';

        elm.parentNode.replaceChild(iframe, elm);
    });

    return Promise.resolve(sandbox.innerHTML);
}
,]