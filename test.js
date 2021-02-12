function test() { }

test.demo = function* () {
    var delay = 700; //ms
    view.showCurrent();
    yield delay;
    view.showRecents();
    yield delay;
    view.showTemplates();
    yield delay;
};
