import {YeeTemplate} from "../libs/yee-template";

class YeeList {
    constructor(elem) {
        this.templates = [];
        let qel = this.qel = $(elem);
        this.baseUrl = qel.data('url') || '';
        this.captureUrl = qel.data('capture-url') === void 0 ? !!qel.data('auto-url') : false;
        this.autoLoad = !!qel.data('auto-load');
        if (this.baseUrl == '') {
            this.captureUrl = true;
            if (/\/$/.test(String(window.location.pathname))) {
                this.baseUrl = window.location.pathname + 'index.json' + window.location.search;
            } else {
                this.baseUrl = window.location.pathname + '.json' + window.location.search;
            }
        }
        this.init();
    }

    init() {
        let qel = this.qel;
        let that = this;
        Yee.use('vue').then(function () {
            qel.find('[yee-template]').each(function (_, el) {
                let tpl = new YeeTemplate(el, {list: [], pageInfo: [], other: {}});
                that.templates.push(tpl);
            });
            let args = Yee.parseUrl(that.baseUrl);
            that.lastSend = {
                url: args.path,
                data: args.param
            };
            if (that.autoLoad) {
                let showMessage = !!qel.data('show-message');
                that.load(that.baseUrl, null, showMessage);
            }
            qel.on('reload', function (ev, showMessage) {
                that.reload(showMessage);
            });
            qel.on('resume', function (ev, showMessage) {
                that.resume(showMessage);
            });
            qel.on('load', function (ev, url = null, prams = {}, showMessage = false) {
                that.load(url, prams, showMessage);
            });
            //排序相关
            let orderFunc = function () {
                let thItem = $(this);
                let name = thItem.data('order');
                qel.find('thead th').not(thItem).removeClass('down').removeClass('up');
                if (thItem.is('.down')) {
                    thItem.removeClass('down').addClass('up');
                    // @ts-ignore
                    qel.emit('order', {name: name, order: 1});
                } else {
                    thItem.removeClass('up').addClass('down');
                    // @ts-ignore
                    qel.emit('order', {name: name, order: -1});
                }
            };
            qel.find('thead th').each(function (idx, elem) {
                let th = $(elem);
                if (th.data('order')) {
                    th.addClass('order');
                    th.on('click', orderFunc);
                }
            });
            qel.on('click', 'tbody tr', function () {
                qel.find('tbody tr').removeClass('active');
                $(this).addClass('active');
            });
            let checkbox = qel.find('thead th :checkbox');
            if (checkbox.length > 0) {
                checkbox.on('click', function () {
                    qel.find('tbody td :checkbox').prop('checked', checkbox.prop('checked'));
                });
            }
        }).catch(function (err) {
            console.error(err)
        });
    }

    /**
     * 渲染数据
     * @param source
     */
    render(source) {
        let qel = this.qel;
        let that = this;
        return new Promise(function (resolve) {
            if (that.templates.length == 0) {
                // @ts-ignore
                qel.emit('render', source, that.currentUrl);
                return resolve(true);
            }
            let list = [];
            if (source.list && Yee.isArray(source.list)) {
                list = source.list;
            } else if (Yee.isArray(source)) {
                list = source;
            }
            // @ts-ignore
            let data = qel.emit('filter', list);
            if (data !== void 0) {
                list = data;
            }
            for (let i = 0; i < list.length; i++) {
                // @ts-ignore
                let item = qel.emit('filterItem', list[i]);
                if (item !== void 0) {
                    if (item !== void 0) {
                        list[i] = item;
                    }
                }
            }
            let promiseList = [];
            for (let template of that.templates) {
                let promise = template.render({list: list, pageInfo: source.pageInfo || {}});
                promiseList.push(promise);
            }
            if (promiseList.length == 0) {
                // @ts-ignore
                qel.emit('render', source, that.currentUrl);
                qel.find('thead th :checkbox').prop('checked', false);
                return resolve(true);
            } else {
                Promise.all(promiseList).then(function () {
                    // @ts-ignore
                    qel.emit('render', source, that.currentUrl);
                    qel.find('thead th :checkbox').prop('checked', false);
                    return resolve(true);
                });
            }
        });
    }

    /**
     * 加载
     * @param url
     * @param showMessage
     * @param param
     */
    load(url = null, param = {}, showMessage = false) {
        let qel = this.qel;
        let that = this;
        url = url || this.baseUrl;
        let method = qel.data('method') || 'get';
        let rewrite = !!qel.data('rewrite');
        let args = Yee.parseUrl(url);
        args.path = args.path || window.location.pathname;
        for (let key in param) {
            args.param[key] = param[key];
        }
        this.lastSend = {
            url: args.path,
            data: args.param
        };
        if (rewrite) {
            let temp1 = Yee.parseUrl(window.location.href);
            for (let key in args.param) {
                temp1.param[key] = args.param[key];
            }
            let param = {};
            for (let key in temp1.param) {
                if (temp1.param[key] !== '') {
                    param[key] = temp1.param[key];
                }
            }
            temp1.param = param;
            let href = Yee.toUrl(temp1);
            if (typeof (window.history.replaceState) == 'function') {
                window.history.replaceState({}, '', href);
            }
        }
        return new Promise(function (resolve) {
            Yee.fetch(args.path, args.param, method).then(function (ret) {
                //拉取数据成功
                if (ret.status === true) {
                    if (showMessage && ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {time: 1000});
                    }
                    that.currentUrl = Yee.toUrl(args);
                    that.render(ret).then(function () {
                        // @ts-ignore
                        qel.emit('success', ret, that.currentUrl);
                        resolve(true);
                    });
                }
                //拉取数据错误
                if (ret.status === false) {
                    if (ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 0, time: 2000});
                    }
                    // @ts-ignore
                    qel.emit('error', ret);
                    resolve(false);
                }
            });
        });
    }

    /**
     * 刷新数据
     * @param showMessage
     */
    reload(showMessage = false) {
        if (this.lastSend) {
            return this.load(this.lastSend.url, this.lastSend.data, showMessage);
        }
        return Promise.resolve(true);
    }

    /**
     * 重置
     * @param showMessage
     */
    resume(showMessage = false) {
        return this.load(this.baseUrl, null, showMessage);
    }
}

export {YeeList}