/*
 * todo
 * 
 * gallery should show all your art, with option to start a new one
 * pallette or catalog should let you choose graphics to add to the gallery:
 * show options, you select branches, until you see the graphics. click on a graphic and it adds
 * it to the defs click on an option and it goes back to that path.
 * need to be able to delete graphics from the gallery
 * composite filter must always come after turbulence or any others that are total
 * save the defs and move outside of gallery
 * move gallery
 * load svg
 * different starters
 * --
 * catalog
 * shapes/polygons/emojis/letters/numbers
 * arabic/russian
 * a/b/c
 * or 3/4/5/6 sided
 * --
 * saving
 * addins
 * for turning, reduce centre of rotation by scale
 * filters
 * delete and redo
 * new document(scroll)
 * draw
 * trace
 * commercialise
 * images
 * skew
 * colours
 * bug select image, goes
 * 
 * lo pri
 * reduce decimals
 * optimise
 * refactor
 * old style hrefs
 * guide
 * upload
 * trace
 * color swatches
 * graphic sets
 * materials or fabric shops or tailors or clothiers
 *  * when you move, the cursor creeps a few pixels
 * bouce back on sculpt to reveal what was sculped
 */

function svgDrag() { }
function svg() { }

var bb; //todo ensure local!
svgDrag.firstPos = { x: 0, y: 0, angle:0 };
svgDrag.lastPos = { x: 0, y: 0 };
svgDrag.mode = "drag";
svgDrag.options = {}; // onSelect,onCopy,onMove,svgPrimary,onlyCopy:"outer svg"

svg.dragCursorOffset = { x: 0, y: 0 };
svg.dragElement = null;
svg.dragFromArea = "";
svg.dragToArea = "";
svg.dragMoved = false;
svg.dragShape = null;

svgDrag.init = function (options) {
    svgDrag.options = options;
    var nodesSvg = document.getElementsByTagName("svg");
    for (let node of nodesSvg) {
        node.addEventListener("mousedown", svgDrag.start, false);
    }
};

svgDrag.start = function (e) {
    if (e.srcElement.nodeName == "svg") return;
    e.preventDefault();
    svg.graphicSelected = new graphic(e);
    svg.dragElement = e.srcElement;
    bb = e.srcElement.getBoundingClientRect();
    svg.dragCursorOffset.x = bb.left - e.clientX;
    svg.dragCursorOffset.y = bb.top - e.clientY;
    svg.dragFromArea = e.srcElement.farthestViewportElement.id;
    if (svgDrag.mode == "options") {
        if (svgDrag.options.onSelect) svgDrag.options.onSelect(svg.dragElement, svg.dragFromArea);
        return;
    }    
    document.body.addEventListener("mousemove", svgDrag.move, false);
    document.body.addEventListener("mouseup", svgDrag.end, false);
    svg.dragMoved = false;
    // for scale and turn
    svgDrag.lastPos.x = e.clientX;
    svgDrag.lastPos.y = e.clientY;
    svgDrag.firstPos.x = e.clientX;
    svgDrag.firstPos.y = e.clientY;
    svgDrag.rotate = null;
    svgDrag.scale = null;
    svgDrag.firstPos.angle = 0;
    for (var j = 0; j < svg.dragElement.transform.baseVal.length; j++) {
        var x = svg.dragElement.transform.baseVal.getItem(j);
        if (x.type == SVGTransform.SVG_TRANSFORM_ROTATE) {
            svgDrag.rotate = x;
            svgDrag.firstPos.angle = 0-x.angle;
        }
        if (x.type == SVGTransform.SVG_TRANSFORM_SCALE) {
            svgDrag.scale = x;
            svgDrag.firstScaleX = x.matrix.a;
            svgDrag.firstScaleY = x.matrix.d;
        }
    }
    var center = {};
    center.left = bb.left + (bb.width / 2);
    center.top = bb.top + (bb.height / 2);
    svgDrag.firstPos.angle += svgDrag.angle(bb, svgDrag.firstPos);
 };

svgDrag.angle = function (from, to) {
    var x = to.x - from.left;
    var y = to.y - from.top;
    var a = Math.atan2(y,x);
    return a*360/Math.PI;
};

svgDrag.move = function (e) {
    e.preventDefault();
    if (svgDrag.mode == "scale") {
        var scaleX;
        var scaleY;
        if (svgDrag.firstPos.x - bb.left == 0)
            scaleX = 0;
        else
            scaleX = Math.abs((e.clientX - bb.left) / (svgDrag.firstPos.x - bb.left));
        if (svgDrag.firstPos.y - bb.top == 0)
            scaleY = 0;
        else
            scaleY = Math.abs((e.clientY - bb.top) / (svgDrag.firstPos.y - bb.top));
        if ((scaleX !== 0) || (scaleY !== 0)) {
            if (scaleX == 0) scaleX = 1;
            if (scaleY == 0) scaleY = 1;
            if (svgDrag.scale) {
                for (var j = 0; j < svg.dragElement.transform.baseVal.length; j++) {
                    var x = svg.dragElement.transform.baseVal.getItem(j);
                    if (x.type == SVGTransform.SVG_TRANSFORM_SCALE) {
                        x.setScale(svgDrag.firstScaleX * scaleX, svgDrag.firstScaleY*scaleY);
                    }
                }
            }
            else {
                var tfm = document.getElementById("svgPen").createSVGTransform();
                tfm.setScale(scaleX, scaleY);
                svg.dragElement.transform.baseVal.appendItem(tfm);
                svgDrag.scale = tfm;
                svgDrag.firstScaleX = 1;
                svgDrag.firstScaleY = 1;
            }
        }
        svgDrag.lastPos.x = e.clientX;
        svgDrag.lastPos.y = e.clientY;
        return;
    }

    if (svgDrag.mode == "turn") {
        // todo reduce the centre of rotation by the scale of x and y
        svgDrag.lastPos.x = e.clientX;
        svgDrag.lastPos.y = e.clientY;
        var angle = svgDrag.angle(bb, svgDrag.lastPos);
        angle -= svgDrag.firstPos.angle;
 
        if (svgDrag.rotate) {
            for (var j = 0; j < svg.dragElement.transform.baseVal.length; j++) {
                var x = svg.dragElement.transform.baseVal.getItem(j);
                if (x.type == SVGTransform.SVG_TRANSFORM_ROTATE) {
                    x.setRotate(angle, bb.width / 2, bb.height / 2);
                }
            }
        }
        else {
            var tfm = document.getElementById("svgPen").createSVGTransform();
            tfm.setRotate(angle,  bb.width / 2,  bb.height / 2);
            svg.dragElement.transform.baseVal.appendItem(tfm);
            svgDrag.rotate = tfm;
        }
        return;
    }

    var svgP = document.getElementById("svgPen");
    if (svg.dragMoved) {
        svgDrag.shadowPlace(e, svgP);
    }
    else {
        document.body.style.cursor = "move";
        svg.dragShape = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        svg.dragShape.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', svg.dragElement.getAttributeNS('http://www.w3.org/1999/xlink', "href"));
        svg.dragShape.setAttributeNS(null, "filter", "url(#drag)");
        // copy all the transforms except the translate
        var aTransform = svg.dragElement.getAttribute("transform");
        svg.dragShape.setAttribute("transform", aTransform);
        transform = svg.dragShape.transform;
        for (var i = 0; i < transform.baseVal.length; i++) {
            if (transform.baseVal.getItem(i).type == SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                transform.baseVal.getItem(i).setTranslate(0, 0);
            }
        }
        svgDrag.shadowPlace(e, svgP);
        var svgG = document.getElementById(svgDrag.options.svgPrimary);
        svgG.appendChild(svg.dragShape); // svgPen
        svg.dragMoved = true;
    }
};

svgDrag.end = function (e) {
    document.body.removeEventListener("mousemove", svgDrag.move);
    document.body.removeEventListener("mouseup", svgDrag.end);
    if (svgDrag.mode !== "drag" && svgDrag.mode !== "sculpt") {
        view.graphicUpdate("svg");
        document.body.style.cursor = "default";
        return;
    }

    svg.dragToArea = e.target.farthestViewportElement;
    if (!svg.dragToArea) svg.dragToArea = e.target; 
        if (svg.dragMoved) {
        document.body.style.cursor = "default";
        svg.dragShape.removeAttributeNS(null, "filter");
        var svgP = document.getElementById(svgDrag.options.svgPrimary);
        if (!(svg.dragToArea.contains(svgP))) {
            svg.dragShape.parentNode.removeChild(svg.dragShape);
            svgDrag.shadowPlace(e, svg.dragToArea);
            svg.dragToArea.appendChild(svg.dragShape);
        }
            if (svgDrag.mode == "sculpt") sculpt.sculpts(svg.dragShape);
            if (e.shiftKey || (svg.dragFromArea == svgDrag.options.onlyCopy)) {
            if (svgDrag.options.onCopy) svgDrag.options.onCopy(svg.dragShape, svg.dragToArea);
        }
        else { 
            svg.dragElement.parentNode.removeChild(svg.dragElement);
            svg.dragElement = null;
            if (svgDrag.options.onMove) svgDrag.options.onMove(svg.dragShape, svg.dragToArea);
        }
    }
    else {
        if (svgDrag.options.onSelect) svgDrag.options.onSelect(svg.dragElement, svg.dragToArea);
    }
};

svgDrag.shadowPlace = function (e, svg2) {
    var svgP = view.pointClientToSvg(svg2, e.clientX + svg.dragCursorOffset.x, e.clientY + svg.dragCursorOffset.y);
    svg.dragShape.transform.baseVal.getItem(0).setTranslate(svgP.x, svgP.y);
};

svgDrag.test = function () {
    util.scriptTest([document.getElementsByTagName("svg")]);
};
svgDrag.test();

function view() { }
view.gallerySize = {}; // {num:num,cols:cols,rows:rows,width:widthIdeal,gap:gap}
view.modes = ["move", "scale", "turn","sculpt"];
view.modesInner = ["drag", "scale", "turn","sculpt"];
view.iMode = view.modes.length - 1;
view.sourceId = ""; // todo also sourceElement, selectedELement?
view.svgGallery = document.getElementById("svgGallery");
view.svgDefs = view.svgGallery.getElementsByTagName("defs")[0];
view.svgPen = document.getElementById('svgPen');
view.txtSvg = document.getElementById("txtSvg");

view.demo = function* () {
    var delay = 700; //ms
    var node;
    var nodeChild;
    var nodes = document.querySelectorAll("#svgGallery use");
    var x, y;
    function galleryUseGet(id) {
        var node;
        for (var j = 0; j < nodes.length; j++) {
            node = nodes[j];
            var a = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            a = a.substring(1); //strip the hash
            if (a == id)
                return node;
        }
    }
    function e(sType, x, y) {
        const event = new MouseEvent(sType, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        return event;
    }
    // test 1

    if (1 == 1) return;
    node = galleryUseGet("g15"); // stone
    node.dispatchEvent(e("mousedown", 0, 0));
    yield delay;
    node.dispatchEvent(e("mouseup", 0, 0));
    yield delay;    

    node = document.getElementById("gWork").children[1]; // tool
    node.dispatchEvent(e("mousedown", 0, 0));
    yield delay;
    node.dispatchEvent(e("mousemove", 120, 200));
    yield delay;
    node.dispatchEvent(e("mousemove", 140, 220));
    yield delay;
    node.dispatchEvent(e("mousemove", 160, 240));
    yield delay;
    node.dispatchEvent(e("mouseup", 170, 260));
    yield delay;  

    node = galleryUseGet("g7"); // tool
    node.dispatchEvent(e("mousedown", 0, 0));
    yield delay;
    node.dispatchEvent(e("mousemove", 20, 200));
    yield delay;
    node.dispatchEvent(e("mousemove", 40, 220));
    yield delay;
    node.dispatchEvent(e("mousemove", 60, 240));
    yield delay;
    node.dispatchEvent(e("mouseup", 70, 260));
    yield delay;  

    if (1==1) return;

   for (var i = 0; i < view.modes.length; i++) {
       document.getElementById('iMode').click();
       if (view.modesInner[view.iMode] == "drag") {
        console.log(document.getElementById('iMode').innerText);
        for (var j = 0; j < nodes.length && (j < 400); j++) {
            node = nodes[j];
            var a = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            a = a.substring(1); //strip the hash
            if (a == "g15") { // || g14
            console.log(node);
        //x = node.clientLeft;
        //y = node.clientTop;
        //console.log(x, y, node.clientWidth,node);
            node.dispatchEvent(e("mousedown", 0, 0));
            yield;
            node.dispatchEvent(e("mouseup", 0, 0));
            yield delay;
            var w = document.getElementById("gWork");
            for (k = 0; k < w.children.length; k++) {
                console.log("child",w.children.length, w.children[k]);
                nodeChild = w.children[k];
                nodeChild.dispatchEvent(e("mousedown", 0, 0));
                yield delay;
                nodeChild.dispatchEvent(e("mousemove", 20, 20));
                yield delay;
                nodeChild.dispatchEvent(e("mousemove", 40, 40));
                yield delay;
                nodeChild.dispatchEvent(e("mousemove", 60, 60));
                yield delay;
                nodeChild.dispatchEvent(e("mouseup", 0, 0));
                yield delay;
            }
            }
        }
       }
   }
};

view.divOpen = function (sDiv) {
    var div = document.getElementById(sDiv);
    div.style.display = (div.style.display == "none") ? "block" : "none";
};

view.galleryDraw = function (graphic) {
    //  svgGallery.innerHTML = ""; clear the use children first, and defs?
    var data = graphic;
    if (graphic.id.substring(0, 1) == "f") {
        return; //hack
    }
    var nDef;
    var nUse;
    if (data.level == "filter")
        return;
    if (data.level == "new") {
        nUse = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nUse.setAttributeNS(null, 'id', "iPlus");
        nUse.setAttributeNS(null, 'y', "60");
        nUse.setAttributeNS(null, 'class', "galleryText");
        nUse.textContent = "📜";
        nUse.setAttributeNS(null, "transform", "scale(6 6)");
    }
    else {
        nDef = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        view.svgDefs.appendChild(nDef);
        nDef.outerHTML = data.svg;
        //console.log(data.svg); //.getAttributeNS('http://www.w3.org/1999/xlink', 'href').substring(1));
        // create use
        nUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        nUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + data.id);
    }
    var col = data.seq % view.gallerySize.cols;
    var row = (data.seq - col) / view.gallerySize.cols;
    var x = col * view.gallerySize.width * (1 + view.gallerySize.gap);
    var y = row * view.gallerySize.width * (1 + view.gallerySize.gap);
    nUse.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
    view.svgGallery.appendChild(nUse);
    var bb1 = nUse.getBoundingClientRect();
    var scale = view.gallerySize.width / Math.max(bb1.height, bb1.width);
    if ((scale > 1.02) || (scale < 0.99))
        nUse.setAttributeNS(null, "transform", "translate(" + x + " " + y + "), scale(" + scale + ")");
};

//show graphics in up to 2 rows if we can at ideal size, or up to 3 at smaller size, or at minimum size
view.gallerySizeSet = function (num) {
    var gap = .125;
    var bb = view.svgGallery.getBoundingClientRect();
    var rc;
    var r = function (w) {
        var cols = Math.floor((bb.width - (w * gap)) / (w * (1 + gap)));
        var rows = Math.ceil(num / cols);
        return { rows: rows, cols: cols, width: w };
    };
    rc = r(100);
    if (rc.rows > 2) {
        rc = r(80);
        if (rc.rows > 3)
            rc = r(60);
    }
    //view.test1(); //todo emergency fix
    view.svgGallery.setAttributeNS(null, "height", rc.rows * rc.width * (1 + gap));
    return { num: num, cols: rc.cols, rows: rc.rows, width: rc.width, gap: gap };
};

view.graphicUpdate = function (sFrom) {
    if (sFrom == "text") {
        view.svgPen.innerHTML = view.txtSvg.value;
    }
    if (sFrom !== "text") {
        view.txtSvg.value = view.svgPen.innerHTML;
    }
    var from = document.getElementById("gWork");
    var old = document.getElementById(view.sourceId);
    var to = from.cloneNode(true);
    to.id = view.sourceId;
    to.classList.add("draggable");
    var next = old.nextSibling;
    view.svgDefs.removeChild(old);
    view.svgDefs.insertBefore(to, next);
    view.listener("gUpdate", to);
};

view.listen = function (f) {
    view.listener = f;
};

view.modeNext = function () {
    view.iMode++;
    if (view.iMode >= view.modes.length) view.iMode = 0;
    document.getElementById("iMode").innerHTML = view.modes[view.iMode];
    svgDrag.mode = view.modesInner[view.iMode];
};

view.onCopy = function (element,area) {
    if (area.id == "svgGallery") {
        var xx=element.getAttributeNS('http://www.w3.org/1999/xlink', 'href').substring(1);
        var from = document.getElementById(xx);
        var to = from.cloneNode(true);
        to.classList.add("draggable");
        view.listener("gNew", to);
    }
    if (area.id == "svgPenOuter") {
        view.graphicUpdate("svg");
    }
};

view.onMove = function (element, area) {
    if (area.id == "svgPenOuter") {
        view.graphicUpdate("svg");
    }
};

view.onSelect = function (element, area) {
        var computedStyle = window.getComputedStyle(element);
        var computedColor = computedStyle.fill;
        document.getElementById("inputColor").value = util.RGBDecimalToHex(computedColor); //"#ff0000";
        document.getElementById("inputOpacity").value = computedStyle.opacity;
        var computedStrokeColor = computedStyle.stroke;
        if (computedStrokeColor == "none") computedStrokeColor = "rgb(0,0,0)";
        document.getElementById("inputStrokeColor").value = util.RGBDecimalToHex(computedStrokeColor); //"#ff0000";
        var s = document.getElementById("gWork").getAttributeNS(null, "stroke-width");
        if (s) s = s.substring(0, s.length - 1); else s = 0;
        document.getElementById("inputStrokeWidth").value = s;
    if (area.id == "svgGallery") {
        view.listener("gSelect", (element.getAttributeNS('http://www.w3.org/1999/xlink', 'href').substring(1)));
    }
};

// translate page to SVG co-ordinate 
view.pointClientToSvg = function (element, x, y) {
    var pt = element.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(element.getScreenCTM().inverse());
};

view.update = function (entity, data) {
    switch (entity) {
        case "init":
            view.modeNext();
            svgDrag.init({ onSelect: view.onSelect, onCopy: view.onCopy, onMove: view.onMove, svgPrimary: "gWork", onlyCopy: "svgGallery" });
            view.gallerySize = view.gallerySizeSet(data);
            var colors = ["white","green","blue","yellow","red","white"];
            var dsColors = new dashboard({parent:"dColors2",source:colors,allowNone:false,allowMore:true});
            var dsFilters = new dashboard({ parent: "dFilters", source: colors, allowNone: false, allowMore: true });
            var dsLights = new dashboard({ parent: "dLights", source: colors, allowNone: false, allowMore: true });
            util.demo(view.demo); // todo depending on query parameters
            break;
        case "gSelect":
            view.sourceId = data;
            var old = document.getElementById("gWork");
            if (old) view.svgPen.removeChild(old);
            var from = document.getElementById(view.sourceId);
            var to = from.cloneNode(true);
            to.id = "gWork";
            to.classList.remove("draggable");
            view.svgPen.appendChild(to);
            view.txtSvg.value = view.svgPen.innerHTML;
            break;
        case "gNew":
            var a = data.element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            a = a.substring(1); //strip the hash
            var defWas = document.getElementById(a);
            var nDef = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            view.svgDefs.appendChild(nDef);
            var s = defWas.outerHTML;
            s = s.replace(a, 'g'+data.id);
            nDef.outerHTML = s;
            data.element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#g' + data.id);       
            break;  
        case "gShow":
            view.galleryDraw(data);
            break;
        default:
            util.log("update what");
    }
};



view.hack = function (attribute,value) {
    var x = document.getElementById("gWork"); //todo why
    x.setAttributeNS(null, attribute, value);
    if (attribute == "fill") x.style.fill = value;
    view.graphicUpdate("form");
};

view.hackFilter = function (filterType, attribute) {
    var v = document.getElementById(attribute);
    if (attribute == "operator2") attribute = "operator";

    var container = document.getElementById("gWork");

    var defs = document.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        document.appendChild(defs);
    }

    var f,nFilter, sFilter;
    sFilter = container.getAttribute('filter');
    if (sFilter) {
        sFilter = sFilter.replace("url(#", "");
        sFilter = sFilter.replace(")", "");
        console.log("1 filter already",sFilter);
    }
    else {
        f = 0;
        var fNew;
        console.log("2");
        var defFilters = document.querySelectorAll("defs filter");
        console.log("3",defFilters.length);
        for (var i = 0; i < defFilters.length; i++) {
            console.log("qs",defFilters.item(i));
            fNew = defFilters.item(i).getAttribute('id');
            console.log("4",fNew);
            if (fNew) {
                fNew = parseInt(fNew.substring(1));
                console.log("5", fNew);
                if (Number.isInteger(fNew)) {
                    console.log("6", fNew);
                    if (fNew > f) f = fNew;
                }
            }
        }
        f++;
        sFilter = "f" + f;
        console.log("generated sFilter", sFilter);
        container.setAttribute("filter", "url(#"+sFilter+")");
    }
    console.log(f);console.log(container); console.log(container.filter);
    //f = f.substring(1); //strip the hash


    var filter = defs.querySelector("#"+sFilter);
    if (!filter) {
        filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", sFilter);
        //filter.setAttribute("x", "0");
        //filter.setAttribute("y", "0");
        defs.appendChild(filter);
    }

    // hack: these are sub - filter primitives
    if ((filterType == "fePointLight") || (filterType == "feSpotLight") || (filterType == "feDistantLight")) {
        var parentFilter = filter.querySelector("feSpecularLighting");
        if (!parentFilter) {
            parentFilter = document.createElementNS("http://www.w3.org/2000/svg", "feSpecularLighting");
            parentFilter.setAttribute("in2", "SourceGraphic");
            filter.appendChild(parentFilter);
        } 
        filter = parentFilter;
    }

    var gaussianFilter = filter.querySelector(filterType);
    if (!gaussianFilter) {
        gaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", filterType);
        gaussianFilter.setAttribute("in2", "SourceGraphic");
        filter.appendChild(gaussianFilter);
    }       
    gaussianFilter.setAttribute(attribute, v.value);
    console.log("a", attribute, v.value, filter.innerHTML);
    // why does dis appear?is eg <feMorphology in2="SourceGraphic" radius="1"></feMorphology>. store it
    // todo then recall it and pre load the form if it exists
    view.graphicUpdate("form");
    view.listener("filterSave", filter);
};

view.abc = function () {
    var hack = document.getElementById("gWork");
    hack.style.fill = "blue";
    hack.style.transform = "perspective(9cm) rotateX(-15deg) rotateY(30deg)";
       };

view.test1 = function () {
    localStorage.clear();
    view.listener("gFirstTime", null);
};

view.testOpen = function () {
    Window.showOpenFilePicker();
};

view.testOpen2 = function (event) {
    console.log("xx");
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        view.listener("gLoadFromFile", reader);
    };
    reader.readAsText(input.files[0]);
};


view.testSave = function () {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream," + encodeURIComponent('"My DATA"');
    a.download = 'myFile.svg';
    a.click(); // we not add 'a' to DOM so no need to remove
};

view.test = function () {
   util.scriptTest([view.svgGallery,view.svgPen,view.txtSvg]);
};
view.test();
