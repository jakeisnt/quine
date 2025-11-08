let print = function(...txt) {
  return console.log(txt);
}, runOnDesktop = function(fn) {
  if (window.matchMedia("(min-width: 501px)")) {
    return fn();
  }
}, createParent = function(elementName, attributes = {}, {
  parent,
  children
}) {
  const elem = document.createElement(elementName);
  for (let key in attributes) {
    const attributeValue = attributes?.[key];
    if (attributeValue !== undefined) {
      elem.setAttribute(key, attributeValue);
      elem[key] = attributeValue;
    }
  }
  if (parent) {
    parent.appendChild(elem);
  }
  if (children) {
    children.forEach((child) => {
      if (typeof child === "string") {
        elem.appendChild(document.createTextNode(child));
      } else if (child) {
        elem.appendChild(child);
      }
    });
  }
  return elem;
}, create = function(elementName, attributes, parent) {
  return createParent(elementName, attributes, { parent });
}, create2 = function(elementName, attributes, ...children) {
  return createParent(elementName, attributes, {
    children
  });
}, req = function(url, method, then) {
  if (window.XMLHttpRequest) {
    httpRequest = new XMLHttpRequest;
  } else if (window.ActiveXObject) {
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        var response = JSON.parse(httpRequest.responseText);
        then(response);
      } else {
        console.log("There was a problem with the last.fm request.");
      }
    }
  };
  httpRequest.open(method, url, true);
  httpRequest.send();
}, dynLoad = function(src, id) {
  var s = document.createElement("script");
  s.setAttribute("src", src);
  s.setAttribute("id", id);
  s.setAttribute("async", "true");
  return s;
};
var httpRequest;
const get = (url, then) => req(url, "GET", then);
const $ = (selector) => document.querySelector(selector);
const all = (selector) => Array.from(document.querySelectorAll(selector));

export { create, create2, dynLoad, get, $, all, print, runOnDesktop };
