import {Yee} from "../yee";

export class YeeConfirm {

    private readonly setting: { [p: string]: any } = null;
    private readonly qel: any = null;
    private confirmPrevent = true;

    public constructor(elem, setting) {
        this.setting = setting;
        let qel = this.qel = $(elem);
        let that = this;
        if (qel.is('form')) {
            let currentListener = qel[0].onsubmit;
            if (currentListener) {
                qel.on('submit', function (e) {
                    return currentListener.call(this, e.originalEvent);
                });
                qel[0].onsubmit = null;
            }
            qel.on('submit', function (ev) {
                if (qel.is('.disabled') || qel.is(':disabled')) {
                    return false;
                }
                // @ts-ignore
                if (qel.emit('confirm_before') === false) {
                    return false;
                }
                return that.confirm(ev);
            });
            // @ts-ignore
            let typeEvents = ($._data(qel[0], "events") || qel.data("events")).submit;
            typeEvents.unshift(typeEvents.pop());

        } else {
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
                // @ts-ignore
                if (qel.emit('confirm_before') === false) {
                    return false;
                }
                let ret = that.confirm(ev);
                return ret;
            });
            // @ts-ignore
            let typeEvents = ($._data(qel[0], "events") || qel.data("events")).click;
            typeEvents.unshift(typeEvents.pop());
        }
    }

    private send(opt, callback) {
        let args = Yee.parseUrl(opt.url);
        args.path = args.path || window.location.pathname;
        $.ajax({
            type: opt.method,
            url: args.path,
            data: args.param,
            cache: false,
            dataType: 'json',
            success: function (ret) {
                if (ret.status == false) {
                    if (ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 0, time: 3000});
                    }
                    return;
                }
                //拉取数据成功
                if (ret.status && ret.confirm) {
                    callback(ret.confirm);
                }
                else if (ret.status && ret.msg) {
                    callback(ret.msg);
                }
                else {
                    callback();
                }
            }
        });
    }

    private redo(idx) {
        this.confirmPrevent = false;
        let eql = this.qel;
        if (eql.is('a')) {
            let p = $('<p style="display: none"></p>').appendTo(eql);
            p.trigger('click');
            p.remove();
        }
        else if (eql.is('form')) {
            eql.trigger('submit');
        }
        else {
            eql.trigger('click');
        }
        this.confirmPrevent = true;
        if (idx) {
            Yee.close(idx);
        }
    }

    private confirm(ev) {
        let that = this;
        if (!this.confirmPrevent) {
            if (ev.result === false) {
                return false;
            }
            return true;
        }
        ev.stopImmediatePropagation();
        let url = this.setting['url'] || '';
        let method = this.setting['method'] || 'get';
        let msg = this.setting['msg'] || '询问对话框';
        let title = this.setting['title'] || '询问对话框';
        if (!msg && !url) {
            return true;
        }
        if (!url) {
            Yee.confirm(msg, {title: title}, function (idx) {
                that.redo(idx);
            });
        } else {
            that.send({url: url, method: method}, function (text) {
                text = text || msg;
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