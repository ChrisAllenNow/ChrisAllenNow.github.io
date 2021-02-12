class dashboard {

    constructor(control) {
        this._control = control;
        this._parent = document.getElementById(control.parent).querySelector("svg");
        for (var i = 0; i < control.source.length; i++) {
            this.add(i, control.source[i]);
            }
      }

    add(iNum,color) {
        var nUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        nUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#g2');
        var x = 10+(iNum*110);
        var y = 0;
        nUse.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
        nUse.style.fill = color;
        nUse.style.stroke = "#222";
        nUse.style.strokeWidth = "5";
        this._parent.appendChild(nUse);
    }

    get carname() {
        return this._carname;
    }
    set carname(x) {
        this._carname = x;
    }

    static test() {
        util.scriptTest([]);
    }
}

dashboard.test();
