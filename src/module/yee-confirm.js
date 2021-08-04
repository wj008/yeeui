class YeeConfirm {
    constructor(elem) {
        this.qel = null;
        this.confirmPrevent = true;
        let qel = this.qel = $(elem);
        if (qel.is('form')) {
            this.initForm();
        } else {
            this.initTag();
        }
    }

    initForm() {
        let qel = this.qel;
        let that = this;
        let currentListener = qel[0].onsubmit;
        if (currentListener) {
            qel.on('submit', function (e) {
                return currentListener.call(this, e.originalEvent);
            });
            qel[0].onsubmit = null;
        }
        let submitFunc = function (ev) {
            if (qel.is('.disabled') || qel.is(':disabled')) {
                return false;
            }
            if (qel.emit('confirmBefore') === false) {
                return false;
            }
            return that.confirm(ev);
        };
        if (qel.data('once')) {
            qel.one('submit', submitFunc);
        } else {
            qel.on('submit', submitFunc);
        }
        // @ts-ignore
        let typeEvents = ($._data(qel[0], "events") || qel.data("events")).submit;
        typeEvents.unshift(typeEvents.pop());
    }

    initTag() {
        let qel = this.qel;
        let that = this;
        let currentListener = qel[0].onclick;
        if (currentListener) {
            qel.on('click', function (e) {
                return currentListener.call(this, e.originalEvent);
            });
            qel[0].onclick = null;
        }
        qel.on('click', function (ev) {
            if (qel.is('.disabled') || qel.is(':disabled')) {
                return false;
            }
            if (qel.emit('confirmBefore') === false) {
                return false;
            }
            let ret = that.confirm(ev);
            return ret;
        });
        // @ts-ignore
        let typeEvents = ($._data(qel[0], "events") || qel.data("events")).click;
        typeEvents.unshift(typeEvents.pop());
    }

    send(opt, callback) {
        let args = Yee.parseUrl(opt.url);
        args.path = args.path || window.location.pathname;
        Yee.fetch(args.path, args.param, opt.method).then(function (ret) {
            if (ret.status == false) {
                if (ret.msg && typeof (ret.msg) === 'string') {
                    Yee.msg(ret.msg, {icon: 0, time: 3000});
                }
                return;
            }
            if (ret.status && ret.confirm) {
                callback(ret.confirm);
            } else if (ret.status && ret.msg) {
                callback(ret.msg);
            } else {
                callback();
            }
        });
    }

    redo(idx) {
        this.confirmPrevent = false;
        let qel = this.qel;
        if (qel.is('a')) {
            let p = $('<p style="display: none"></p>').appendTo(qel);
            p.trigger('click');
            p.remove();
        } else if (qel.is('form')) {
            qel.trigger('submit');
        } else {
            qel.trigger('click');
        }
        this.confirmPrevent = true;
        if (idx) {
            Yee.close(idx);
        }
    }

    confirm(ev) {
        let qel = this.qel;
        let that = this;
        if (!this.confirmPrevent || qel.data('confirm-close') || false) {
            if (ev.result === false) {
                return false;
            }
            return true;
        }
        ev.stopImmediatePropagation();
        let url = qel.data('confirm-url') || '';
        let method = qel.data('confirm-method') || 'get';
        let message = qel.data('confirm') || '询问对话框';
        let title = qel.data('title') || '询问对话框';
        if (!message && !url) {
            return true;
        }
        if (!url) {
            Yee.confirm(message, {title: title}, function (idx) {
                that.redo(idx);
            });
        } else {
            that.send({url: url, method: method}, function (ret) {
                let text = ret.msg || message;
                if (text == null || text == '') {
                    that.redo(0);
                } else {
                    Yee.confirm(text, {title: title}, function (idx) {
                        that.redo(idx);
                    });
                }
            });
        }
        return false;
    }
}

export {YeeConfirm}