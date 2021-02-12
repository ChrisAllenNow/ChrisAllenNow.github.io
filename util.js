function util() { }

util.assert = function (b, message) {
    util.status.log(b, 1, message);
};

util.demo = function (f) {
    const gen = f();
    function step(timestamp) {
        var r = gen.next();
        if (!r.done) {
            if (r.value === undefined || r.value === 0)
                requestAnimationFrame(step);
            else
                setTimeout(function () { window.requestAnimationFrame(step); }, r.value);
        }
    }
    requestAnimationFrame(step);
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

util.RGBDecimalToHex = function (rgb) {
    var regex = /rgb *\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3}) *\)/;
    var values = regex.exec(rgb);
    if (values.length != 4) return rgb; // fall back to what was given
    var r = Math.round(parseFloat(values[1]));
    var g = Math.round(parseFloat(values[2]));
    var b = Math.round(parseFloat(values[3]));
    return "#"
        + (r + 0x10000).toString(16).substring(3).toUpperCase()
        + (g + 0x10000).toString(16).substring(3).toUpperCase()
        + (b + 0x10000).toString(16).substring(3).toUpperCase();
};

util.scriptTest = function (dependencies) {
    var testOK = true;
    for (var i = 0;i<dependencies.length; i++) {
        if (!dependencies[i]) testOK= false;
    }
    util.status.log(testOK, dependencies.length, document.scripts[document.scripts.length - 1].src);
};

util.status = function () { };

util.status.log = function (b, count, message) {
    if (!util.status.test[message])
        util.status.test[message] = { times: 1, tests: count };
    else
        util.status.test[message].times++;
    if (!b && view.menuDo) view.menuDo("8");
};
util.status.report = function (element) {
    //    https://stackoverflow.com/questions/8180296/what-information-can-we-access-from-the-client
    util.status.reportOnce(element, window.location.pathname, "Path Name");
    util.status.reportOnce(element, navigator.appName, "Browser");
    util.status.reportOnce(element, navigator.product, "Engine");
    util.status.reportOnce(element, navigator.appVersion, "Version");
    util.status.reportOnce(element, navigator.userAgent, "User Agent");
    util.status.reportOnce(element, navigator.language, "Language");
    util.status.reportOnce(element, localStorage.length, "Cache Items");

    var t = document.createElement("TABLE");
    var row = t.insertRow(-1);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    cell0.innerHTML = "Internal Tests";
    cell1.innerHTML = "Number of Tests";
    cell2.innerHTML = "Checks per Test";
    Object.keys(util.status.test).forEach(function (key, index) {
        var row = t.insertRow(-1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        cell0.innerHTML = key;
        cell1.innerHTML = util.status.test[key].times;
        cell2.innerHTML = util.status.test[key].tests;
    });
    element.appendChild(t);
};
util.status.reportOnce = function (element, what,label) {
    var t = document.createElement("DIV");
    t.innerHTML = label+" "+what;
    element.appendChild(t);
};
util.status.test = {}; // {[times:x, tests:y]}

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
            if (nodeChild.style.display == "none") nodeDest.setAttribute("open", "false");
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
