(function ($, Yee) {
    if (window.top === window) {
        var isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
        //弹出框
        Yee.alert = function (msg, option, func) {
            if (isMobile) {
                var data = {
                    content: msg
                    , btn: '确定'
                }
                if (typeof func == 'function') {
                    data['yes'] = func;
                }
                return layer.open(data);
            }
            return layer.alert(msg, option, func);
        };
        //询问框
        Yee.confirm = function (msg, option, yesfunc, nofunc) {
            if (isMobile) {
                var data = {
                    content: msg
                    , btn: ['确认', '取消']
                }
                if (typeof option == 'function') {
                    nofunc = yesfunc;
                    yesfunc = option;
                }
                if (typeof yesfunc == 'function') {
                    data['yes'] = yesfunc;
                }
                if (typeof nofunc == 'function') {
                    data['no'] = nofunc;
                }
                return layer.open(data);
            }
            return layer.confirm(msg, option, yesfunc, nofunc);
        }
        //信息框
        Yee.msg = function (msg, option) {
            if (isMobile) {
                var data = {
                    content: msg
                    , skin: 'msg'
                }
                if (option && option.time) {
                    data['time'] = Math.round(option.time / 1000);
                } else {
                    data['time'] = 1;
                }
                return layer.open(data);
            }
            if (option && !option['time']) {
                option['time'] = 1000;
            } else {
                option = {'time': 1000};
            }
            return layer.msg(msg, option);
        }
        //加载层
        Yee.load = function (type, option) {
            if (isMobile) {
                return layer.open({type: 2});
            }
            return layer.load(type, option);
        }
        //关闭弹出层
        Yee.close = function (index) {
            return layer.close(index);
        }
        //关闭所有弹出层
        Yee.closeAll = function (type) {
            if (isMobile) {
                return layer.closeAll();
            }
            return layer.closeAll(type);
        }
    } else {
        Yee.alert = window.top.Yee.alert;
        Yee.confirm = window.top.Yee.confirm;
        Yee.msg = window.top.Yee.msg;
        Yee.load = window.top.Yee.load;
        Yee.close = window.top.Yee.close;
        Yee.closeAll = window.top.Yee.closeAll;
    }
})(jQuery, window.Yee);