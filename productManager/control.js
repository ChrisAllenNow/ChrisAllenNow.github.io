function control() { }

var spec = "productManager.js";
var prototypeSpec = "prototype.js";
var productSpec = util.parameterGet("productSpec");
if (!productSpec) {
    util.log("no product spec provided, using example");
    productSpec = "example.js";
};

control.onModelChanged = function (entity, data) {
view.update(entity,data);
};

control.onViewChanged = function (action, data) {
    switch (action) {
        case "refresh":
            model.load(spec, prototypeSpec, productSpec);
            break;
        case "update":
            model.update(data);
            break;
        default:
            util.log2("Case A", action);
    };
};

control.test = function () {
    util.scriptTest([model.listen,view.listen,model.load,view.update]);
};

control.test();
window.onbeforeunload = io.flush;
model.listen(control.onModelChanged);
view.listen(control.onViewChanged);
model.load(spec,prototypeSpec,productSpec);