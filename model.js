function model() { }

// "control" {gNum,gMax,gCurr}
// "g" seq {seq,id,svg, level:base|group|new}

model.app = "art";
model.v = 1;
model.control = {};

model.defsSave = function (defs) {
    var defSeq = 0;
    var k, v;
    for (var i = 0; i < defs.length; i++) {
        a = defs[i].children;
        for (var j = 0; j < a.length; j++) {
            k = {app:"art",v:1,ds:"defs",seq:defSeq};
            v = a[j].outerHTML;
            io.cache.set(k, v);
            defSeq++;
        }
    }
    k = { app: "art", v: 1, ds: "control"};
    v = { defsLength: defSeq };
    io.cache.set(k, v);
    return;
};

model.defaults = function () {
    var key = { app: model.app, v: model.v, ds: "defs", seq: 0 };
    var data = {};
    var base = [
        '<circle id="g0" cx="50" cy="60" r="50" fill="green" class="draggable" />',
        '<circle id="g1" cx="50" cy="60" r="50" fill="green" class="draggable" filter="url(#blurMe)" />',
        '<rect id="g2" y="10" width="100" height="100" rx="15" fill="green" class="draggable" />',
        '<rect id="g3" y="10" width="100" height="100" rx="15" fill="green" class="draggable" filter="url(#blurMe)" />',
        '<polygon id="g4" points="0,110 50,10 100,110" fill="green" class="draggable" />',
        '<polygon id="g5" points="0,110 50,10 100,110" fill="green" class="draggable" filter="url(#blurMe)" />',
        '<polygon id="g6" points="0,110 50,10 70,10  90,50  100,110" fill="blue" class="draggable" />',
        '<polygon id="g7" points="0,110 0,30 5,20  10,10 15,20 20,30 20,110" fill="olive" class="draggable" />',
        '<text id="g8" y="60" class="draggable galleryText">T</text>',
        '<text id="g9" y="70" class="draggable galleryText">&#x1F5D1</text>',
        '<text id="g10" y="70" class="draggable galleryText">&#x1F642</text>',
        '<text id="g11" y="60" class="draggable galleryText">&#x2600</text>',
        '<text id="g12" y="70" class="draggable galleryText">&#x1F4F7</text>',
        '<g id="g13" class="draggable"><use xlink:href="#g0" transform="translate(20)"></use><use xlink:href="#g1" transform="translate(30,40)"></use></g>',
        '<g id="g14" class="draggable"><use xlink:href="#g4" transform="translate(20)"></use><use xlink:href="#g5" transform="translate(30,40)"></use></g>',
        '<g id="g15" class="draggable"><use xlink:href="#g6" transform="translate(20)"></use><use xlink:href="#g7" transform="translate(120,10)"></use></g>',
        '<filter id="f1">xxx</filter>'
    ];
    //      '<g id="g16" class="draggable"></g>'
    for (var i = 0; i < base.length; i++) {
        key.seq = i;
        data.id = "g" + i;
        if (i == base.length - 1)
            data.level = "base"; //"new";
        else if (i == base.length - 2)
            data.level = "group";
        else if (base[i].substring(0, 1) == "<f")
            data.level = "filter";
        else
            data.level = "base";
        data.svg = base[i];
        io.cache.set(key, data);
    }

    key = { app: model.app, v: model.v, ds: "control" };
    data = { gMax: i-1, gNum: i, gCurr: "g11" };
    io.cache.set(key, data);
};

model.filterSave = function (f) {
    console.log(f);
    var key = { app: model.app, v: model.v, ds: "defs", id: f.id };
    io.cache.set(key, f.innerHTML);
    return;
};

model.listen = function (f) {
    model.listener = f;
};

model.load = function () {
    var graphic = {};
    var key;
    key = { app: model.app, v: model.v, ds: "control" };
    model.control = io.cache.get(key);
    if (!model.control) model.control = {}; // todo set defaults
    model.listener("init", model.control.gNum);
    for (var i = 0; i < model.control.gNum; i++) {
        key = { app: model.app, v: model.v, ds: "defs", seq: i };
        graphic = io.cache.get(key);
        graphic.seq = i;
        if (!(graphic.svg.substring(0, 7)=="<filter"))
            model.listener("gShow", graphic);
    }

    for (var i = 0; i < 10; i++) { //todo hack, sb in view
        key = { app: model.app, v: model.v, ds: "defs", id: "f"+i };
        graphic = io.cache.get(key);
        if (graphic) {
            var x = view.svgGallery.getElementsByTagName("defs")[0];
            var y = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            x.appendChild(y);
            y.id = "f" + i;
            y.innerHTML = graphic;
        }
    }

    model.listener("gSelect", model.control.gCurr);
    return;
};

model.loadFromFile = function (reader) {
    var node = document.getElementById('file-selector');
    let parser = new DOMParser();
    let doc = parser.parseFromString(reader.result, "image/svg+xml");
    console.log(doc);
        // then all the defs go in the defs, and everything else inside the svg tag(s) goes into 1 master def
        // Note that if the parsing process fails, the DOMParser does not throw an exception, but instead returns an error document:
        // then as in model.load, repeatedly do  model.listener("gShow", graphic); which 
        // adds the graphic element to the defs and then adds a 'use' of that to the gallery svg element
        // in this way all the deys from the doc go in our svg defs.

    // todo do we need to close and delete reader
};

model.save = function (data) {
    var graphic = {};
    var key;
    var seq = model.control.gCurr.substring(1); // todo where from
    seq = parseInt(seq);
    key = { app: model.app, v: model.v, ds: "control" };
    io.cache.set(key, model.control);
    key = { app: model.app, v: model.v, ds: "defs", seq: seq };
    graphic.seq = data.seq; //todo where from
    graphic.id = model.control.gCurr;
    graphic.svg = data.outerHTML;
    graphic.level = "group"; //todo  level: base | group | new}
    io.cache.set(key, graphic);
    return;
};

model.save2 = function (data) {
    var graphic = {};
    var key;
    var seq = data.id.substring(1); // todo where from
    seq = parseInt(seq);
    key = { app: model.app, v: model.v, ds: "control" };
    io.cache.set(key, model.control);
    key = { app: model.app, v: model.v, ds: "defs", seq: seq };
    graphic.seq = seq; //todo where from
    graphic.id = data.id;
    graphic.svg = data.outerHTML;
    graphic.level = "base"; //todo  level: base | group | new}
    io.cache.set(key, graphic);
    return;
};

model.update = function (entity, data) {
    switch (entity) {
        case "filterSave":
            model.filterSave(data);
            break;
        case "gFirstTime":
            model.defaults();
            break;
        case "gLoadFromFile":
            model.loadFromFile(data);
            break;
        case "gNew":
            data.seq = model.control.gNum;
            model.control.gNum++;
            model.control.gMax++;
            data.id = "g"+model.control.gMax;
            model.control.gCurr = data.id;
            model.save(data);
            break;
        case "gUpdate":
            model.save(data);
            break;
        case "gUpdate2":
            model.save2(data);
            break;
        case "gDelete":
            console.log("todo", entity);
            break;
        case "gSelect":
            model.control.gCurr = data;
            model.listener("gSelect", model.control.gCurr);
            break;
        case "gGenerate":
            console.log("todo", entity);
            break;
        case "gRegenerate":
            console.log("todo", entity);
            break;
        case "gPareBack":
            console.log("todo", entity);
            break;
        case "restore":
            console.log("restoring", entity, data);
            model.defsRestore(data);
            break;
        case "save":
            console.log("updating", entity, data);
            model.defsSave(data);
            break;
        case "load":
            model.load();
            break;
        default:
            util.log("update what");
    }
};

model.test = function () {
    util.scriptTest([io,util]);
};
model.test();
