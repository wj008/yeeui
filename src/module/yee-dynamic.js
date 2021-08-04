class YeeDynamic {
    constructor(elem) {
        this.qel = $(elem);
        this.dynamicData = this.qel.data('dynamic') || null;
        this.init();
    }

    static hasValue(arr, value) {
        if (typeof value == 'string' || typeof value == 'number' || typeof value == 'boolean') {
            for (let val of arr) {
                if (val == value) {
                    return true;
                }
            }
            return false;
        } else {
            for (let val of arr) {
                if (JSON.stringify(val) == JSON.stringify(value)) {
                    return true;
                }
            }
            return false;
        }
    }

    static dynamic(type, names) {
        if (typeof names == 'string') {
            names = [names];
        }
        for (let name of names) {
            let rowId = ('#row_' + name).replace(/(:|\.)/g, '\\$1');
            let boxId = (name).replace(/(:|\.)/g, '\\$1');
            boxId = ':input[name=' + boxId + ']';
            switch (type) {
                case 'show':
                    $(rowId).show();
                    $(rowId + ' :input').data('valid-disabled', false);
                    break;
                case 'hide':
                    $(rowId).hide();
                    $(rowId + ' :input').data('valid-disabled', true);
                    if (typeof ($(rowId + ' :input')['setDefault']) == 'function') {
                        $(rowId + ' :input')['setDefault']();
                    }
                    break;
                case 'on':
                    $(boxId).data('valid-disabled', false);
                    break;
                case 'off':
                    $(boxId).data('valid-disabled', true);
                    if (typeof $(boxId)['setDefault'] == 'function') {
                        $(boxId)['setDefault']();
                    }
                    break;
                default:
                    break;
            }
        }
    }

    dynamicItem(item) {
        //显示
        if (item.show !== void 0) {
            YeeDynamic.dynamic('show', item.show);
        }
        //隐藏
        if (item.hide !== void 0) {
            YeeDynamic.dynamic('hide', item.hide);
        }
        //关闭验证
        if (item['off-val'] !== void 0) {
            YeeDynamic.dynamic('off', item['off']);
        }
        //开启验证
        if (item['on-val'] !== void 0) {
            YeeDynamic.dynamic('on', item['on']);
        }
    }

    notifyBind() {
        let selector = this.qel.data('bind');
        if (selector) {
            let bind = $(selector);
            if (bind.is(':visible')) {
                bind.triggerHandler('dynamic');
            }
        }
    }

    initCheckBox() {
        let qel = this.qel;
        let name = qel.attr('name');
        let form = qel.parents('form:first');
        let items = form.find(':input[name="' + name + '"]');
        let that = this;
        let timer = null;
        let initEvent = function () {
            let data = that.dynamicData;
            let checked = form.find(':input[name="' + name + '"]:checked');
            if (Yee.isArray(data)) {
                for (let item of data) {
                    //相等
                    if (item.eq !== void 0) {
                        $(checked).each(function (_, elm) {
                            let val = $(elm).val() || '';
                            if (item.eq == val) {
                                that.dynamicItem(item);
                                return false;
                            }
                        });
                    }
                    //不相等
                    if (item.neq !== void 0) {
                        let neq = true;
                        $(checked).each(function (_, elm) {
                            let val = $(elm).val() || '';
                            if (item.neq == val) {
                                neq = false;
                                return false;
                            }
                        });
                        if (neq) {
                            that.dynamicItem(item);
                        }
                    }
                    //包含
                    if (item.in !== void 0 && Yee.isArray(item.in)) {
                        $(checked).each(function (_, elm) {
                            let val = $(elm).val() || '';
                            if (YeeDynamic.hasValue(item.in, val)) {
                                that.dynamicItem(item);
                                return false;
                            }
                        });
                    }
                    //不包含
                    if (item.nin !== void 0 && Yee.isArray(item.nin)) {
                        let nin = true;
                        $(checked).each(function (_, elm) {
                            let val = $(elm).val() || '';
                            if (YeeDynamic.hasValue(item.nin, val)) {
                                nin = false;
                                return false;
                            }
                        });
                        if (nin) {
                            that.dynamicItem(item);
                        }
                    }
                }
            }
            that.notifyBind();
        };
        items.on('click', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            timer = window.setTimeout(function () {
                initEvent();
            }, 10);
        });
        items.on('dynamic', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            initEvent();
        });
        initEvent();
    }

    init() {
        let qel = this.qel;
        let that = this;
        //checkbox
        if (qel.is(':checkbox')) {
            return this.initCheckBox();
        }
        //radio
        if (qel.is(':radio')) {
            let name = qel.attr('name');
            let form = qel.parents('form:first');
            let items = form.find(':radio[name="' + name + '"]');
            items.on('click', function () {
                qel.emit('change');
            });
        }
        let timer = null;
        let initEvent = function () {
            let val = qel.val();
            if (qel.is(':radio')) {
                let name = qel.attr('name');
                let form = qel.parents('form:first');
                let checked = form.find(':radio[name="' + name + '"]:checked');
                val = checked.val() || '';
            }
            if (qel.is(':checkbox')) {
                val = qel.is(':checked') ? true : false;
            }
            let data = that.dynamicData;
            if (Yee.isArray(data)) {
                for (let k in data) {
                    let item = data[k];
                    if (item.eq !== void 0) {
                        if (item.eq == val) {
                            that.dynamicItem(item);
                        }
                    }
                    if (item.neq !== void 0) {
                        if (item.neq != val) {
                            that.dynamicItem(item);
                        }
                    }
                    if (item.in !== void 0 && Yee.isArray(item.in)) {
                        if (YeeDynamic.hasValue(item.nin, val)) {
                            that.dynamicItem(item);
                        }
                    }
                    if (item.nin !== void 0 && Yee.isArray(item.nin)) {
                        if (YeeDynamic.hasValue(item.nin, val)) {
                            that.dynamicItem(item);
                        }
                    }
                }
            }
            that.notifyBind();
        };
        qel.on('blur click change', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            timer = window.setTimeout(function () {
                initEvent();
            }, 10);
        });
        qel.on('dynamic', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            initEvent();
        });
        initEvent();
    }
}

export {YeeDynamic}