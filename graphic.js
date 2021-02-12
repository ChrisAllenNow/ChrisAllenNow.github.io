class graphic {

    constructor(e) {
        this._e = e;
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

    get bb() {
        return this._center;
    }
    set bb(x) {
        this._bb = x;
    }

    get center() {
        return this._center;
    }
    set center(c) {
        this._center = c;
    }

    static test() {
        util.scriptTest([]);
    }
}

graphic.test();
