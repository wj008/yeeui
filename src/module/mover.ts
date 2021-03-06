let oldPoint: Point = null;
let moveFunc: Function = null;
let endFunc: Function = null;
let doc = $(document);

let mover = {
    start: function (ev, move, end = null) {
        oldPoint = {left: ev.pageX, top: ev.pageY};
        moveFunc = move;
        endFunc = end;
        ev.stopPropagation();
    }
};

doc.on('mousemove', function (ev) {
    if (oldPoint == null || moveFunc == null) {
        return;
    }
    let newPoint: Point = {left: ev.pageX, top: ev.pageY};
    moveFunc(oldPoint, newPoint);
});

doc.on('mouseup', function (ev) {
    moveFunc = null;
    if (typeof(endFunc) == 'function') {
        endFunc(ev);
    }
    oldPoint = null;
    endFunc = null;
});

export = mover;

