(function ($, Yee) {
    Yee.extend(':input,button,form,a', 'confirm', function (element, option) {
        var qem = $(element);
        var confirmPrevent = true;

        function send(opt, callback) {
            var args = Yee.parseUrl(opt.url);
            args.path = args.path || window.location.pathname;
            $.ajax({
                type: opt.method,
                url: args.path,
                data: args.prams,
                cache: false,
                dataType: 'json',
                success: function (ret) {
                    if (ret.status == false) {
                        if (ret.error && typeof (ret.error) === 'string') {
                            Yee.msg(ret.error, {icon: 0, time: 3000});
                        }
                        return;
                    }
                    //拉取数据成功
                    if (ret.status && ret.confirm) {
                        callback(ret.confirm);
                    }
                    else if (ret.status && ret.message) {
                        callback(ret.message);
                    }
                    else {
                        callback();
                    }
                }
            });
        }

        //重新触发
        function redo(idx) {
            confirmPrevent = false;
            if (qem.is('a')) {
                var p = $('<p style="display: none"></p>').appendTo(qem);
                p.trigger('click');
                p.remove();
            }
            else if (qem.is('form')) {
                qem.trigger('submit');
            }
            else {
                qem.trigger('click');
            }
            confirmPrevent = true;
            if (idx) {
                Yee.close(idx);
            }
        }

        function confirm(ev) {
            if (!confirmPrevent) {
                return true;
            }
            ev.stopImmediatePropagation();

            var url = qem.data('confirm@url') || option['url'] || '';
            var method = qem.data('confirm@method') || option['method'] || 'get';
            var msg = qem.data('confirm@msg') || option['msg'] || '';
            var title = qem.data('confirm@title') || option['title'] || '询问对话框';

            if (!msg && !url) {
                return true;
            }
            if (!url) {
                Yee.confirm(msg, {title: title}, function (idx) {
                    redo(idx);
                });
            } else {
                send({url: url, method: method}, function (text) {
                    var text = text || msg;
                    if (text == null || text == '') {
                        redo(0);
                    } else {
                        Yee.confirm(text, {title: title}, function (idx) {
                            redo(idx);
                        });
                    }
                });
            }
            return false;
        }

        if (qem.is('form')) {
            var currentListener = qem[0].onsubmit;
            if (currentListener) {
                qem.on('submit', function (e) {
                    return currentListener.call(this, e.originalEvent);
                });
                qem[0].onsubmit = null;
            }
            qem.on('submit', function (ev) {
                if (qem.is('.disabled') || qem.is(':disabled')) {
                    return false;
                }
                if (qem.triggerHandler('before_confirm') === false) {
                    return false;
                }
                return confirm(ev, this);
            });
            var typeEvents = ($._data(qem[0], "events") || qem.data("events")).submit;
            typeEvents.unshift(typeEvents.pop());
        } else {
            var currentListener = qem[0].onclick;
            if (currentListener) {
                qem.on('click', function (e) {
                    return currentListener.call(this, e.originalEvent);
                });
                qem[0].onclick = null;
            }
            qem.on('click', function (ev) {
                if (qem.is('.disabled') || qem.is(':disabled')) {
                    return false;
                }
                if (qem.triggerHandler('before_confirm') === false) {
                    return false;
                }
                return confirm(ev);
            });
            var typeEvents = ($._data(qem[0], "events") || qem.data("events")).click;
            typeEvents.unshift(typeEvents.pop());
        }
    });
})(jQuery, Yee);