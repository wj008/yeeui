class YeeDialog {
    constructor(elem = null) {
        let qel = $(elem);
        Yee.bindEvent(qel, 'openDialog', 'data');
        Yee.bindEvent(qel, 'success');
        Yee.bindEvent(qel, 'fail');
        Yee.bindEvent(qel, 'closeDialog');
        qel.on('click', function (ev) {
            let qel = $(this);
            if (qel.is('.disabled') || qel.is(':disabled')) {
                return false;
            }
            let url = qel.data('url') || qel.attr('href');
            let title = qel.attr('title') || '网页对话框';
            let carry = qel.data('carry') || '';
            let info = Yee.parseUrl(url);
            Yee.carryData(carry, info.param);
            // @ts-ignore

            if (qel.emit('openDialog', info) === false) {
                return false;
            }
            url = Yee.toUrl(info);
            let setting = qel.data();
            Yee.dialog(url, setting, qel, window);
            ev.preventDefault();
            return false;
        });
    }

    static open(url, setting = {}, elem = null, callWindow = window) {
        setting.width = setting.width || 1060;
        setting.height = setting.height || 720;
        let winW = $(window).width() - 20;
        let winH = $(window).height() - 20;
        setting.width = setting.width > winW ? winW : setting.width;
        setting.height = setting.height > winH ? winH : setting.height;
        setting.autoSize = setting.autoSize === void 0 ? false : setting.autoSize;
        setting.anim = setting.anim === void 0 ? 0 : setting.anim;
        let dialogWindow = null;
        let iframe = null;
        let state = 'restore';
        let windowHeight = 0;
        let timer = null;
        let layIndex = layer.open({
            type: 2,
            title: setting.hideTitle ? false : (setting.title || '网页对话框'),
            shade: setting.shade === void 0 ? 0.5 : setting.shade,
            shadeClose: setting.shadeClose === void 0 ? false : setting.shadeClose,
            anim: setting.anim,
            area: [setting.width + 'px', setting.height + 'px'],
            maxmin: setting.maxmin === void 0 ? true : setting.maxmin,
            content: url, //关闭触发消息
            end: function () {
                let data = null;
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                if (dialogWindow && dialogWindow.returnValue !== void 0) {
                    data = dialogWindow.returnValue;
                }
                if (typeof elem == 'function') {
                    elem.call(null, 'closeDialog', data);
                } else if (elem) {
                    // @ts-ignore
                    elem.emit('closeDialog', data);
                }
                if (iframe != null) {
                    iframe.remove();
                    iframe = null;
                }
            },
            full: function () {
                state = 'full';
                if (iframe) {
                    iframe.css('height', '100%');
                }
            },
            min: function () {
                state = 'min';
            },
            restore: function () {
                state = 'restore';
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
                    if (setting.autoSize && dialogWindow.document.body) {
                        dialogWindow.document.body.style.overflowY = 'hidden';
                        timer = window.setInterval(function () {
                            let body = dialogWindow.document.body;
                            if (!body) {
                                if (timer) {
                                    window.clearInterval(timer);
                                    timer = null;
                                }
                                return;
                            }
                            let height = body.clientHeight;
                            if (height != windowHeight) {
                                windowHeight = height;
                                if (state == 'restore') {
                                    layer.iframeAuto(index);
                                }
                            }
                        }, 50);
                    } else {
                        if (iframe) {
                            timer = window.setInterval(function () {
                                if (iframe == null) {
                                    window.clearInterval(timer);
                                    return;
                                }
                                iframe.css({height: '100%'});
                            }, 10);
                        }
                    }
                    let handle = {
                        emit(event, ...data) {
                            if (typeof elem == 'function') {
                                elem.call(null, event, ...data);
                            } else if (elem) {
                                // @ts-ignore
                                elem.emit(event, ...data);
                            }
                        }, success(...data) {
                            if (typeof elem == 'function') {
                                elem.call(null, 'success', ...data);
                            } else if (elem) {
                                // @ts-ignore
                                elem.emit('success', ...data);
                            }
                        }, fail(...data) {
                            if (typeof elem == 'function') {
                                elem.call(null, 'fail', ...data);
                            } else if (elem) {
                                // @ts-ignore
                                elem.emit('fail', ...data);
                            }
                        }, close() {
                            layer.close(layIndex);
                        }, state() {
                            return state;
                        }, iframeAuto() {
                            if (state == 'restore') {
                                layer.iframeAuto(index);
                            }
                        }, assign: setting.assign || null, callWindow: callWindow, elem: elem, index: index, layer: layer
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
        return new Promise(function (resolve) {
            let getHandle = function () {
                if (window['dialogHandle']) {
                    return resolve(window['dialogHandle']);
                }
                setTimeout(getHandle, 1);
            };
            getHandle();
        });
    }
}

export {YeeDialog}
