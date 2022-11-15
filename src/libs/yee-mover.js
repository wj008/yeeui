class YeeMover {
    constructor() {
        let oldPoint = null;
        let moveFunc = null;
        let endFunc = null;
        let doc = $(document);
        doc.on('mousemove', function (ev) {
            if (oldPoint == null || moveFunc == null) {
                return;
            }
            let newPoint = {left: ev.pageX, top: ev.pageY};
            moveFunc(oldPoint, newPoint);
        });
        doc.on('mouseup', function (ev) {
            moveFunc = null;
            if (typeof (endFunc) == 'function') {
                endFunc(ev);
            }
            oldPoint = null;
            endFunc = null;
        });
        this.start = function (ev, move, end = null) {
            oldPoint = {left: ev.pageX, top: ev.pageY};
            moveFunc = move;
            endFunc = end;
            ev.stopPropagation();
        }
    }
}

export {YeeMover}