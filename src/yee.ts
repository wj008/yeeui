import {YeeAjax} from "./module/yee-ajax";
import {YeeConfirm} from "./module/yee-confirm";
import {YeeValidate} from "./module/yee-validate";
import {YeeRemote} from "./module/yee-remote";
import {YeeUpload} from "./module/yee-upload";
import {YeeInteger, YeeNumber} from "./module/yee-number";
import {YeePicker} from "./module/yee-picker";
import {YeeEvent} from "./module/yee-event";
import {YeeDialog} from "./module/yee-dialog";
import {YeeLinkage} from "./module/yee-linkage";
import {YeeDatatable} from "./module/yee-datatable";
import {YeePagebar} from "./module/yee-pagebar";
import {YeeSearchForm} from "./module/yee-search-form";
import {YeeSelectDialog} from "./module/yee-select-dialog";
import {YeeCombine} from "./module/yee-combine";
import {YeeFormTab} from "./module/yee-form-tab";
import {YeeDynamic} from "./module/yee-dynamic";
import {YeeXheditor} from "./module/yee-xheditor";

export class Yee {

    public static version = '1.0.0';

    private static _extendModules: { [p: string]: any } = {};
    private static _readyCallback: Array<any> = [];
    private static _config = null;
    private static _loadedFiles: { [p: string]: any } = {};
    private static _configFile = 'yee.config.js?r=' + new Date().getTime();
    //渲染状态
    public static renderState: number = 0;
    public static baseUrl = (function () {
        let scripts = document.getElementsByTagName('script'), script = scripts[scripts.length - 1];
        let src = script.hasAttribute ? script.src : script.getAttribute('src');
        let m = src.match(/^(.*)yee(-\d+(\.\d+)*)?(\.min)?\.js/i);
        return m ? m[1] : '';
    })();

    private static event: YeeEvent = new YeeEvent();

    public static isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

    /**
     * 加载文件
     * @param url
     */
    public static loader(url: string) {
        if (Yee._loadedFiles[url]) {
            return Yee._loadedFiles[url];
        }
        let deferred = $.Deferred();
        Yee._loadedFiles[url] = deferred;
        let type = 'js';
        let match = url.match(/^css\!(.*)$/i);
        if (match) {
            url = match[1];
            type = 'css';
        }
        if (!/^\//.test(url)) {
            url = Yee.baseUrl + url;
        }
        //加载css
        if (type == 'css') {
            let heads = document.getElementsByTagName('head');
            if (heads.length > 0) {
                let head = heads[0];
                let link = document.createElement('link');
                link.href = url;
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                head.appendChild(link);
            }
            deferred.resolve(url);
            return deferred;
        }
        //加载js
        let script = document.createElement("script");
        script.type = "text/javascript";
        // @ts-ignore
        if (script.readyState) {
            // @ts-ignore
            script.onreadystatechange = function () {
                // @ts-ignore
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    // @ts-ignore
                    script.onreadystatechange = null;
                    deferred.resolve(url);
                }
            };
        } else {
            script.onload = function () {
                deferred.resolve(url);
            };
            script.onerror = function () {
                deferred.resolve(url);
            };
        }
        try {
            script.src = url;
            let head = document.getElementsByTagName('head');
            if (head.length > 0) {
                head[0].appendChild(script);
            } else {
                document.body.appendChild(script);
            }
        } catch (e) {
            deferred.resolve(url);
        }
        return deferred;
    }

    /**
     * 加载依赖
     * @param modules
     * @param paths
     */
    public static use(modules, paths = null) {
        if (Yee._config == null) {
            return;
        }
        let deferred = $.Deferred();
        if (modules === null) {
            return deferred.resolve();
        }
        if (typeof modules == 'string' && modules != '') {
            modules = [modules];
        }
        if (!(modules instanceof Array) || modules.length == 0) {
            return deferred.resolve();
        }
        let loadModule = function () {
            //加载模块
            let loadMaps = [];
            for (let i = 0; i < modules.length; i++) {
                let module = modules[i];
                if (typeof module !== 'string' || module == '') {
                    continue;
                }
                let file = module;
                if (!/^css\!/i.test(module) && !/\.js$/i.test(module)) {
                    if (paths && paths[module]) {
                        file = paths[module];
                    } else if (Yee._config.modules[module]) {
                        file = Yee._config.modules[module];
                    } else {
                        if (/^yee-/.test(module)) {
                            file = module.replace(/^yee-/, 'module/yee-') + '.js';
                        } else {
                            console.error('不存在的模块：' + module);
                        }
                    }
                }
                if (file == null || file == '') {
                    continue;
                }
                if (Yee._loadedFiles[file]) {
                    let promise = Yee._loadedFiles[file];
                    loadMaps.push(promise);
                    continue;
                }
                let promise = Yee._loadedFiles[file] = Yee.loader(file);
                loadMaps.push(promise);
            }
            if (loadMaps.length == 0) {
                deferred.resolve();
                return deferred;
            }
            $.when.apply($, loadMaps).then(function () {
                deferred.resolve();
            });
        }
        //遍历依赖==
        let dependModule = [];
        let dependSet = {};

        for (let i = 0; i < modules.length; i++) {
            let module = modules[i];
            if (Yee._config.depends[module]) {
                let depends = Yee._config.depends[module];
                if (typeof depends == 'function') {
                    depends = depends();
                }
                if (typeof depends == 'string') {
                    depends = [depends];
                }
                if (depends instanceof Array) {
                    for (let j = 0; j < depends.length; j++) {
                        let temp = depends[j];
                        if (typeof temp !== 'string' || temp == '' || dependSet[temp]) {
                            continue;
                        }
                        dependSet[temp] = true;
                        dependModule.push(temp);
                    }
                }
            }
        }
        if (dependModule.length > 0) {
            Yee.use(dependModule).then(function () {
                loadModule();
            });
        } else {
            loadModule();
        }
        return deferred;
    }

    /**
     * 解析url
     */
    public static parseUrl(url: string = '') {
        let query = url.replace(/&+$/, '');
        let path = query;
        let prams: { [p: string]: any } = {};
        let hash = '';
        let hIdx = query.search(/#/);
        if (hIdx >= 0) {
            path = query.substring(0, hIdx);
            hash = query.substring(hIdx);
        }
        let idx = query.search(/\?/);
        if (idx >= 0) {
            path = query.substring(0, idx);
            let pstr = query.substring(idx);
            let m = pstr.match(/(\w+)(=([^&]*))?/g);
            if (m) {
                $(m).each(function (index, str) {
                    let ma = String(str).match(/^(\w+)(?:=([^&]*))?$/);
                    if (ma) {
                        let val = ma[2] || '';
                        prams[ma[1]] = decodeURIComponent(val.replace(/\+/g, '%20'));
                    }
                });
            }
        }
        return {path: path, prams: prams, hash: hash};
    }

    /**
     * 转成url
     * @param info
     */
    public static toUrl(info: { [p: string]: any } = {}) {
        let path = info.path || window.location.pathname;
        let prams = info.prams || {};
        let qurey = [];
        for (let key in prams) {
            if (prams[key] == null || prams[key] == '') {
                qurey.push(key + '=');
                continue;
            }
            let values = (prams[key] + '').split(' ');
            if (values.length == 1) {
                qurey.push(key + '=' + encodeURIComponent(prams[key]));
                continue;
            }
            for (let i = 0; i < values.length; i++) {
                values[i] = encodeURIComponent(values[i]);
            }
            qurey.push(key + '=' + values.join("%20"));
        }
        if (qurey.length == 0) {
            return path;
        }
        return path + '?' + qurey.join('&') + (info.hash || '');
    }

    /**
     * 获取数据
     * @param elem
     * @param prefix
     */
    public static getElemData(elem, prefix: string) {
        prefix = prefix.toLowerCase().replace(/[-](\w)/g, function (_, word) {
            return word.toUpperCase();
        });
        let data = $.extend({}, $(elem).data() || {});
        for (let key in data) {
            let temp = key.split('@');
            if (temp.length == 2) {
                if (temp.length == 2 && temp[0] == prefix) {
                    data[temp[1]] = data[key];
                }
                delete data[key];
            }
        }
        //console.log(plugName, data);
        return data;
    }

    /**
     * 扩展模块
     * @param selector
     * @param name
     * @param module
     */
    public static extend(name: string, selector: string, module, prefix: string = null) {
        let items = $.trim(selector).split(',');
        for (let i = 0; i < items.length; i++) {
            items[i] += "[yee-module~='" + name + "']";
        }
        let plug = 'yee_' + name.replace('-', '_').toLowerCase();
        Yee._extendModules[name] = items.join(',');
        if (prefix == null || prefix == '') {
            prefix = name;
        }
        $.fn[plug] = function (options) {
            options = options || {};
            this.each(function (_, elem) {
                let data = Yee.getElemData(elem, prefix);
                data = $.extend({}, options, data);
                elem.yee_modules = elem.yee_modules || {};
                // 加载并创建模块对象
                if (elem.yee_modules[name] === void 0) {
                    elem.yee_modules[name] = true;
                    elem.yee_modules[name] = new module(this, data);
                }
            });
            return this;
        };
    }

    /**
     * 更新
     * @param base
     */
    public static update(base = null) {
        let deferred = $.Deferred();
        base = base || document.body;
        let yeeItems = $('*[yee-module]', base);
        let tempMaps = {};
        let readyToLoad = [];//待加载的模块
        //扫描所有节点--
        yeeItems.each(function () {
            let items = String($(this).attr('yee-module') || '').split(' ');
            for (let i = 0; i < items.length; i++) {
                let name = items[i];
                if (name === '') {
                    continue;
                }
                if (tempMaps[name] || Yee._extendModules[name]) {
                    continue;
                }
                let yee_src = $(this).attr('yee-src') || null;
                tempMaps[name] = true;
                readyToLoad.push({module: 'yee-' + name, file: yee_src});
            }
        });
        let update = function () {
            let items = [];
            for (let name in Yee._extendModules) {
                let selector = Yee._extendModules[name];
                let plug = 'yee_' + name.replace('-', '_').toLowerCase();
                let el = $(selector, base);
                if (el.length > 0 && typeof (el[plug]) == 'function') {
                    items.push({el: el, plug: plug});
                }
            }
            for (let i = 0; i < items.length; i++) {
                let el = items[i].el;
                let plug = items[i].plug;
                el.each(function (_, elem) {
                    let sel = $(elem);
                    if (sel.is('[yee-template]') || sel.parents('[yee-template]').length > 0) {
                        return;
                    }
                    sel[plug]();
                    sel.removeAttr('yee-module');
                });
            }
            deferred.resolve();
        };
        if (readyToLoad.length == 0) {
            update();
            return deferred;
        }
        let loadModules = [];
        let paths = {};
        for (let i = 0; i < readyToLoad.length; i++) {
            let item = readyToLoad[i];
            if (item.file) {
                paths[item.module] = item.file;
            }
            loadModules.push(item.module);
        }
        Yee.use(loadModules, paths).then(function () {
            update();
        });
        return deferred;
    }

    /**
     * 准备好后执行
     * @param fn
     */
    public static ready = function (fn) {
        if (Yee.renderState == 2) {
            return fn();
        }
        Yee._readyCallback.push(fn);
    };

    /**
     * 获取模块实例
     * @param elem
     * @param name
     */
    public static instance(elem, name: string = null) {
        let qel = $(elem);
        if (qel.length == 0) {
            return null;
        }
        let modules = qel.get(0)['yee_modules'] || null;
        if (modules == null) {
            return null;
        }
        if (name == null || name == '') {
            for (let key in modules) {
                return modules[key];
            }
            return null;
        }
        return modules[name] === void 0 ? null : modules[name];
    }


    //需要先加载的
    private static preload() {
        let deferred = $.Deferred();
        Yee.loader(Yee._configFile).then(function () {
            //如果没有配置文件
            if (Yee._config == null) {
                Yee._config = {version: null, preloading: {}, modules: {}, depends: {}, dataFormat: null};
            }
            let config = Yee._config;
            let loadMaps = [];
            for (let name in config.preloading) {
                let file = config.preloading[name];
                if (Yee._loadedFiles[file]) {
                    let promise = Yee._loadedFiles[file];
                    loadMaps.push(promise);
                    continue;
                }
                let promise = Yee._loadedFiles[file] = Yee.loader(file);
                loadMaps.push(promise);
            }
            if (loadMaps.length == 0) {
                deferred.resolve();
                return deferred;
            }
            $.when.apply($, loadMaps).then(function () {
                deferred.resolve();
            });
        });
        return deferred;
    }

    public static config(data) {
        if (data === void 0) {
            return Yee._config;
        }
        if (Yee._config == null) {
            Yee._config = {version: null, preloading: {}, modules: {}, depends: {}, dataFormat: null};
        }
        Yee._config = $.extend(Yee._config, data);
    }

    /**
     * 初始化
     */
    public static init() {
        let render = function () {
            Yee.preload().then(function () {
                //如果已经渲染就不再渲染
                if (Yee.renderState > 0) {
                    return;
                }
                Yee.renderState = 1; //开启渲染
                Yee.update().then(function () {
                    Yee.renderState = 2;//渲染结束
                    if (Yee._readyCallback.length > 0) {
                        for (let i = 0; i < Yee._readyCallback.length; i++) {
                            if (typeof (Yee._readyCallback[i]) == 'function') {
                                Yee._readyCallback[i]();
                            }
                        }
                    }
                });

            });
        };

        let css = '[yee-module]{pointer-events: none;}';
        let IE = navigator.userAgent.match(/MSIE\s*(\d+)/i);
        if (IE && parseInt(IE[1]) <= 10) {
            css = '[yee-module]{display: none;}';
        }
        let style = document.createElement("style");
        style.setAttribute("type", "text/css");
        if (style['styleSheet']) {// IE
            style['styleSheet'].cssText = css;
        } else {// w3c
            let cssText = document.createTextNode(css);
            style.appendChild(cssText);
        }
        let head = document.getElementsByTagName('head');
        if (head.length > 0) {
            head[0].appendChild(style);
        } else {
            document.documentElement.appendChild(style);
        }
        window.addEventListener('DOMContentLoaded', function () {
            render();
        }, false);
        window.addEventListener('load', render, false);
    }

    // 接管弹出层++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    public static alert(msg, option = null, func = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].alert(msg, option, func);
        }
        if (Yee.isMobile) {
            let data = {content: msg, btn: '确定'};
            if (typeof func == 'function') {
                data['yes'] = func;
            }
            return layer.open(data);
        }
        return layer.alert(msg, option, func);
    }

    public static confirm(msg, option, yesFunc = null, noFunc = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].confirm(msg, option, yesFunc, noFunc);
        }
        if (Yee.isMobile) {
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

    public static msg(msg, option = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].msg(msg, option);
        }
        if (Yee.isMobile) {
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

    public static load(type, option = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].load(type, option);
        }
        if (Yee.isMobile) {
            return layer.open({type: 2});
        }
        return layer.load(type, option);
    }

    public static close(index) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].close(index);
        }
        return layer.close(index);
    }

    public static closeAll(type = null) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].closeAll(type);
        }
        if (Yee.isMobile) {
            return layer.closeAll();
        }
        return layer.closeAll(type);
    }

    public static dialog(url: string, title: string = '网页对话框', setting: { [p: string]: any } = {}, callWindow = window) {
        if (window.top !== window && window.top['Yee']) {
            return window.top['Yee'].dialog(url, title, setting, window);
        }
        return YeeDialog.open(url, title, setting, callWindow);
    }

    public static emit(event: string, ...data) {
        return Yee.event.emit(event, ...data);
    }

    public static on(event: string, func: Function) {
        return Yee.event.on(event, func);
    }

    public static one(event: string, func: Function) {
        return Yee.event.one(event, func);
    }

    public static off(event: string, func: Function = null) {
        return Yee.event.off(event, func);
    }

    public static readyDialog(func) {
        YeeDialog.dialogHandle().then(func);
    }

    /**
     * 判断数组
     * @param obj
     */
    public static isArray(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }

    /**
     * 判断是对象
     * @param val
     */
    public static isObject(val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    }

}


let jqInit = $.fn.ready; //覆盖jq 的 $(function);
$.fn.extend({
    ready: function (fn) {
        if (Yee.renderState == 2) {
            return jqInit.call(this, fn);
        }
        Yee.ready(fn);
    },
    emit: function (...args) {
        let event = args[0] || null;
        args.shift();
        return $(this).triggerHandler(event, args);
    },
    instance: function (name) {
        return Yee.instance(this[0], name);
    }
});
//*********************************************************************************
//注册插件
Yee.extend('ajax', 'a,form,:input', YeeAjax);
Yee.extend('confirm', ':input,button,form,a', YeeConfirm);
Yee.extend('validate', 'form', YeeValidate);
Yee.extend('remote', ':input', YeeRemote);
Yee.extend('upload', 'input,a', YeeUpload);
Yee.extend('number', ':input', YeeNumber);
Yee.extend('integer', ':input', YeeInteger);
Yee.extend('picker', ':input', YeePicker);
Yee.extend('dialog', 'a,button,input', YeeDialog);
Yee.extend('linkage', ':input', YeeLinkage);
Yee.extend('select-dialog', ':input,a', YeeSelectDialog);
Yee.extend('pagebar', 'div', YeePagebar);
Yee.extend('search-form', 'form', YeeSearchForm);
Yee.extend('datatable', 'table', YeeDatatable);
Yee.extend('combine', 'div', YeeCombine);
Yee.extend('form-tab', 'ul', YeeFormTab);
Yee.extend('dynamic', ':input', YeeDynamic);
Yee.extend('xheditor', ':input', YeeXheditor);
Yee.init();

window['Yee'] = Yee;