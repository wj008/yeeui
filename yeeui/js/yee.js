"use strict";
(function ($) {

    var config = null;
    //准备完成后要执行的回调
    var readyCallback = [];
    // 加载器
    var loader = function (url, mode) {
        var def = $.Deferred();
        var type = 'js';
        var match = url.match(/^css\!(.*)$/i);
        if (match) {
            url = match[1];
            type = 'css';
        }
        if (!/^\//.test(url)) {
            url = Yee.baseUrl + url;
        }
        if (config && config.version) {
            var query = Yee.parseUrl(url);
            query.prams.v = config.version;
            url = Yee.toUrl(query);
        }
        if (type == 'css') {
            var head = document.getElementsByTagName('head');
            if (head.length > 0) {
                head = head[0];
                var link = document.createElement('link');
                link.href = url;
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                head.appendChild(link);
            }
            def.resolve(url);
            return def;
        } else {
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        def.resolve();
                    }
                };
            } else {
                script.onload = function () {
                    def.resolve(url);
                };
                script.onerror = function () {
                    def.resolve(url);
                };
            }
            try {
                script.src = url;
                var head = document.getElementsByTagName('head');
                if (head.length > 0) {
                    head[0].appendChild(script);
                } else {
                    document.body.appendChild(script);
                }
            } catch (e) {
                def.resolve(url);
            }
        }
        return def;
    }

    var Yee = window.Yee = $.Yee = window.Yee || {};
    //ui版本号
    Yee.version = '1.0.0';

    //已加载的模块
    Yee.loadedFiles = {};
    //扩展的模块
    Yee.extendModules = {};
    //解析URL
    Yee.parseUrl = function (url) {
        url = url || '';
        var query = url.replace(/&+$/, '');
        var path = query;
        var prams = {};
        var idx = query.search(/\?/);
        if (idx >= 0) {
            path = query.substring(0, idx);
            var pstr = query.substring(idx);
            var m = pstr.match(/(\w+)(=([^&]*))?/g);
            if (m) {
                $(m).each(function () {
                    var ma = this.match(/^(\w+)(?:=([^&]*))?$/);
                    if (ma) {
                        var val = ma[2] || '';
                        prams[ma[1]] = decodeURIComponent(val.replace(/\+/g, '%20'));
                    }
                });
            }
        }
        return {path: path, prams: prams};
    };
    //转换成URL
    Yee.toUrl = function (info) {
        if (info === void 0 || info == null) {
            info = {};
        }
        var path = info.path || window.location.pathname;
        var prams = info.prams || {};
        var qurey = [];
        for (var key in prams) {
            if (prams[key] == null || prams[key] == '') {
                qurey.push(key + '=');
                continue;
            }
            var vals = (prams[key] + '').split(' ');
            if (vals.length == 1) {
                qurey.push(key + '=' + encodeURIComponent(prams[key]));
                continue;
            }
            for (var i = 0; i < vals.length; i++) {
                vals[i] = encodeURIComponent(vals[i]);
            }
            qurey.push(key + '=' + vals.join("%20"));
        }
        if (qurey.length == 0) {
            return path;
        }
        return path + '?' + qurey.join('&');
    };
    //获得根目录
    Yee.baseUrl = (function () {
        var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length - 1];
        var src = script.getAttribute.length !== undefined ? script.src : script.getAttribute('src', -1);
        var m = src.match(/^(.*)yee(-\d+(\.\d+)*)?(\.min)?\.js/i);
        return m ? m[1] : '';
    })();
    //设置配置
    Yee.config = function (data) {
        if(data===void 0){
            return config;
        }
        if (config == null) {
            config = {version: null, modules: {}, depends: {},dataFormat:null};
        }
        config = $.extend(config, data);
    }
    //引用包 模块 脚本
    Yee.use = function (modules, paths) {
        var def = $.Deferred();
        //要加载脚本之前必须先加载config
        if (config == null) {
            loader('yee.config.js?r=' + new Date().getTime()).then(function () {
                //如果没有配置文件
                if (config == null) {
                    config = {version: null, modules: {}, depends: {}};
                }
                Yee.use(modules).then(function () {
                    return def.resolve();
                });
            });
            return def;
        }
        if (modules === null) {
            return def.resolve();
        }
        if (typeof modules == 'string' && modules != '') {
            modules = [modules];
        }
        if (!(modules instanceof Array) || modules.length == 0) {
            return def.resolve();
        }
        var loadModule = function () {
            //加载模块
            var loadMaps = [];
            for (var i = 0; i < modules.length; i++) {
                var module = modules[i];
                if (typeof module !== 'string' || module == '') {
                    continue;
                }
                var file = module;

                if (!/\.js$/i.test(module)) {
                    if (paths && paths[module]) {
                        file = paths[module];
                    }
                    else if (config.modules[module]) {
                        file = config.modules[module];
                    } else {
                        if (/^yee-/.test(module)) {
                            file = module.replace(/^yee-/, 'module/yee.') + '.js';
                        } else {
                            console.error('不存在的模块：' + module);
                        }
                    }
                }

                if (file == null || file == '') {
                    continue;
                }
                if (Yee.loadedFiles[file]) {
                    var promise = Yee.loadedFiles[file];
                    loadMaps.push(promise);
                    continue;
                }
                var promise = Yee.loadedFiles[file] = loader(file);
                loadMaps.push(promise);
            }

            if (loadMaps.length == 0) {
                def.resolve();
                return def;
            }
            $.when.apply($, loadMaps).then(function () {
                def.resolve();
            });
        }
        //遍历依赖==
        var dependModule = [];
        var dependSet = {};
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            if (config.depends[module]) {
                var depends = config.depends[module];
                if (typeof depends == 'string') {
                    depends = [depends];
                }
                if (depends instanceof Array) {
                    for (var i = 0; i < depends.length; i++) {
                        var temp = depends[i];
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
        return def;
    }
    //扩展插件
    Yee.extend = function (selector, name, module) {
        if (typeof (selector) !== 'string' || typeof (name) !== 'string') {
            return;
        }
        var plug = 'yee_' + name;
        var items = $.trim(selector).split(',');
        for (var i = 0; i < items.length; i++) {
            items[i] += "[yee-module~='" + name + "']";
        }
        Yee.extendModules[name] = items.join(',');
        // 自动扩展JQ插件
        $.fn[plug] = function (options) {
            this.each(function (idx, elem) {
                // 加载并创建模块对象
                var option = $.extend(options || {}, $(elem).data() || {});
                elem.yee_modules = elem.yee_modules || {};
                // 加载并创建模块对象
                if (elem.yee_modules[name] === void 0) {
                    elem.yee_modules[name] = true;
                    elem.yee_modules[name] = new module(this, option);
                }
            });
            return this;
        };
    };
    //更新渲染
    Yee.update = function (base) {
        var def = $.Deferred();
        base = base || document.body;
        var yeeItems = $('*[yee-module]', base);
        var tempMaps = {};
        var moduleItems = [];
        //扫描所有节点--
        yeeItems.each(function () {
            var items = String($(this).attr('yee-module') || '').split(' ');
            for (var i = 0; i < items.length; i++) {
                var name = items[i];
                if (name === '') {
                    continue;
                }
                if (tempMaps[name] || Yee.extendModules[name]) {
                    continue;
                }
                tempMaps[name] = true;
                var yee_depend = $(this).attr('yee-depend') || null;
                moduleItems.push({module: 'yee-' + name, file: yee_depend});
            }
        });
        var update = function () {
            for (var name in Yee.extendModules) {
                var selector = Yee.extendModules[name];
                var plug = 'yee_' + name;
                var items = $(selector, base);
                if (items.length > 0 && typeof (items[plug]) == 'function') {
                    items[plug]();
                }
            }
            def.resolve();
        };
        if (moduleItems.length == 0) {
            update();
            return def;
        }
        var loadModules = [];
        var paths = {};
        for (var i = 0; i < moduleItems.length; i++) {
            var item = moduleItems[i];
            if (item.file) {
                paths[item.module] = item.file;
            }
            loadModules.push(item.module);
        }
        Yee.use(loadModules, paths).then(function () {
            update();
        });
        return def;
    };
    //准备
    Yee.ready = function (fn) {
        readyCallback.push(fn);
    };
    //获取节点对应模块的实例
    Yee.getModuleInstance = function (elem, module) {
        if (typeof module != 'string') {
            return null;
        }
        var qem = $(elem);
        if (qem.length == 0) {
            return null;
        }
        var modules = qem.get(0)['yee_modules'] || null;
        if (modules == null) {
            return null;
        }
        return modules[module] === void 0 ? null : modules[module];
    }

    //扩展JQ功能
    var renderState = 0;//渲染状态
    var jqInit = $.fn.init; //覆盖jq 的 $(function);
    $.fn.init = function () {
        if (renderState == 2 || arguments.length == 0 || typeof(arguments[0]) != 'function') {
            return jqInit.apply($.fn, arguments);
        }
        Yee.ready(arguments[0]);
    }
    $.fn.emit = function () {
        var event = arguments[0] || null;
        var args = [];
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
        }
        return $(this).triggerHandler(event, args);
    }
    $.fn.getModuleInstance = function (module) {
        return Yee.getModuleInstance(this, module);
    }

    //对话框
    var init = function () {
        //渲染第一次
        var render = function () {
            //如果已经渲染就不再渲染
            if (renderState > 0) {
                return;
            }
            renderState = 1; //开启渲染
            Yee.update().then(function () {
                $('html').show();
                renderState = 2;//渲染结束
                if (readyCallback.length > 0) {
                    for (var i = 0; i < readyCallback.length; i++) {
                        if (typeof(readyCallback[i]) == 'function') {
                            readyCallback[i]();
                        }
                    }
                }
            });
        };
        //初始化代码===========
        $('html').hide();
        var isIE = navigator.userAgent.match(/MSIE\s*(\d+)/i);
        isIE = isIE ? (isIE[1] < 9) : false;
        if (isIE) {
            var itv = setInterval(function () {
                try {
                    document.documentElement.doScroll();
                    clearInterval(itv);
                    render();
                } catch (e) {
                }
            }, 1);
        } else {
            window.addEventListener('DOMContentLoaded', function () {
                render();
            }, false);
        }
        if (window.attachEvent) {
            window.attachEvent('onload', render);
        } else {
            window.addEventListener('load', render, false);
        }
    }
    init();
})(jQuery);

//标准库代码================================
(function ($) {
    //number 数值输入
    Yee.extend(':input', 'number', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                $(this).data('last-value', this.value);
                return true;
            }
            this.value = $(this).data('last-value') || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            this.value = /^-?([1-9]\d*|0)(\.\d+)?$/.test(this.value) ? this.value : '';
        });
    });
    //integer 整数输入
    Yee.extend(':input', 'integer', function (elem) {
        var that = $(elem);
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                $(this).data('last-value', this.value);
            }
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                $(this).data('last-value', this.value);
                return true;
            }
            this.value = $(this).data('last-value') || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            this.value = /^-?([1-9]\d*|0)$/.test(this.value) ? this.value : '';
        });
    });

})(jQuery);