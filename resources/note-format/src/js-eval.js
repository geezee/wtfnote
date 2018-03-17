function (body, note) {
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
