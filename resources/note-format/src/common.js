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


