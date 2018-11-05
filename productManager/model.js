function model() { }

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
    model.listener("productSpec", d.data.opml);
    return d;
};

model.loadedSpec = function (d) {
    util.assert(model.listener);
    model.listener("spec", d.data.opml);
    return d;
};

model.update = function (xml) { // todo remove this test
    util.log("here");
    console.log(util.xml.toString(xml));
    return;
    io.fetch(model.productSpec, function (d) { util.log(d); d.data.test = Date.now(); d.state = "dirty"; return d; }, io.optionsDEFAULT);
    var ds = { type: "ds", collection: "products", where: [{ field: "team", value: 1 }, { field: "product", value: "new" }] };
    io.fetch(ds, function (d) { util.log(d); d.data.team = 1; d.data.product = "new"; d.data.test = Date.now(); d.state = "dirty"; return d; }, { mode: 1, cacheMs: io.cacheMsDEFAULT});
};

model.test = function () {
    util.scriptTest([]);
};
model.test();
