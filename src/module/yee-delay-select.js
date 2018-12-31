"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeDelaySelect {
    constructor(elem, setting) {
        this.qel = null;
        this.setting = null;
        this.setting = setting;
        let qel = this.qel = $(elem);
        let that = this;
        qel.on('change', function () {
            let selected = qel.children(':selected');
            if (selected.length > 0) {
                qel.data('value', selected[0].value);
            }
        });
        let has = false;
        let value = qel.data('value') || null;
        qel.find('option').each(function (_, el) {
            let opt = $(el);
            opt.prop('selected', false);
            if (opt.val() == value) {
                opt.prop('selected', true);
                has = true;
            }
        });
        if (!has && value !== null) {
            let ot = new Option(value, value);
            ot.selected = true;
            qel[0].add(ot);
        }
        qel.on('update', function (ev, option, value) {
            that.update(option, value);
        });
        if (setting.source) {
            if (typeof (setting.source) == 'string') {
                let method = setting.method || 'get';
                method = method.toLocaleLowerCase();
                $[method](setting.source, function (ret) {
                    if (ret.status === true && ret.data) {
                        that.update(ret.data);
                    }
                    else {
                        yee_1.Yee.alert('无法加载远程数据！');
                    }
                }, 'json');
            }
            else if (yee_1.Yee.isArray(setting.source)) {
                that.update(setting.source);
            }
        }
    }
    initItem(items, value = null) {
        let qel = this.qel;
        let element = qel.get(0);
        value = value === null ? qel.data('value') || '' : value;
        if (items !== null && yee_1.Yee.isArray(items)) {
            let has = false;
            for (let item of items) {
                let opt = {};
                if (typeof (item) === 'number' || typeof (item) === 'string') {
                    opt.value = item;
                    opt.text = item;
                }
                else {
                    if (typeof (item.value) !== 'undefined') {
                        opt.value = item.value;
                    }
                    else if (typeof (item[0]) !== 'undefined') {
                        opt.value = item[0];
                    }
                    else {
                        continue;
                    }
                    if (typeof (item.text) !== 'undefined') {
                        opt.text = item.text;
                    }
                    else if (typeof (item[1]) !== 'undefined') {
                        opt.text = item[1];
                    }
                    else {
                        opt.text = opt.value;
                    }
                }
                if (element.length == 1 && (opt.value === null || opt.value === '')) {
                    element.length = 0;
                    opt.value = '';
                }
                let option = new Option(opt.text, opt.value);
                element.add(option);
                if (value == opt.value) {
                    option.selected = true;
                    has = true;
                }
            }
            if (!has) {
                qel.data('value', '');
            }
        }
    }
    update(items, value = null) {
        let qel = this.qel;
        let element = qel.get(0);
        element.length = 0;
        let header = this.setting.header || '';
        //添加头部
        if (header) {
            if (typeof header == 'string') {
                element.add(new Option(header, ''));
            }
            else if (typeof header == 'object' && header.text) {
                element.add(new Option(header.text, header.value || ''));
            }
            else if (yee_1.Yee.isArray(header) && header.length >= 2) {
                element.add(new Option(header[1], header[0]));
            }
        }
        this.initItem(items, value);
    }
}
exports.YeeDelaySelect = YeeDelaySelect;
//# sourceMappingURL=yee-delay-select.js.map