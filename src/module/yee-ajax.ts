import {Yee} from "../yee";


export class YeeAjax {
    public static clickTimeout = null;

    private readonly qel;
    private readonly setting;

    public constructor(elem, setting: { [p: string]: any } = {}) {
        let qel = this.qel = $(elem);
        this.setting = setting;
        let that = this;
        //链接
        if (qel.is('a')) {
            qel.on('click', function (ev) {
                if (ev.result === false) {
                    return false;
                }
                let url = setting.url || $(this).attr('href');
                let method = setting.method || 'get';
                let info = Yee.parseUrl(url);
                that.send(info.path, info.param, method);
                return false;
            });
        }
        //表单
        else if (qel.is('form')) {
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
                let sendData = qel.serialize();
                that.send(action, sendData, method);
                return false;
            });
        }
        //输入框
        else if (qel.is(':input')) {
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
                if (val == '') {
                    qel.val(oldVal);
                    return;
                }
                if (val == oldVal) {
                    return;
                }
                let url = setting.url || '';
                let method = setting.method || 'get';
                let info = Yee.parseUrl(url);
                let boxName = qel.attr('name') || '';
                if (boxName) {
                    info.param[boxName] = val;
                }
                that.send(info.path, info.param, method);
                return false;
            });
        }
        //监听事件-------------
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

        if (qel.attr('on-back')) {
            let code = qel.attr('on-back');
            let func = new Function('ev', 'ret', code);
            // @ts-ignore
            qel.on('back', func);
        }

        if (qel.attr('on-before')) {
            let code = qel.attr('on-before');
            let func = new Function('ev', 'option', code);
            // @ts-ignore
            qel.on('before', func);
        }
    }

    public send(path, param, method) {
        //防止误触双击
        if (YeeAjax.clickTimeout) {
            return false;
        }
        YeeAjax.clickTimeout = true;
        setTimeout(function () {
            YeeAjax.clickTimeout = false;
        }, 1000);
        let setting = this.setting;
        let qel = this.qel;
        if (qel.is('.disabled') || qel.is(':disabled')) {
            return false;
        }
        let data = {
            path: path,
            param: param,
            method: method,
            cache: true
        };
        if (setting['carry']) {
            let along = $(setting['carry']);
            if (along.length > 0) {
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
                    data.param[name] = val;
                });
            }
        }
        //提交之前的数据，可能修正
        // @ts-ignore
        if (qel.emit('before', data) === false) {
            return false;
        }
        //表单提交后返回的url
        let backUrl = setting.backUrl || '';
        let loadTimeout = setting.loadTimeout || 0;//提交遮罩超时时间
        let layerIndex = null;
        if (qel.is('form')) {
            //如果是表单 存在 __BACK__ 的字段单作返回url
            if (backUrl == '' && qel.find(":input[name='__BACK__']").length > 0) {
                backUrl = qel.find(":input[name='__BACK__']").val() || '';
            }
        }
        //如果设置遮住时间
        if (loadTimeout > 0) {
            layerIndex = Yee.load(1, {
                shade: [0.1, '#FFF'], //0.1透明度的白色背景
                time: loadTimeout
            });
        }
        //提交数据
        $.ajax({
            type: data.method,
            url: data.path,
            data: data.param,
            cache: data.cache,
            dataType: 'json',
            success: function (ret) {
                //关闭遮住层
                if (layerIndex !== null) {
                    Yee.close(layerIndex);
                    layerIndex = null;
                }
                if (!ret) {
                    return;
                }
                // @ts-ignore
                if (qel.emit('back', ret) === false) {
                    return;
                }
                //失败处理----------
                if (ret.status === false) {
                    //如果是表单
                    if (qel.is('form')) {
                        // @ts-ignore
                        if (ret.formError && typeof (qel.showError) == 'function') {
                            // @ts-ignore
                            qel.showError(ret.formError);
                        }
                        // @ts-ignore
                        if (qel.emit('fail', ret) === false) {
                            return;
                        }
                        if (!ret.formError && ret.msg && typeof (ret.msg) === 'string') {
                            Yee.alert(ret.msg, {icon: 7}, function (idx) {
                                Yee.close(idx);
                            });
                        }
                    } else {
                        // @ts-ignore
                        if (qel.emit('fail', ret) === false) {
                            return;
                        }
                        if (ret.msg && typeof (ret.msg) === 'string') {
                            Yee.msg(ret.msg, {icon: 0, time: 2000});
                        }
                    }
                }
                //拉取数据成功--------
                if (ret.status === true) {
                    // @ts-ignore
                    if (qel.emit('success', ret) === false) {
                        return;
                    }
                    if (ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 1, time: 1000});
                    }
                    if (typeof (ret.back) === 'undefined' && backUrl != '') {
                        ret.back = backUrl;
                    }
                }
                //有跳转的数据---
                if (typeof (ret.back) !== 'undefined' && ret.back !== null) {
                    let goFunc = function () {
                        let a = $('<a style="display: none"><span></span></a>').attr('href', ret.back).appendTo(document.body);
                        a.find('span').trigger('click');
                        a.remove();
                    };
                    if (ret.status === true && ret.msg) {
                        window.setTimeout(goFunc, 1000);
                    } else if (ret.status === false && ret.msg) {
                        window.setTimeout(goFunc, 2000);
                    } else {
                        goFunc();
                    }
                }
            },
            error: function (xhr) {
                if (layerIndex !== null) {
                    Yee.close(layerIndex);
                    layerIndex = null;
                }
                Yee.msg('数据提交超时!', {icon: 0, time: 2000});
            }
        });
        return false;
    };
}

