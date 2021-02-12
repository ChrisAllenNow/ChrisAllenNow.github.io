function sculpt() { }
/*
 * todo 
//.track {
fill: none;
stroke: black;
stroke - width: 20;
}
.round {
    stroke - linejoin: round;
}
    <polygon class="track round" points="20,170 290,170 290,280 20,280"></polygon>
</svg>
    <circle cx="320" cy="100" r="100" shape-rendering="crispEdges" />
// to round it, turn the polygon to a path of form Q T* Z
 var pt    = svg.createSVGPoint();
 * */

// sculpt elements the tool intersects after moving
sculpt.sculpts = function (eToolUse) {
    var eTool = sculpt.useMaterialize(eToolUse);
    var bbTool = eTool.getBBox();
    var svgP = document.getElementById("svgPen");
    var nodes = svgP.getIntersectionList(bbTool, null);
    console.log(eTool, bbTool, nodes, nodes.length);
    //sculpt.points(eToolA);
    var eStone, eStoneDef, eStoneUse;

    for (var i = 0; i < nodes.length; i++) {
        eStoneUse = nodes[i]; //todo why can sometime carve the tool?
        if (eStoneUse != eToolUse && eStoneUse.tagName.toLowerCase() == "use") {
            eStoneDef = sculpt.useDef(eStoneUse);
        //todo Maybe use masks for other shapes
            if (eStoneDef.tagName.toLowerCase() == "polygon") {
                // extrude, not sculpt, if before moving the tool was enclosed by the stone
                console.log("aa",eStoneUse);
                eStone = sculpt.useMaterialize(eStoneUse);
                bToolWasEnclosed = false; // todo svg.checkEnclosure(eToolWas, bbStone);
                sculpt.sculpt(eStone, eTool, !bToolWasEnclosed);
                console.log(eStoneUse.innerHTML);
                sculpt.useUpdateDef(eStoneDef, eStoneUse, eStone);
                sculpt.useDematerialize(eStone);
                break; //todo maybe not
            }
        }
    }
    sculpt.useDematerialize(eTool);
};

// sculpt or extrude element with tool
sculpt.sculpt = function (eStone, eTool, bSculpt) {
    var iStoneFirstInUnion = sculpt.interpolate(eTool, eStone, true);
    var iStoneFirstAfterUnion = sculpt.interpolate(eTool, eStone, false);
    var iToolFirstInUnion = sculpt.interpolate(eStone, eTool, true);
    var iToolFirstAfterUnion = sculpt.interpolate(eStone, eTool, false);
    // no match maybe because near miss
    if ((iStoneFirstInUnion == null) || (iStoneFirstAfterUnion == null) || (iToolFirstInUnion == null) || (iToolFirstAfterUnion == null)) {
        console.log("nomatch stone", eStone, iStoneFirstInUnion, iStoneFirstAfterUnion);
        console.log("nomatch tool", eTool, iToolFirstInUnion, iToolFirstAfterUnion);
        return;
    }

    var pointsStone = eStone.points;
    var pointsTool = eTool.points;
    // todo if not all polygons drawn clockwise might have to invert sequence
    var pointCrossing1 = sculpt.cross(pointsStone.getItem(iStoneFirstInUnion ? iStoneFirstInUnion - 1 : pointsStone.numberOfItems - 1), pointsStone.getItem(iStoneFirstInUnion), pointsTool.getItem(iToolFirstAfterUnion ? iToolFirstAfterUnion - 1 : pointsTool.numberOfItems - 1), pointsTool.getItem(iToolFirstAfterUnion));
    var pointCrossing2 = sculpt.cross(pointsTool.getItem(iToolFirstInUnion ? iToolFirstInUnion - 1 : pointsTool.numberOfItems - 1), pointsTool.getItem(iToolFirstInUnion), pointsStone.getItem(iStoneFirstAfterUnion ? iStoneFirstAfterUnion - 1 : pointsStone.numberOfItems - 1), pointsStone.getItem(iStoneFirstAfterUnion));

    // insert first crossing
    if (pointCrossing1) {
        pointsStone.insertItemBefore(pointCrossing1, iStoneFirstInUnion);
        iStoneFirstInUnion++;
        if (iStoneFirstInUnion <= iStoneFirstAfterUnion)
            iStoneFirstAfterUnion++;
    }

    // insert 2nd crossing
    if (pointCrossing2) {
        pointsStone.insertItemBefore(pointCrossing2, iStoneFirstAfterUnion);
        iStoneFirstAfterUnion++;
        if (iStoneFirstInUnion >= iStoneFirstAfterUnion)
            iStoneFirstInUnion++;
    }
    //sculpt.d(p, "stone points after crossings");

    var iFirst, iCount, j;
    // remove points of stone in intersection
    iFirst = iStoneFirstInUnion;
    iCount = iStoneFirstAfterUnion - iStoneFirstInUnion - 1;
    if (iCount < 0) iCount += pointsStone.numberOfItems;
    for (var i = 0; i < iCount; i++) {
        j = iFirst + i;
        if (j >= pointsStone.numberOfItems)
            pointsStone.removeItem(0);
        else
            pointsStone.removeItem(iStoneFirstInUnion);
    }
    iStoneFirstAfterUnion = iStoneFirstInUnion;
    //sculpt.d(p, "stone points after removing intersection");
    // insert points of tool in intersection(for sculpting) or outside intersection(for extruding)
    //console.log(iToolFirstInUnion, iToolFirstAfterUnion,bSculpt);
    if (bSculpt) {
        iFirst = iToolFirstInUnion;
        iCount = iToolFirstAfterUnion - iToolFirstInUnion;
    }
    else {
        iFirst = iToolFirstAfterUnion;
        iCount = iToolFirstInUnion - iToolFirstAfterUnion;
    }
    if (iCount < 0) iCount += pointsTool.numberOfItems;
    for (var i = 0; i < iCount; i++) {
        j = iFirst + iCount - 1 - i; //backwards todo optimise
        if (j >= pointsTool.numberOfItems) j -= pointsTool.numberOfItems;
        pointsStone.insertItemBefore(pointsTool.getItem(j), iStoneFirstAfterUnion);
        iStoneFirstAfterUnion++;
    }
    //sculpt.d(p, "stone points after inserting");
    // todo optimise polygon
};

// get index of first point or interpolation in intersection/or after intersection with polygonFixed
    // at say 2000:
    // a 4 point polygon, a square, would get log2(500)=9 -> up to 512 subdivisions between points
    // a 10 point polygon would get log2(200)=8 ->256 up to 256 subdivisions between points
    // a 100 point polygon would get log2(10)=3 -> 8 subdivisions between points
    // a 1000+ point polygon would get 1 ie no further subdivisions
sculpt.interpolate = function (polygonFixed, polygonSplittable, bInReq) {
    var bIn;
    var points = polygonSplittable.points;
    var bPrev = sculpt.inside(polygonFixed, points.getItem(points.numberOfItems - 1));
    //console.log(points.getItem(points.numberOfItems - 1));
    //console.log(points.numberOfItems);
    var iMax = Math.max(1, Math.round(Math.log2(200 / points.numberOfItems))); // 2000 //todo const 
    //console.log("bPrev", bPrev, "iMax", iMax);
    var iPointNext;
    var pointInter = document.getElementById("svgPen").createSVGPoint();
    var proportionA, proportionB;
    for (var iPower = 0; iPower < iMax; iPower++) {
        iFraction = 2 ** iPower;
        for (var iPoint = 0; iPoint < points.numberOfItems; iPoint++) {
            iPointNext = iPoint + 1; if (iPointNext == points.numberOfItems) iPointNext = 0;
            //console.log("i", iPoint, iPointNext, points.numberOfItems);
            for (var iStep = 0; iStep < iFraction; iStep++) {
                iStep++; // deliberate, for odd steps only as even steps done on prior iteration
                proportionA = iStep / iFraction;
                proportionB = 1 - proportionA;
                //console.log(iPoint, iPointNext, points, points[iPoint], points[iPointNext]);
                pointInter.x = (proportionA * points.getItem(iPoint).x) + (proportionB * points.getItem(iPointNext).x);
                pointInter.y = (proportionA * points.getItem(iPoint).y) + (proportionB * points.getItem(iPointNext).y);
                bIn = sculpt.inside(polygonFixed, pointInter);
                //console.log(pointInter, bIn, "inside");
                if (bIn == bInReq && bPrev != bIn) {
                    console.log(iPower, iPoint, bIn, bInReq, bPrev);
                    if (iPower > 0) {
                        //console.log("inserting", pointInter, iPointNext);
                        polygonSplittable.points.insertItemBefore(pointInter, iPointNext);
                        return iPointNext;
                    }
                    else {
                        //console.log("return", iPoint);
                        return iPoint;
                    }
                }
                bPrev = bIn;
            }
        }
    }
    return null;
};

sculpt.cross = function (pointA, pointB, pointA2, pointB2) {
    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    // Determine the intersection point of two line segments
    // Return FALSE if the lines don't intersect
    //function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    //console.log(pointA, pointB, pointA2, pointB2);
    var x1 = pointA.x;
    var y1 = pointA.y;
    var x2 = pointB.x;
    var y2 = pointB.y;
    var x3 = pointA2.x;
    var y3 = pointA2.y;
    var x4 = pointB2.x;
    var y4 = pointB2.y;
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        console.log("a");
        return false;
    }

    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    // Lines are parallel
    if (denominator === 0) {
        console.log("b");
        return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        console.log("c");
        return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);
    var pt = document.getElementById("svgPen").createSVGPoint();
    pt.x = x; pt.y = y;
    return pt;
};

sculpt.inside = function (polygon, point) {
    return (polygon.isPointInFill(point) || polygon.isPointInStroke(point));
};

sculpt.useDef = function (eUse) {
    var href = eUse.getAttributeNS('http://www.w3.org/1999/xlink', 'href').substring(1);
    var eDef = document.getElementById(href);
    return eDef;
};

sculpt.useDematerialize = function (e) {
    e.parentElement.removeChild(e);
};

sculpt.useMaterialize = function (eUse) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    e.style.fill = "orange";
    var eDef = sculpt.useDef(eUse);
    var matrix = eUse.getScreenCTM();
    var matrix2 = document.getElementById("gWork").getScreenCTM();
    var points = eDef.points;
    for (var iPoint = 0; iPoint < points.numberOfItems; iPoint++) {
        e.points.appendItem(points.getItem(iPoint).matrixTransform(matrix).matrixTransform(matrix2.inverse()));
    }
    document.getElementById("gWork").appendChild(e);
    return e;
};

sculpt.useUpdateDef = function (eDef, eUse, e) {
    var pointsDef = eDef.points;
    var points = e.points;
    pointsDef.clear();
    var matrix = e.getScreenCTM().inverse();
    var matrix2 = document.getElementById("gWork").getScreenCTM();
    var matrix3 = eUse.transform.baseVal[0].matrix.inverse();
    for (var iPoint = 0; iPoint < points.numberOfItems; iPoint++) {
       var point = points.getItem(iPoint).matrixTransform(matrix2).matrixTransform(matrix).matrixTransform(matrix3);
        pointsDef.appendItem(point);
    }
    view.listener("gUpdate2", eDef);
};

sculpt.test = function () {
    util.scriptTest([document.getElementById("svgPen")]);
};

sculpt.test();
/*
 *
        <g id="gWork" class=""><use xlink:href="#g4" transform="translate(20)"></use><use xlink:href="#g5" transform="translate(30,40)"></use>

 <polygon id="t1" points="300,110 350,10 400,110" fill="red" class="" transform="translate(20)"></polygon>
 <polygon id="t2" points="400,110 450,10 500,110" fill="blue" class="" transform="translate(20)"></polygon>
</g>
*/

