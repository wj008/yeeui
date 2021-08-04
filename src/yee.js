import {YeeBase} from "./yee-base";
import {Loader} from "./loader";
import {YeeAjax} from "./module/yee-ajax";
import {YeeChoice} from "./module/yee-choice";
import {YeeValidate} from "./module/yee-validate";
import {YeeConfirm} from "./module/yee-confirm";
import {YeeDialog} from "./module/yee-dialog";
import {YeeDynamic} from "./module/yee-dynamic";
import {YeeLinkage} from "./module/yee-linkage";
import {YeeTransfer} from "./module/yee-transfer";
import {YeeContainer} from "./module/yee-container";
import {YeeMultipleDialog} from "./module/yee-multiple-dialog";
import {YeeSelectDialog} from "./module/yee-select-dialog";
import {YeePicker} from "./module/yee-picker";
import {YeeRemote} from "./module/yee-remote";
import {YeeUpload} from "./module/yee-upload";
import {YeeDelaySelect} from "./module/yee-delay-select";
import {YeeXhEditor} from "./module/yee-xh-editor";
import {YeeTinymce} from "./module/yee-tinymce";
import {YeeSearchForm} from "./module/yee-search-form";
import {YeeList} from "./module/yee-list";
import {YeeDatatable} from "./module/yee-datatable";
import {YeePagebar} from "./module/yee-pagebar";

class Yee extends YeeBase {
    /**
     * 预加载
     */
    static preload() {
        let loadPreload = function () {
            if (Yee.config == null) {
                Yee.config = {version: null, preload: {}, depends: {}};
            }
            let config = Yee.config;
            let items = [];
            for (let name in config.preload) {
                let file = config.preload[name];
                if (file == null || file == '') {
                    continue;
                }
                items.push(Loader.load(file, Yee.baseUrl));
            }
            if (items.length == 0) {
                return Promise.resolve([]);
            }
            return Promise.all(items);
        }
        if (Yee.config == null) {
            return new Promise(function (resolve, reject) {
                let configFile = 'yee.config.js?r=' + new Date().getTime();
                Loader.load(configFile, Yee.baseUrl).then(function () {
                    loadPreload().then(function (data) {
                        resolve(data);
                    }).catch(function (err) {
                        reject(err);
                    });
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
        return loadPreload();
    }

    /**
     * 渲染数据
     */
    static render(base = null) {
        let renderItems = [];
        if (base != null) {
            let element = $(base).get(0);
            if (element.hasAttribute('yee-module')) {
                renderItems.push(element);
            } else {
                renderItems = element.querySelectorAll('[yee-module]');
            }
        } else {
            renderItems = document.body.querySelectorAll('[yee-module]');
        }
        let renderMaps = {};
        let readyToLoad = [];
        for (let render of renderItems) {
            let items = String(render.getAttribute('yee-module') || '').split(' ');
            for (let name of items) {
                if (name === '') {
                    continue;
                }
                if (renderMaps[name] || Yee.renderModules[name]) {
                    continue;
                }
                renderMaps[name] = true;
                readyToLoad.push('yee-' + name);
            }
        }
        let doRender = function () {
            let elements = $(renderItems);
            let rendered = [];
            for (let name in Yee.renderModules) {
                let render = Yee.renderModules[name];
                let module = render.module;
                let el = elements.filter(render.selector);
                if (el.length == 0) {
                    continue;
                }
                el.each(function (_, element) {
                    let sel = $(element);
                    if (sel.is('[yee-template]') || sel.parents('[yee-template]').length > 0) {
                        return;
                    }
                    if (element.yee_modules == void 0) {
                        rendered.push(element);
                        element.yee_modules = {};
                    }
                    // 加载并创建模块对象
                    if (element.yee_modules[name] === void 0) {
                        element.yee_modules[name] = true;
                        element.yee_modules[name] = new module(element);
                    }
                });
            }
            $(rendered).removeAttr('yee-module');
        }
        if (readyToLoad.length > 0) {
            return new Promise(function (resolve, reject) {
                Yee.use(readyToLoad).then(function () {
                    doRender();
                    resolve(true);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
        doRender();
        return Promise.resolve(true)
    }

    /**
     * 初始化执行
     */
    static init() {
        if (Yee.renderState > 0) {
            return Promise.resolve(false);
        }
        return new Promise(function (resolve, reject) {
            Yee.renderState = 1;
            Yee.preload().then(function () {
                Yee.render().then(function () {
                    Yee.renderState = 2;
                    for (let fn of Yee.readyCallback) {
                        if (typeof fn == 'function') {
                            fn();
                        }
                    }
                    resolve(true);
                }).catch(function (err) {
                    reject(err);
                });
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    /**
     * 使用模块
     * @param modules
     */
    static use(modules) {
        if (Yee.config == null || modules === null) {
            return Promise.resolve(0);
        }
        if (typeof modules == 'string' && modules != '') {
            modules = [modules];
        }
        if (!(modules instanceof Array) || modules.length == 0) {
            return Promise.resolve(0);
        }
        let config = Yee.config;
        let loaded = 0;
        return new Promise(function (resolve, reject) {
            let next = function (idx) {
                if (modules[idx] === void 0) {
                    return resolve(loaded);
                }
                let name = modules[idx];
                if (/^css\!/i.test(name) || /\.js$/i.test(name)) {
                    Loader.load(name, Yee.baseUrl).then(function (ret) {
                        if (ret.status) {
                            loaded++;
                        }
                        next(idx + 1);
                    }).catch(function (err) {
                        reject(err);
                    });
                    return;
                }
                let file = config.depends[name] || '';
                //没有配置
                if (file == null || file == '') {
                    if (/^yee-/.test(name)) {
                        file = name + '.js';
                        Loader.load(file, Yee.baseUrl + 'module/').then(function (ret) {
                            if (ret.status) {
                                loaded++;
                            }
                            next(idx + 1);
                        }).catch(function (err) {
                            reject(err);
                        });
                        return;
                    }
                }
                //有配置
                Loader.load(file, Yee.baseUrl).then(function (ret) {
                    if (ret.status) {
                        loaded++;
                    }
                    next(idx + 1);
                }).catch(function (err) {
                    reject(err);
                });
            };
            next(0);
        });
    }

    /**
     * 页面加载后执行
     * @param fn
     */
    static ready(fn) {
        if (Yee.renderState == 2) {
            return fn();
        }
        Yee.readyCallback.push(fn);
    }

    /**
     * 设置配置文件
     * @param config
     */
    static setConfig(config) {
        Yee.config = config;
    }

    /**
     * 获取模块实例
     * @param elem
     * @param name
     */
    static instance(elem, name = null) {
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

    /**
     * 定义模块
     * @param selectors
     * @param name
     * @param module
     */
    static define(name, selectors, module) {
        if (typeof selectors == 'string') {
            selectors = [selectors];
        }
        let items = [];
        for (let ext of selectors) {
            items.push(ext + "[yee-module~='" + name + "']");
        }
        Yee.renderModules[name] = {
            selector: items.join(','),
            module: module
        };
    }

    static getModule(name) {
        if (Yee.renderModules[name] === void 0) {
            return null;
        }
        return Yee.renderModules[name].module;
    }
}

Yee.version = '2.0.0';
Yee.config = null;
//根目录
Yee.baseUrl = (function () {
    let scripts = document.getElementsByTagName('script'), script = scripts[scripts.length - 1];
    let src = script.hasAttribute ? script.src : script.getAttribute('src');
    let m = src.match(/^(.*)yee(-\d+(\.\d+)*)?(\.min)?\.js/i);
    return m ? m[1] : '';
})();
//渲染状态
Yee.renderState = 0;
Yee.readyCallback = [];
Yee.renderModules = {};

(function () {
    let jQReady = $.fn.ready;
    $.fn.extend({
        ready: function (fn) {
            if (Yee.renderState == 2) {
                return jQReady.call(this, fn);
            }
            Yee.ready(fn);
        },
        emit: function (event, ...args) {
            return $(this).triggerHandler(event, args);
        },
        instance: function (name) {
            return Yee.instance(this[0], name);
        }
    });
    window.addEventListener('DOMContentLoaded', function () {
        Yee.init();
    }, false);
    window.addEventListener('load', Yee.init, false);
    window['Yee'] = Yee;

    Yee.define('validate', 'form', YeeValidate);
    Yee.define('ajax', [':input', 'button', 'a', 'form'], YeeAjax);
    Yee.define('choice', 'a', YeeChoice);
    Yee.define('confirm', ['input', 'button', 'form', 'a'], YeeConfirm);
    Yee.define('dialog', ['button', 'a'], YeeDialog);
    Yee.define('dynamic', ':input', YeeDynamic);
    Yee.define('linkage', 'input', YeeLinkage);
    Yee.define('transfer', 'input', YeeTransfer);
    Yee.define('container', 'div', YeeContainer);
    Yee.define('multiple-dialog', ':input', YeeMultipleDialog);
    Yee.define('select-dialog', [':input', 'button', 'a'], YeeSelectDialog);
    Yee.define('picker', ['input', 'a'], YeePicker);
    Yee.define('remote', ':input', YeeRemote);
    Yee.define('upload', ['input', 'a'], YeeUpload);
    Yee.define('delay-select', 'select', YeeDelaySelect);
    Yee.define('xh-editor', ':input', YeeXhEditor);
    Yee.define('tinymce', ':input', YeeTinymce);
    Yee.define('search-form', 'form', YeeSearchForm);
    Yee.define('list', '*', YeeList);
    Yee.define('datatable', 'table', YeeDatatable);
    Yee.define('pagebar', 'div', YeePagebar);


})();
