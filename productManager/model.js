function model() { }

model.opml = {};

model.productSpec = { type: "ds", collection: "products", where: [{ field: "team", value: 1 }, { field: "product", value: "example" }] };

model.listen = function (f) {
    model.listener = f;
};

model.load = function (spec, prototypeSpec,productSpec) {
    var o = { type:"ds", collection: "products", where: [{ field: "team", value: 1 }, { field: "product", value: "productManager" }] };
    io.fetch(o, model.loadedSpec, io.optionsDEFAULT);

    io.fetch(model.productSpec, model.loadedProductSpec, io.optionsDEFAULT);
};

model.loadedProductSpec = function (d) {
    util.assert(model.listener);
    model.opml = d.data.opml;
    model.listener("productSpec", model.opml);
    return d;
};

model.loadedSpec = function (d) {
    util.assert(model.listener);
    model.listener("spec", d.data.opml);
    return d;
};

model.update = function (xml) {
    model.opml = xml;
    io.fetch(model.productSpec, model.updating, io.optionsDEFAULT);
    // ref how to add
    //var ds = { type: "ds", collection: "products", where: [{ field: "team", value: 1 }, { field: "product", value: "new" }] };
    //io.fetch(ds, function (d) { util.log(d); d.data.team = 1; d.data.product = "new"; d.data.test = Date.now(); d.state = "dirty"; return d; }, { mode: 1, cacheMs: io.cacheMsDEFAULT});
};

model.updating = function (d) {
    d.data.opml = util.xml.toString(model.opml);
    d.state = "dirty";
    return d;
};

model.test = function () {
    util.scriptTest([]);
};
model.test();
