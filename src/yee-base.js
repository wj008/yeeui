import {YeeDialog} from "./module/yee-dialog";
import {YeeDynamic} from "./module/yee-dynamic";

class YeeBase {
    /**
     * 获取最大Z层
     */
    static maxZIndex() {
        let items = document.all ? document.all : document.body.querySelectorAll('*');
        let arr = Array.from(items).map(e => +window.getComputedStyle(e).zIndex || 0);
        return arr.length ? Math.max(...arr) : 0;
    }

    /**
     * 判断是否对象
     * @param val
     */
    static isObject(val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    }

    /**
     * 判断是否数组
     * @param obj
     */
    static isArray(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }

    /**
     * 随机字符串
     * @param len
     */
    static randomString(len = 4) {
        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        let maxPos = chars.length;
        let run = '';
        for (let i = 0; i < len; i++) {
            run += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return run;
    }

    /**
     * 解析json
     * @param data
     * @param def
     */
    static parseJson(data, def = []) {
        if (YeeBase.isArray(data) || YeeBase.isObject(data)) {
            return data;
        }
        let items = def;
        if (data !== '' && data !== 'null') {
            try {
                items = JSON.parse(data);
            } catch (e) {
                return def;
            }
        }
        return items;
    }

    /**
     * 解析url
     * @param url
     */
    static parseUrl(url = '') {
        let hash = '';
        let query = url;
        let path = query;
        let hIdx = query.search(/#/);
        if (hIdx >= 0) {
            query = query.substring(0, hIdx);
            hash = query.substring(hIdx);
        }
        query = query.replace(/&+$/, '');
        let param = {};
        let idx = query.search(/\?/);
        if (idx >= 0) {
            path = query.substring(0, idx);
            let str = query.substring(idx);
            let m = str.match(/(\w+)(=([^&]*))?/g);
            if (m) {
                $(m).each(function (index, str) {
                    let ma = String(str).match(/^(\w+)(?:=([^&]*))?$/);
                    if (ma) {
                        let val = ma[2] || '';
                        param[ma[1]] = decodeURIComponent(val.replace(/\+/g, '%20'));
                    }
                });
            }
        }
        return {path: path, param: param, hash: hash};
    }

    /**
     *  转换格式
     * @param info
     */
    static toUrl(info = {}) {
        let path = info.path || window.location.pathname;
        let param = info.param || {};
        let query = [];
        for (let key in param) {
            if (param[key] == null || param[key] == '') {
                query.push(key + '=');
                continue;
            }
            let values = (param[key] + '').split(' ');
            for (let i = 0; i < values.length; i++) {
                values[i] = encodeURIComponent(values[i]);
            }
            query.push(key + '=' + values.join("%20"));
        }
        if (query.length == 0) {
            return path + (info.hash || '');
        }
        return path + '?' + query.join('&') + (info.hash || '');
    }

    /**
     * URL路径处理
     * @param base
     * @param param
     */
    static url(base, param = {}) {
        let info = YeeBase.parseUrl(base);
        for (let key in param) {
            info.param[key] = param[key];
        }
        return YeeBase.toUrl(info);
    }

    /**
     * 获取文件信息
     * @param file
     */
    static getFileInfo(file) {
        let path = file.name.toString();
        let extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
        return {path: path, extension: extension};
    }

    /**
     * 获取文件后缀
     * @param url
     */
    static getFileExtension(url) {
        return url.lastIndexOf('.') === -1 ? '' : url.substr(url.lastIndexOf('.') + 1, url.length).toLowerCase();
    }

    /**
     *  等比图片容器
     * @param url
     * @param width
     * @param height
     */
    static createEqualRatioImage(url, width, height) {
        return new Promise(function (resolve, reject) {
            let imgTemp = new Image();
            imgTemp.onload = function () {
                let w = imgTemp.width;
                let h = imgTemp.height;
                if (w > width) {
                    h = h * (width / w);
                    w = width;
                }
                if (h > height) {
                    w = w * (height / h);
                    h = height;
                }
                imgTemp.width = w;
                imgTemp.height = h;
                let table = $('<div style="display: table-cell; text-align: center; vertical-align: middle; overflow: hidden; line-height: 0px;"></div>');
                table.width(width);
                table.height(height);
                table.append(imgTemp);
                resolve(table);
            };
            imgTemp.src = url;
        });
    }

    /**
     * 携带参数
     * @param names
     * @param param
     */
    static carryData(names, param, form) {
        if (names == '') {
            return;
        }
        let items = [];
        if (form === void 0) {
            form = $(document.body);
        }

        function in_array(search, array) {
            for (let i in array) {
                if (array[i] == search) {
                    return true;
                }
            }
            return false;
        }

        function add(name, val) {
            if (param instanceof FormData) {
                if (param.has(name)) {
                    param.delete(name);
                }
                param.append(name, val);
            } else {
                param[name] = val;
            }
        }

        if (/^[a-zA-Z\[\]0-9_,]+$/.test(names)) {
            items = names.split(',');
        } else {
            $(names).each(function (idx, element) {
                let elem = form.find(element);
                if (elem.is(':input')) {
                    let name = elem.attr('name') || '';
                    if (name != '' && in_array(name, items)) {
                        items.push(name);
                    }
                }
            });
        }
        let urlInfo = YeeBase.parseUrl(window.location.search);
        for (let name of items) {
            let inp = form.find(":input[name='" + name + "']");
            if (inp.length == 0) {
                if (urlInfo.param[name] !== void 0) {
                    add(name, urlInfo.param[name]);
                }
                continue;
            }
            inp.each(function (idx, el) {
                let box = $(el);
                if (box.is(':radio')) {
                    let form = box.parents('form:first');
                    box = form.find(':radio[name="' + name + '"]:checked');
                    if (box.length == 0) {
                        return;
                    }
                }
                if (box.is(':checkbox')) {
                    if (!box.is(':checked')) {
                        return;
                    }
                }
                let val = String(inp.val() || '');
                add(name, val);
            });
        }
    }

    /**
     * 绑定事件
     * @param qel
     */
    static bindEvent(qel, type, rt = 'ret') {
        if (qel.attr('on-' + type)) {
            let code = qel.attr('on-' + type);
            let func = new Function('ev', rt, code);
            qel.on(type, func);
        }
    }

    /**
     * 请求数据
     * @param path
     * @param param
     * @param method
     */
    static fetch(path, param, method = 'get') {
        return new Promise(function (resolve, reject) {
            method = method.toUpperCase();
            let query = [];
            let url = path;
            let useForm = method == 'POST' || method == 'PUT';
            if (!useForm) {
                if (param instanceof FormData) {
                    param.forEach(function (value, key, parent) {
                        query.push(key + '=' + encodeURIComponent(value.toString()));
                    });
                } else {
                    for (let key in param) {
                        query.push(key + '=' + encodeURIComponent(param[key].toString()));
                    }
                }
            }
            if (window.fetch) {
                let option = {
                    method: method,
                    headers: {
                        'x-requested-with': 'fetch'
                    },
                };
                if (useForm) {
                    if (param instanceof FormData) {
                        option.body = param;
                    } else {
                        option.body = new FormData();
                        for (let key in param) {
                            option.body.append(key, param[key]);
                        }
                    }
                } else {
                    if (query.length > 0) {
                        url = path + '?' + query.join('&');
                    }
                }
                fetch(url, option).then(function (res) {
                    resolve(res.json());
                }).catch(function (err) {
                    reject(err);
                });
                return;
            }
            $.ajax({
                type: method,
                url: path,
                data: useForm ? param : query.join('&'),
                dataType: 'json',
                contentType: false,
                processData: false,
                success: function (ret) {
                    resolve(ret);
                },
                error: function (xhr) {
                    reject('数据提交超时');
                }
            });
        });
    }

    // 接管弹出层++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    static alert(msg, option = null, func = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].alert(msg, option, func);
        }
        if (YeeBase.isMobile) {
            let data = {content: msg, btn: '确定'};
            if (typeof func == 'function') {
                data['yes'] = func;
            }
            return layer.open(data);
        }
        return layer.alert(msg, option, func);
    }

    static confirm(msg, option, yesFunc = null, noFunc = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].confirm(msg, option, yesFunc, noFunc);
        }
        if (YeeBase.isMobile) {
            let data = {content: msg, btn: ['确认', '取消']};
            if (typeof option == 'function') {
                noFunc = yesFunc;
                yesFunc = option;
            }
            if (typeof yesFunc == 'function') {
                data['yes'] = yesFunc;
            }
            if (typeof noFunc == 'function') {
                data['no'] = noFunc;
            }
            return layer.open(data);
        }
        return layer.confirm(msg, option, yesFunc, noFunc);
    }

    static msg(msg, option = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].msg(msg, option);
        }
        if (YeeBase.isMobile) {
            let data = {content: msg, skin: 'msg'};
            if (option && option.time) {
                data['time'] = Math.round(option.time / 1000);
            } else {
                data['time'] = 1;
            }
            return layer.open(data);
        }
        if (option && !option['time']) {
            option['time'] = 1000;
        } else if (!option) {
            option = {'time': 1000};
        }
        return layer.msg(msg, option);
    }

    static load(type, option = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].load(type, option);
        }
        if (YeeBase.isMobile) {
            return layer.open({type: 2});
        }
        return layer.load(type, option);
    }

    static close(index) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].close(index);
        }
        return layer.close(index);
    }

    static closeAll(type = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].closeAll(type);
        }
        if (YeeBase.isMobile) {
            return layer.closeAll();
        }
        return layer.closeAll(type);
    }

    //处理对话框++++++++++++++
    static dialog(url, setting = {}, qel = null, callWindow = window) {
        setting = setting === null ? {} : setting;
        callWindow = callWindow === null ? window : callWindow;
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].dialog(url, setting, qel, window);
        }
        return YeeDialog.open(url, setting, qel, callWindow);
    }

    static readyDialog(func) {
        YeeDialog.dialogHandle().then(func);
    }

    static closeDialog(data = null) {
        YeeBase.readyDialog(function (dialog) {
            if (data !== null) {
                dialog.success(data);
            }
            dialog.close();
        });
    }

    //本地存储++++++++++++++
    static _readCookie(s) {
        if (s.indexOf('"') === 0) {
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            s = decodeURIComponent(s.replace(/\+/g, ' '));
            return s;
        } catch (e) {
        }
    }

    static setCookie(key, value, options) {
        if (typeof (options.expires) == 'number') {
            let days = options.expires;
            let t = options.expires = new Date();
            t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
        }
        return (document.cookie = [
            encodeURIComponent(key), '=', encodeURIComponent(String(value)),
            options.expires ? '; expires=' + options.expires.toUTCString() : '',
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    static getCookie(key) {
        let result = key ? undefined : {}, cookies = document.cookie ? document.cookie.split('; ') : [], i = 0,
            l = cookies.length;
        for (; i < l; i++) {
            let parts = cookies[i].split('='), name = decodeURIComponent(parts.shift()), cookie = parts.join('=');
            if (key === name) {
                result = YeeBase._readCookie(cookie);
                break;
            }
            if (!key && (cookie = YeeBase._readCookie(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }
        return result;
    }

    static delCoolie(key) {
        YeeBase.setCookie(key, '', {expires: -1});
    }

    static setStorage(key, value) {
        if (window.localStorage) {
            return window.localStorage.setItem(key, value);
        }
        return YeeBase.setCookie(key, value, {expires: 1});
    }

    static getStorage(key) {
        if (window.localStorage) {
            return window.localStorage.getItem(key);
        }
        return YeeBase.getCookie(key);
    }

    static deleteStorage(key) {
        if (window.localStorage) {
            return window.localStorage.removeItem(key);
        }
        return YeeBase.delCoolie(key);
    }

    static dynamic(type, names) {
        YeeDynamic.dynamic(type, names);
    }
}

//文件当前路径
YeeBase.isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
export {YeeBase}
