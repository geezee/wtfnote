function (body) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = body;

    Array.from(sandbox.querySelectorAll('iframe')).forEach(iframe => {
        iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
    });

    return Promise.resolve(sandbox.innerHTML);
}
