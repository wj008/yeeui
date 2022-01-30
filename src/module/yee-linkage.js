import {YeeValidate} from "./yee-validate";

class YeeLinkage {
    constructor(elem) {
        this.inputs = [];
        this.qel = null;
        this.level = 0;
        this.values = [];
        this.pending = null;
        this.qelName = null;
        let qel = this.qel = $(elem);
        let that = this;
        let strLevel = String(qel.data('level') || '0');
        that.level = parseInt(/^\d+$/.test(strLevel) ? strLevel : '0');
        qel.hide();
        this.qelName = qel.attr('name') || null;
        let strVal = String(qel.val() || '');
        this.setValue(strVal);
        let source = qel.data('source') || '';
        that.pending = true;
        this.createBox(0, source, true).then(function () {
            that.pending = false;
            that.values = [];
        });
    }

    updateValue() {
        let values = [];
        for (let input of this.inputs) {
            let value = input.val();
            if (/^[+-]?\d+$/.test(value)) {
                value = parseInt(value);
            } else if (/^[+-]?\d+\.\d+$/.test(value)) {
                value = parseFloat(value);
            }
            values.push(value);
        }
        if (values.length != this.inputs.length) {
            this.qel.val('');
        } else {
            this.qel.val(JSON.stringify(values));
        }
    }

    setValue(strVal) {
        let values = /^\[.*\]$/.test(strVal) ? JSON.parse(strVal) : null;
        if (values !== null) {
            for (let i in values) {
                values[i] = values[i] == 0 ? "" : values[i];
            }
        }
        this.values = values == null ? [] : values;
    }

    update(source = null) {
        let qel = this.qel;
        source = source || qel.data('source');
        qel.data('source', source);
        let deferred = $.Deferred();
        let that = this;
        if (this.pending) {
            setTimeout(function () {
                that.update(source).then(function () {
                    deferred.resolve();
                });
            }, 10);
            return deferred;
        }
        that.pending = true;
        let strVal = String(qel.val() || '');
        this.setValue(strVal);
        this.createBox(0, source, true).then(function () {
            //console.log('gengx渲染全部完成');
            deferred.resolve();
            that.pending = false;
            that.values = [];
        });
        return deferred;
    }

    copyAttribute(box, index) {
        let level = index + 1;
        let qel = this.qel;
        let config = YeeValidate.config;
        let qelName = qel.attr('name') || null;
        //拷贝属性
        for (let key of ['class', 'style', 'readonly', 'disabled', 'size']) {
            let attr = qel.attr(key);
            if (attr) {
                if (key == "class") {
                    attr = attr.replace(config.input_error, '');
                }
                box.attr(key, attr);
            }
        }
        //拷贝验证数据
        for (let key of ['header', 'valid-rule', 'valid-default', 'valid-correct']) {
            let dataName = key + String(level);
            let dataVal = qel.data(dataName) === void 0 ? null : qel.data(dataName);
            if (dataVal !== null) {
                box.data(key, dataVal);
            } else {
                dataName = key + 's';
                dataVal = qel.data(dataName) === void 0 ? null : qel.data(dataName);
                if (dataVal && dataVal[index] !== void 0) {
                    box.data(key, dataVal[index]);
                } else {
                    dataVal = qel.data(key) === void 0 ? null : qel.data(key);
                    if (dataVal !== null) {
                        box.data(key, dataVal);
                    }
                }
            }
        }
        //拷贝名称
        if (this.qelName) {
            let boxName = qel.data('name' + level) || null;
            if (boxName) {
                box.attr('name', boxName);
                if (qelName) {
                    qel.removeAttr('name');
                }
            } else {
                box.attr('name', this.qelName + '[]');
            }
        }
        //是否禁用验证
        if (qel.data('valid-display') !== void 0) {
            box.data('valid-display', qel.data('valid-display'));
        } else {
            box.data('valid-display', '#' + this.qelName + '-validation');
        }
        box.show();
    }

    resetBox(box, index, items = null, force) {
        let deferred = $.Deferred();
        let level = index + 1;
        if (!force) {
            if (this.level !== 0 && level > this.level) {
                return deferred.resolve();
            }
        }
        let that = this;
        //清空选项
        box[0].length = 0;
        //添加头
        let header = box.data('header') || '';
        if (header) {
            if (Yee.isArray(header) && header.length >= 2) {
                box[0].add(new Option(header[1], header[0]));
            } else {
                box[0].add(new Option(header, ''));
            }
        }
        let defVal = '';
        if (this.values != null) {
            defVal = this.values[index] || '';
        }
        if (items !== null) {
            for (let item of items) {
                let data = {value: null, text: null, items: null};
                if (typeof item == 'number' || typeof item == 'string') {
                    data.value = item;
                    data.text = item;
                } else {
                    if (item['value'] !== void 0) {
                        data.value = item.value;
                    } else if (item['v'] !== void 0) {
                        data.value = item.v;
                    } else if (item[0] !== void 0) {
                        data.value = item[0];
                    } else {
                        continue;
                    }
                    if (item['text'] !== void 0) {
                        data.text = item.text;
                    } else if (item['t'] !== void 0) {
                        data.text = item.t;
                    } else if (item[1] !== void 0) {
                        data.text = item[1];
                    } else {
                        data.text = data.value;
                    }
                    if (item['items'] !== void 0) {
                        data.items = item.items;
                    } else if (item['childs'] !== void 0) {
                        data.items = item.childs;
                    } else if (item['c'] !== void 0) {
                        data.items = item.c;
                    } else if (item[2] !== void 0) {
                        data.items = item[2];
                    }
                }
                if (box[0].length == 1 && (data.value === null || data.value === '')) {
                    box[0].length = 0;
                    data.value = '';
                }
                let option = new Option(data.text, data.value);
                box[0].add(option);
                if (defVal == data.value) {
                    option.selected = true;
                }
                option['_childData'] = data.items;
            }
        }
        let selected = box.children(':selected');
        let childItems = (selected.length > 0 && selected[0]['_childData']) ? selected[0]._childData : null;
        if (index + 1 > 10) {
            return deferred.resolve();
        }
        that.createBox(index + 1, childItems).then(function () {
            deferred.resolve();
        });
        return deferred;
    }

    createBox(index = 0, items = null, force) {
        let deferred = $.Deferred();
        if (!force) {
            if (this.level !== 0 && index + 1 > this.level) {
                return deferred.resolve();
            }
        }
        let that = this;
        let inputs = this.inputs;
        let qel = this.qel;
        let method = qel.data('method') || 'get';
        if (typeof items === 'string') {
            if (items == '') {
                that.createBox(index, null, force).then(function () {
                    deferred.resolve();
                });
                return deferred;
            }
            if (YeeLinkage.cacheItemMap[items]) {
                return that.createBox(index, YeeLinkage.cacheItemMap[items], force);
            }
            let info = Yee.parseUrl(items);
            Yee.fetch(info.path, info.param, method).then(function (ret) {
                if (ret.status === true && ret.data) {
                    YeeLinkage.cacheItemMap[items] = ret.data;
                    that.createBox(index, YeeLinkage.cacheItemMap[items], force).then(function () {
                        deferred.resolve();
                    });
                } else {
                    Yee.alert('无法加载远程数据！');
                }
            }).catch(function (e) {
                console.error(e);
            });
            return deferred;
        }

        let clear = function () {
            while (that.inputs.length > 0 && that.inputs.length > index) {
                that.inputs.pop().remove();
            }
        };
        if (index + 1 > 10 || (this.level == 0 && items == null)) {
            clear();
            return deferred.resolve();
        }
        //清空后面的选项
        let box = that.inputs[index] || null;
        if (this.level == 0 || box == null) {
            clear();
            if (!force && this.level == 0) {
                if (items == null || items.length == 0) {
                    return deferred.resolve();
                }
            }
            box = $('<select>');
            if (inputs.length == 0 || index == 0) {
                box.insertAfter(qel);
            } else {
                box.insertAfter(inputs[index - 1]);
            }
            inputs.push(box);
            that.copyAttribute(box, index);
            box.on('change', index + 1, function (ev) {
                let selected = box.children(':selected');
                let childItems = (selected.length > 0 && selected[0]['_childData']) ? selected[0]._childData : null;
                //创建下一个
                that.createBox(ev.data, childItems).then(function () {
                    that.updateValue();
                });
            });
        }
        that.resetBox(box, index, items, force).then(function () {
            deferred.resolve();
        });
        return deferred;
    }
}

YeeLinkage.cacheItemMap = {};

export {YeeLinkage}
