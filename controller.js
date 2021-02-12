function control() { }

control.test = function () {
    util.scriptTest([model.listen,view.listen,model.load,model.update,view.update]);
};

control.test();
model.listen(view.update);
view.listen(model.update);
model.load();
