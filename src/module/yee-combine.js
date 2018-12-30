"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const yee_1 = require("../yee");

class YeeCombine {
    constructor(elem, setting = {}) {
        this.index = 0;
        this.template = null;
        let qel = this.qel = $(elem);
        let that = this;
        this.setting = setting;
        setting.minSize = parseInt(setting['minSize'] || 0);
        setting.maxSize = parseInt(setting['maxSize'] || 1000);
        this.index = parseInt(setting.index || '0');
        this.wrap = qel.find('.combine-wrap');
        if (setting.source == null || setting.source == '') {
            console.error('没有模板源数据!');
            return;
        }
        let source = setting.source;
        if (window.atob) {
            that.template = decodeURIComponent(window.atob(source).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            that.init();
        } else {
            yee_1.Yee.use('base64').then(function () {
                // @ts-ignore
                that.template = Base64.decode(source);
                that.init();
            });
        }
    }

    init() {
        let that = this;
        let qel = this.qel;
        let setting = this.setting;
        let wrap = this.wrap;
        let addBtn = qel.find('a.combine-add');
        addBtn.on('click', function () {
            that.addItem();
        });
        //删除
        qel.on('click', 'a.combine-del', function () {
            if (wrap.find('.combine-item').length <= setting.minSize) {
                yee_1.Yee.alert('至少需要保留 ' + setting.minSize + ' 项。');
                return;
            }
            let delItem = $(this).parents('.combine-item:first');
            yee_1.Yee.confirm('确定要删除该行了吗？', function (idx) {
                delItem.remove();
                that.updateIndex();
                if (wrap.find('.combine-item').length <= setting.minSize) {
                    qel.find('a.combine-del').hide();
                }
                yee_1.Yee.close(idx);
            });
        });
        //插入
        qel.on('click', 'a.combine-insert', function () {
            let item = that.addItem();
            let prev = $(this).parents('.combine-item:first');
            if (item) {
                prev.before(item);
            }
            that.updateIndex();
        });
        //上移
        qel.on('click', 'a.combine-upsort', function () {
            let next = $(this).parents('.combine-item:first');
            let prev = next.prev('.combine-item');
            if (prev.length > 0) {
                prev.before(next);
            }
            that.updateIndex();
            return false;
        });
        //下移
        qel.on('click', 'a.combine-dnsort', function () {
            let prev = $(this).parents('.plugin-item:first');
            let next = prev.next('.combine-item');
            if (next.length > 0) {
                next.after(prev);
            }
            that.updateIndex();
            return false;
        });
        //如果存在至少行数
        if (setting['minSize']) {
            if (wrap.find('.combine-item').length < setting['minSize']) {
                for (let i = 0; i < setting['minSize']; i++) {
                    that.addItem();
                    if (wrap.find('.combine-item').length >= setting['minSize']) {
                        break;
                    }
                }
            }
        }
        this.updateIndex();
    }

    addItem() {
        if (this.template == null) {
            return;
        }
        this.index++;
        let qel = this.qel;
        let setting = this.setting;
        if (this.wrap.find('.combine-item').length >= setting.maxSize) {
            yee_1.Yee.alert('至多不可超过 ' + setting.maxSize + ' 项。');
            return null;
        }
        let code = this.template.replace(/@@index@@/g, 'a' + this.index);
        let item = $(code).appendTo(this.wrap);
        if (this.wrap.find('.combine-item').length > setting.minSize) {
            qel.find('.plugin-del').show();
        }
        this.updateIndex();
        // @ts-ignore
        qel.emit('addItem', item);
        yee_1.Yee.update(item);
        return item;
    }

    updateIndex() {
        let setting = this.setting;
        let len = this.wrap.find('.combine-item').length;
        this.wrap.find('.combine-item').each(function (idx, el) {
            if (idx == 0) {
                $(el).find('a.combine-upsort').hide();
            } else {
                $(el).find('a.combine-upsort').show();
            }
            if (idx == len - 1) {
                $(el).find('a.combine-dnsort').hide();
            } else {
                $(el).find('a.combine-dnsort').show();
            }
            $(el).find('.combine-index').text(idx + 1);
        });
        if (setting.maxSize > 0 && len >= setting.maxSize) {
            $('.combine-add').hide();
        } else {
            $('.combine-add').show();
        }
    }
}

exports.YeeCombine = YeeCombine;
//# sourceMappingURL=yee-combine.js.map