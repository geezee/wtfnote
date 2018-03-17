function (body) {
    return loadScript('mathjax',
        'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?' +
        'config=TeX-MML-AM_CHTML')
    .then(() => {
        Vue.nextTick(_ => MathJax.Hub.Queue(["Typeset", MathJax.Hub]));
        return body;
    });
}
