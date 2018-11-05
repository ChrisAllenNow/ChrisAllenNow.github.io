function util() { }

util.assert = function (b) {
    if (!b) console.log("test failed " + b);
};

util.log = function (o) {
    console.log(o);
};

util.log2 = function (o, o2) {
    console.log("showing 2 objects:");
    console.log(o);
    console.log(o2);
};

util.parameterGet = function (n) {
    var params = (new URL(location)).searchParams;
    return params.get(n);
};

util.scriptTest = function (dependencies) {
    var testOK = true;
    for (var i = 0;i<dependencies.length; i++) {
        if (!dependencies[i]) testOK= false;
}
    console.log("tested: " + testOK + " " + document.scripts[document.scripts.length - 1].src);
};

util.xml = function () {
};

util.xml.parser = new DOMParser();

util.xml.filter = function (doc, path) {
    var nodes = document.evaluate(path, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    return nodes;
};

util.xml.fromHtml = function (element,title) {
    //Not using this its deprecated https://developer.mozilla.org/en-US/docs/Web/API/XSLTProcessor
    //var xml = document.implementation.createDocument("", "", null);
    var xmlString = '<?xml version="1.0" encoding="ISO-8859-1"?><opml version="1.0"><head><title>'+title+'</title></head><body></body></opml>';
    var parser = new DOMParser();
    var xml = parser.parseFromString(xmlString, "text/xml");
    var x = util.xml.fromHtmlEach(xml, element);
    var elements = xml.getElementsByTagName("body");
    elements[0].appendChild(x);
    return xml;
};

util.xml.fromHtmlEach = function (xml,nodeLi) {
    var nodeDest = xml.createElement("o");
    nodeDest.setAttribute("id", nodeLi.getAttribute("id"));
    var nodeChild;
    var children = nodeLi.children;
    for (var i = 0; i < children.length; i++) {
        nodeChild = children[i];
        if (nodeChild.tagName == "A") {
            var v;
            for (var i3 = 0; i3 < util.xml.map.length; i3++) {
                if (util.xml.map[i3][1] == "*value")
                    v = nodeChild.firstChild.nodeValue;
                else
                    v = nodeChild.getAttribute(util.xml.map[i3][1]);
                if (v && (v!="#")) nodeDest.setAttribute(util.xml.map[i3][0], v);
            };
        };
        if (nodeChild.tagName == "UL") {
            for (var i2 = 0; i2 < nodeChild.children.length; i2++) {
                if (nodeChild.children[i2].tagName == "LI") {
                    nodeDest.appendChild(util.xml.fromHtmlEach(xml, nodeChild.children[i2]));
                };
            };
        };
    };
    return nodeDest;
};

util.xml.fromString = function (s) {
    var doc = {};
    doc = util.xml.parser.parseFromString(s, "text/xml");
    return doc;
};

util.xml.map= [
    ["t","*value"],
    ["a","href"],
    ["m","m"],
    ["b","title"]
];

util.xml.toString = function (xml) {
    return new XMLSerializer().serializeToString(xml);
};

util.test = function () {
    util.scriptTest([util.xml.parser, document.evaluate]);
};

util.test();