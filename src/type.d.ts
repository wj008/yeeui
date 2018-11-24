declare type DialogHandle = {
    emitParent: Function,
    emit: Function,
    success: Function,
    fail: Function,
    close: Function,
    assign: any,
    callWindow: any,
    elem: any
};
declare type Point = { left: number, top: number };