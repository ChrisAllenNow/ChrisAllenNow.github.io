function view() { }

view.listen = function (f) {
    view.listener = f;
};

view.menuDo = function (mPassed) {
    var m = this.m;
    if (!m) m = mPassed;
    switch (m) {
        case "1": // edit menu
            ui.hide("dMenu", true);
            ui.hide("dMenuEdit", false);
            ui.hide("dMenuMove", true);
            break;
        case "2": // move/copy menu
            ui.hide("dMenu", true);
            ui.hide("dMenuEdit", true);
            ui.hide("dMenuMove", false);
            ui.dragDrop.start("li", util.log2);
            break;
        case "3": // end edit
            ui.hide("dMenuEdit", true);
            dMain.contentEditable = false;
            document.getElementById('dMain').style.border = '';
            view.listener("update", util.xml.fromHtml(document.getElementById("dMain"), document.getElementById("dTitle").innerText));
            break;
        case "3x": // cancel edit
            ui.hide("dMenuEdit", true);
            dMain.contentEditable = false;
            document.getElementById('dMain').style.border = '';
            view.listener("refresh", 0);
            break;
        case "4": // end move/copy
            ui.hide("dMenuMove", true);
            ui.dragDrop.end("li");
            break;
        case "5": // edit
            dMain.contentEditable = true;
            document.getElementById('dMain').style.border = '.1em solid black';
            break;
        case "6": // test to remove!
            util.log("testing");
            view.x();
            break;
        case "7": // test to remove!
            util.log("settings");
            view.x();
            break;
        case "8": // test to remove!
            document.getElementById('dAbout').style.border = '.1em solid black';
            document.getElementById('dAbout').style.display = "block";
            util.status.report(document.getElementById('dAbout'));
            break;
        case "9": // sign out
            io.signOut();
            break;
        default:
            util.log2(m, "menu handle");
    }
};

view.update = function (entity, data) {
    var xml;
    switch (entity) {
        case "spec":
            xml = util.xml.fromString(data);
            ui.showXml("dSpec", xml, "/opml/body/o", ui.showOpml);
            ui.showXml("dMenu", xml, "/opml/body//o[@t='Product Features']/o", ui.showOpml);
            ui.showXml("dAuth", xml, "/opml/body//o[@t='Information for Users']/o", ui.showOpml);
            break;
        case ("productSpec"):
            xml = util.xml.fromString(data);
            ui.showXml("dTitle", xml, "/opml/head/title", ui.showText);
            ui.showXml("dMain", xml, "/opml/body/o/o", ui.showOpml);
            break;
            case ("prototypeSpec"):
            //var prototypeXml = util.xml.fromString(data);
            //var result = util.xml.compare(prototypeXml, specXml);
            //ui.showXml("dMain", result, "/opml/body/o", ui.showOpml);
        default: "update what";
    }
};

view.test = function () {
    util.scriptTest([document.getElementById("dTitle"), document.getElementById("dMain"), document.getElementById("dMenu"), document.getElementById("dSpec")]);
};

view.test();
