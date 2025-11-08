function loadHypothesis() {
    __PS_MV_REG = [];
    return document.body.appendChild(dynLoad('https://hypothes.is/embed.js', 'hypothesis'));
};

function hypothesisAnnotatorLink() {
    return document.querySelector('link[type=\"application/annotator+html\"]');
};

function unloadHypothesis(annotatorLink) {
    if (annotatorLink) {
        var destroyEvent = new Event('destroy');
        __PS_MV_REG = [];
        return annotatorLink.dispatchEvent(destroyEvent);
    };
};

function toggleHypothesis() {
    print('loading hypothesis');
    var annotatorLink = hypothesisAnnotatorLink();
    print('trying to print annotator link');
    print(annotatorLink);
    __PS_MV_REG = [];
    return annotatorLink ? unloadHypothesis(annotatorLink) : loadHypothesis();
};

// (function () {
//     var hypothesisDoc = document.getElementById('hypothesis-checkbox');
//     __PS_MV_REG = [];
//     return hypothesisDoc.checked ? loadHypothesis() : null;
// })();
