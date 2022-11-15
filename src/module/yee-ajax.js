class YeeAjax {
    constructor(element) {
        this.qel = $(element);
        if (this.qel.is('a') || this.qel.is('button')) {
            this.initTag();
        } else if (this.qel.is('form')) {
            this.initForm();
        } else if (this.qel.is(':input')) {
            this.initInput();
        }
        Yee.bindEvent(this.qel, 'before', 'data');
        Yee.bindEvent(this.qel, 'success');
        Yee.bindEvent(this.qel, 'fail');
        Yee.bindEvent(this.qel, 'back');
    }

    initForm() {
        let qel = this.qel;
        let that = this;
        qel.on('submit', function (ev) {
            if (ev.result === false) {
                return false;
            }
            let method = (qel.attr('method') || 'GET').toUpperCase();
            let action = qel.attr('action') || window.location.href;
            if (method == 'GET') {
                let info = Yee.parseUrl(action);
                action = info.path;
            }
            setTimeout(function () {
                let sendData = new FormData(qel.get(0));
                that.send(action, sendData, method);
            }, 50);
            return false;
        });
    }

    initTag() {
        let qel = this.qel;
        let that = this;
        qel.on('click', function (ev) {
            if (ev.result === false) {
                return false;
            }
            let url = qel.data('url') || qel.attr('href');
            let method = qel.data('method') || 'get';
            let info = Yee.parseUrl(url);
            that.send(info.path, info.param, method);
            return false;
        });
    }

    initInput() {
        let qel = this.qel;
        let that = this;
        let recover = qel.data('recover') === void 0 ? true : qel.data('recover');
        let oldVal = qel.val();
        qel.on('focus', function () {
            oldVal = qel.val();
        });
        let event = qel.is('select') ? 'change' : 'blur';
        qel.on(event, function (ev) {
            if (ev.result === false) {
                return false;
            }
            let val = qel.val();
            if (recover) {
                if (val == '') {
                    qel.val(oldVal);
                    return;
                }
                if (val == oldVal) {
                    return;
                }
            }
            let url = qel.data('url');
            let method = qel.data('method') || 'get';
            let info = Yee.parseUrl(url);
            let boxName = qel.attr('name') || '';
            if (boxName) {
                info.param[boxName] = val;
            }
            that.send(info.path, info.param, method);
            return false;
        });
    }

    /**
     * 发送请求
     * @param path
     * @param param
     * @param method
     */
    send(path, param, method) {
        let qel = this.qel;
        if (qel.is('.disabled') || qel.is(':disabled')) {
            return false;
        }
        let info = {
            path: path,
            param: param,
            method: method
        };
        let carry = qel.data('carry') || '';
        Yee.carryData(carry, info.param);
        if (qel.emit('before', info) === false) {
            return false;
        }
        let backUrl = qel.data('back-url') || '';
        let loadTimeout = qel.data('timeout') || 0;
        let index = null;
        if (qel.is('form')) {
            if (backUrl == '' && qel.find(":input[name='__BACK__']").length > 0) {
                backUrl = qel.find(":input[name='__BACK__']").val() || '';
            }
        }
        if (loadTimeout > 0) {
            index = Yee.load(1, {
                shade: [0.1, '#FFF'],
                time: loadTimeout
            });
        }
        let goBack = function (back) {
            if (back == null || back == '') {
                return;
            }
            let a = $('<a style="display: none"><span></span></a>').attr('href', back).appendTo(document.body);
            a.find('span').trigger('click');
            a.remove();
        };
        Yee.fetch(info.path, info.param, info.method).then(function (ret) {
            if (index !== null) {
                Yee.close(index);
                index = null;
            }
            if (!ret) {
                return;
            }
            if (qel.emit('back', ret) === false) {
                return;
            }
            //返回数据结果失败
            if (ret.status === false) {
                //如果是表单
                if (qel.is('form')) {
                    //console.log(ret.formError, typeof (qel.showError));
                    if (ret.formError && typeof (qel.showError) == 'function') {
                        qel.showError(ret.formError);
                    }
                    if (qel.emit('fail', ret) === false) {
                        return;
                    }
                    if (!ret.formError && ret.msg && typeof (ret.msg) === 'string') {
                        Yee.alert(ret.msg, {icon: 7}, function (idx) {
                            Yee.close(idx);
                        });
                        return;
                    }
                } else {
                    if (qel.emit('fail', ret) === false) {
                        return;
                    }
                    if (!(ret.msg && typeof (ret.msg) === 'string')) {
                        return;
                    }
                    if (qel.data('alert') || ret.alert) {
                        Yee.alert(ret.msg, {icon: 7}, function (idx) {
                            Yee.close(idx);
                        });
                        return;
                    } else {
                        Yee.msg(ret.msg, {icon: 0, time: 2000});
                    }
                }
            }
            //成功返回数据
            if (ret.status === true) {
                if (qel.emit('success', ret) === false) {
                    return;
                }
                let back = ret.back || backUrl;
                if (!(ret.msg && typeof (ret.msg) === 'string')) {
                    return goBack(back);
                }
                if (qel.data('alert') || ret.alert) {
                    Yee.alert(ret.msg, {icon: 1}, function (idx) {
                        Yee.close(idx);
                        goBack(back);
                    });
                    return;
                }
                Yee.msg(ret.msg, {icon: 1, time: 1000});
                window.setTimeout(function () {
                    goBack(back);
                }, 1000);
            }
        }).catch(function (e) {
            if (index !== null) {
                Yee.close(index);
                index = null;
            }
            Yee.msg('数据提交超时!', {icon: 0, time: 2000});
            console.error(e);
        });
        return false;
    }
}

export {YeeAjax}