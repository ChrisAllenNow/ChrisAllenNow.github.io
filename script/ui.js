function ui() { }

ui.authToggle = function () {
    var x = document.getElementById("dAuth");
    if (x.style.display != "block") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
};

ui.dragDrop = function () { };

ui.dragDrop.end = function (tag) {
    const containers = document.getElementsByTagName(tag);
    for (const container of containers) {
        container.removeEventListener("dragover", dragover)
        container.removeEventListener("dragenter", dragenter)
        container.removeEventListener("dragstart", dragstart)
        container.removeEventListener("drop", drop)
    }
};

ui.dragDrop.start = function (tag, action) {
    const containers = document.getElementsByTagName('Li');
    for (const container of containers) {
        container.addEventListener("dragover", dragover)
        container.addEventListener("dragenter", dragenter)
        container.addEventListener("dragstart", dragstart)
        container.addEventListener("drop", drop)
    };
};
function dragover(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move"; // TODO move or copy
};
function dragenter(e) {
    e.preventDefault()
};
function dragstart(e) {
    e.dataTransfer.setData('source', e.path[1].id);
    e.dataTransfer.effectAllowed = "move"; //TODO move or copy
};
function drop(e) {
    var source = document.getElementById(e.dataTransfer.getData('source'));
    e.path[2].insertBefore(source, e.path[1]);
};

ui.hide = function (element,yes) {
    var e = document.getElementById(element);
    if (e)
        e.style.display = yes ? "none" : "block";
};

ui.menuToggle = function () {
    var x = document.getElementById("dMenu");
    if (x.style.display != "block") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
};

ui.outlineToggle = function (e) {
    var x = e.path[1].children[1];
    if (x.style.display == "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
    event.preventDefault();
};

ui.opmlId = 0;

ui.showXml = function (div, xml, xpath, method) {
    ui.opmlId = 0;
    var dest = document.getElementById(div);
    dest.innerHTML = "";
    var nodes = util.xml.filter(xml, xpath);
    method(dest, nodes,true);
};

// todo id MUST be unique in html (might come from 2+ opml docs too)
ui.showOpml = function (dest, nodes,open) {
    var a;
    var id;
    var listItem;
    var list = document.createElement("ul");
    if (!open) list.style.display = "none";
    var m;
    var outline = nodes.iterateNext();
    var s;
    var t;
    while (outline) {
        t = outline.attributes.getNamedItem("t");
        listItem = document.createElement("li");
        id = outline.attributes.getNamedItem("id");
        if (id) listItem.id = id.value; else listItem.id=ui.opmlId++;
        a = document.createElement("a");
        m = outline.attributes.getNamedItem("m");
        s = outline.attributes.getNamedItem("s");
        if (m) {
            a.href = "#";
            a.m = m.value;
            a.onclick = view.menuDo;
            a.ontouchstart = view.menuDo;
        } else
        if (s)
            a.href = "productManager.htm?productSpec=" + s.value;
        else {
            a.href = "#";
            a.onclick = ui.outlineToggle;
            a.ontouchstart = ui.outlineToggle;
        }
        a.innerHTML = t.value;
        t = outline.attributes.getNamedItem("b");
        if (t) a.title = t.value;
        var openNext = outline.attributes.getNamedItem("open");
        if (openNext && openNext.value == "false") openNext = false; else openNext = true;
        listItem.appendChild(a);
        list.appendChild(listItem);
        ui.showOpml(listItem, util.xml.filter(outline, "o"),openNext);
        outline = nodes.iterateNext();
    }
    dest.appendChild(list);
};

ui.showText = function (dest, nodes,open) {
    var outline = nodes.iterateNext();
    dest.innerHTML = outline.innerHTML;
};

ui.test = function () {
    util.scriptTest([document.getElementById("dMenu"), document.getElementById("dMenuEdit"), document.getElementById("dMenuMove")]);
};

ui.test();