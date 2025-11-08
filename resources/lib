function print() {
    var txt = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        txt[_i] = arguments[_i];
    }
    return console.log(txt);
}
/**
 * Run the provided function on a desktop.
 */
function runOnDesktop(fn) {
    if (window.matchMedia("(min-width: 501px)")) {
        return fn();
    }
}
/**
 * Create an html element with attributes and append it to a parent element
 */
function createParent(elementName, attributes, _a) {
    if (attributes === void 0) { attributes = {}; }
    var parent = _a.parent, children = _a.children;
    var elem = document.createElement(elementName);
    for (var key in attributes) {
        var attributeValue = attributes === null || attributes === void 0 ? void 0 : attributes[key];
        // If we can explicitly define it, use the assigning function.
        // Otherwise mutate the element directly.
        if (attributeValue !== undefined) {
            elem.setAttribute(key, attributeValue);
            elem[key] = attributeValue;
        }
    }
    if (parent) {
        parent.appendChild(elem);
    }
    if (children) {
        children.forEach(function (child) {
            if (typeof child === "string") {
                elem.appendChild(document.createTextNode(child));
            }
            else if (child) {
                elem.appendChild(child);
            }
        });
    }
    return elem;
}
function create(elementName, attributes, parent) {
    return createParent(elementName, attributes, { parent: parent });
}
function create2(elementName, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return createParent(elementName, attributes, {
        children: children,
    });
}
var httpRequest;
function req(url, method, then) {
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
    }
    else if (window.ActiveXObject) {
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                // All set
                var response = JSON.parse(httpRequest.responseText);
                then(response);
            }
            else {
                console.log("There was a problem with the last.fm request.");
            }
        }
    };
    httpRequest.open(method, url, true);
    httpRequest.send();
}
var get = function (url, then) { return req(url, "GET", then); };
var $ = function (selector) { return document.querySelector(selector); };
var all = function (selector) {
    return Array.from(document.querySelectorAll(selector));
};
/**
 * Dynamically load a script provided the src and id.
 */
function dynLoad(src, id) {
    var s = document.createElement("script");
    s.setAttribute("src", src);
    s.setAttribute("id", id);
    s.setAttribute("async", "true");
    return s;
}
export { create, create2, dynLoad, get, $, all, print, runOnDesktop };
