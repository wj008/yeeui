(function ($, Yee) {

    var clickTimeout = false;
    //AJAX提交连接
    Yee.extend('a,form', 'ajax', function (elem, setting) {

        var qem = $(elem);

        if (qem.attr('onsuccess')) {
            var code = qem.attr('onsuccess');
            var func = new Function('ev', 'ret', code);
            qem.on('success', func);
        }

        if (qem.attr('onfail')) {
            var code = qem.attr('onfail');
            var func = new Function('ev', 'ret', code);
            qem.on('fail', func);
        }

        if (qem.attr('onback')) {
            var code = qem.attr('onback');
            var func = new Function('ev', 'ret', code);
            qem.on('back', func);
        }

        if (qem.attr('onbefore')) {
            var code = qem.attr('onbefore');
            var func = new Function('ev', 'option', code);
            qem.on('before', func);
        }

        var send = function (path, prams, method) {
            //防止误触双击
            if (clickTimeout) {
                return false;
            }
            clickTimeout = true;
            setTimeout(function () {
                clickTimeout = false;
            }, 1000);
            var option = {
                path: path,
                prams: prams,
                method: method,
                cache: true
            };

            if (qem.is('.disabled') || qem.is(':disabled')) {
                return false;
            }
            //提交之前的数据，可能修正
            if (qem.emit('before', option) === false) {
                return false;
            }
            //表单提交后返回的url
            var backUrl = setting('backUrl', '');
            var loadTimeout = setting('loadTimeout', 0);//提交遮罩超时时间

            var layerIndex = null;
            if (qem.is('form')) {
                //如果是表单 存在 __BACK__ 的字段单作返回url
                if (backUrl == '' && qem.find(":input[name='__BACK__']").length > 0) {
                    backUrl = qem.find(":input[name='__BACK__']").val() || '';
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
                type: option.method,
                url: option.path,
                data: option.prams,
                cache: option.cache,
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
                    if (qem.emit('back', ret) === false) {
                        return;
                    }
                    //拉取数据错误
                    if (ret.status === false) {
                        //如果是表单
                        if (qem.is('form')) {
                            if (ret.formError && typeof (qem.showError) == 'function') {
                                qem.showError(ret.formError);
                            }
                            if (qem.emit('fail', ret) === false) {
                                return;
                            }
                            if (!ret.formError && ret.error && typeof (ret.error) === 'string') {
                                Yee.alert(ret.error, {icon: 7}, function (idx) {
                                    Yee.close(idx);
                                });
                            }
                        } else {
                            if (qem.emit('fail', ret) === false) {
                                return;
                            }
                            if (ret.error && typeof (ret.error) === 'string') {
                                Yee.msg(ret.error, {icon: 0, time: 2000});
                            }
                        }
                    }
                    //拉取数据成功
                    if (ret.status === true) {
                        if (qem.emit('success', ret) === false) {
                            return;
                        }
                        if (ret.message && typeof (ret.message) === 'string') {
                            Yee.msg(ret.message, {icon: 1, time: 1000});
                        }
                        if (typeof (ret.jump) === 'undefined' && backUrl != '') {
                            ret.jump = backUrl;
                        }
                    }
                    //有跳转的数据
                    if (typeof (ret.jump) !== 'undefined' && ret.jump !== null) {
                        var goFunc = function () {
                            var a = $('<a style="display: none"><span></span></a>').attr('href', ret.jump).appendTo(document.body);
                            a.find('span').trigger('click');
                            a.remove();
                        };
                        if (ret.status === true && ret.message) {
                            window.setTimeout(goFunc, 1000);
                        } else if (ret.status === false && ret.error) {
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
        if (qem.is('a')) {
            qem.on('click', function (ev) {
                if (ev.result === false) {
                    return false;
                }
                var url = setting('url', $(this).attr('href'));
                var method = setting('method', 'get');
                var info = Yee.parseUrl(url);
                send(info.path, info.prams, method);
                return false;
            });
        }
        if (qem.is('form')) {
            qem.on('submit', function (ev) {
                if (ev.result === false) {
                    return false;
                }
                var method = (qem.attr('method') || 'GET').toUpperCase();
                var action = qem.attr('action') || window.location.href;
                if (method == 'GET') {
                    var info = Yee.parseUrl(action);
                    action = info.path;
                }
                var sendData = qem.serialize();
                send(action, sendData, method);
                return false;
            });
        }

    });

})(jQuery, Yee);