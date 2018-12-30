"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeDialog {
    constructor(elem = null) {
        let qel = $(elem);
        if (qel.attr('on-success')) {
            let code = qel.attr('on-success');
            let func = new Function('ev', 'ret', code);
            // @ts-ignore
            qel.on('success', func);
        }
        if (qel.attr('on-fail')) {
            let code = qel.attr('on-fail');
            let func = new Function('ev', 'ret', code);
            // @ts-ignore
            qel.on('fail', func);
        }
        if (qel.attr('on-close')) {
            let code = qel.attr('on-close');
            let func = new Function('ev', 'ret', code);
            // @ts-ignore
            qel.on('closeDialog', func);
        }
        if (qel.attr('on-open')) {
            let code = qel.attr('on-open');
            let func = new Function('ev', code);
            // @ts-ignore
            qel.on('openDialog', func);
        }
        qel.on('click', function (ev) {
            let qel = $(this);
            if (qel.is('.disabled') || qel.is(':disabled')) {
                return false;
            }
            let ret = qel.triggerHandler('openDialog');
            if (ret === false) {
                return false;
            }
            let setting = yee_1.Yee.getElemData(qel, 'Dialog');
            setting = $.extend({ height: 720, width: 1060 }, setting);
            let url = setting.url || qel.attr('href');
            let title = qel.attr('title') || '网页对话框';
            yee_1.Yee.dialog(url, title, setting, window, qel);
            ev.preventDefault();
            return false;
        });
    }
    static open(url, title = '网页对话框', setting = {}, callWindow = window, elem = null) {
        setting.width = setting.width || 1060;
        setting.height = setting.height || 720;
        let winW = $(window).width() - 20;
        let winH = $(window).height() - 20;
        setting.width = setting.width > winW ? winW : setting.width;
        setting.height = setting.height > winH ? winH : setting.height;
        //携带输入框
        if (setting['carry']) {
            let along = $(setting['carry']);
            if (along.length > 0) {
                let args = yee_1.Yee.parseUrl(url);
                args.path = args.path || window.location.pathname;
                setting.path = args.path;
                along.each(function (idx, el) {
                    let qel = $(el);
                    if (!qel.is(':input')) {
                        return;
                    }
                    let name = qel.attr('name') || qel.attr('id') || '';
                    if (name == '') {
                        return;
                    }
                    let val = qel.val() || '';
                    if (qel.is(':radio')) {
                        let name2 = qel.attr('name');
                        let form = qel.parents('form:first');
                        let box = form.find(':radio[name="' + name2 + '"]:checked');
                        val = box.val() || '';
                    }
                    if (qel.is(':checkbox')) {
                        val = qel.is(':checked') ? qel.val() : '';
                    }
                    args.param[name] = val;
                });
                url = yee_1.Yee.toUrl(args);
            }
        }
        let dialogWindow = null;
        let iframe = null;
        let layIndex = layer.open({
            type: 2,
            title: title,
            area: [setting.width + 'px', setting.height + 'px'],
            maxmin: setting.maxmin === void 0 ? true : setting.maxmin,
            content: url,
            //关闭触发消息
            end: function () {
                let data = null;
                if (dialogWindow && dialogWindow.returnValue !== void 0) {
                    data = dialogWindow.returnValue;
                }
                if (elem) {
                    // @ts-ignore
                    elem.emit('closeDialog', data);
                }
                // @ts-ignore 给原来的窗口发送一个消息
                if (callWindow.Yee) {
                    // @ts-ignore
                    callWindow.Yee.emit('closeDialog', data);
                }
                if (iframe != null) {
                    iframe.remove();
                    iframe = null;
                }
            },
            success: function (layero, index) {
                dialogWindow = null;
                iframe = layero.find('iframe');
                if (iframe.length > 0) {
                    let winName = iframe[0].name;
                    dialogWindow = window[winName];
                }
                if (dialogWindow) {
                    if (!(dialogWindow.document.title === null || dialogWindow.document.title === '')) {
                        layer.title(dialogWindow.document.title, index);
                    }
                    let handle = {
                        emitParent(event, ...data) {
                            // @ts-ignore
                            if (callWindow.Yee) {
                                // @ts-ignore
                                callWindow.Yee.emit(event, ...data);
                            }
                        },
                        emit(event, ...data) {
                            if (elem) {
                                // @ts-ignore
                                elem.emit(event, ...data);
                            }
                        },
                        success(...data) {
                            if (elem) {
                                // @ts-ignore
                                elem.emit('success', ...data);
                            }
                        },
                        fail(...data) {
                            if (elem) {
                                // @ts-ignore
                                elem.emit('fail', ...data);
                            }
                        },
                        close() {
                            layer.close(layIndex);
                        },
                        assign: setting.assign || null,
                        callWindow: callWindow,
                        elem: elem,
                        index: index,
                        layer: layer
                    };
                    dialogWindow.dialogHandle = handle;
                }
            }
        });
        return layIndex;
    }
    /**
     * 异步获得句柄
     */
    static dialogHandle() {
        let deferred = $.Deferred();
        let getHandle = function () {
            if (window['dialogHandle']) {
                return deferred.resolve(window['dialogHandle']);
            }
            setTimeout(getHandle, 1);
        };
        getHandle();
        return deferred;
    }
}
YeeDialog.readyFunc = [];
exports.YeeDialog = YeeDialog;
//# sourceMappingURL=yee-dialog.js.map