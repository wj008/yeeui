import {YeeValidate} from "./yee-validate";
import {Yee} from "../yee";

export class YeeLinkage {

    public static cacheItemMap: { [p: string]: any } = {};
    private readonly setting: { [p: string]: any } = null;

    private inputs = [];
    private readonly qel = null;
    private level = 0;
    private values = [];
    private pending = null;

    public constructor(elem, setting: { [p: string]: any } = {}) {
        this.setting = setting = $.extend({
            source: null,
            method: 'get',
            level: 0,
            group: null
        }, setting, Yee.getElemData(elem, 'v'));
        let that = this;
        that.level = parseInt(/^\d+$/.test(String(setting.level)) ? String(setting.level) : '0');
        let qel = this.qel = $(elem);
        qel.hide();
        let strVal = String(qel.val() || '');
        let values = /^\[.*\]$/.test(strVal) ? JSON.parse(strVal) : null;
        if (values !== null) {
            for (let i in values) {
                values[i] = values[i] == 0 ? "" : values[i];
            }
        }
        let source = setting.source;
        that.pending = true;
        this.createBox(0, source).then(function () {
            // console.log('渲染全部完成');
            that.pending = false;
        });
    }

    public updateValue() {
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

    public update(source = null) {
        let deferred = $.Deferred();
        let that = this;
        //console.log('update');
        //如果正在渲染
        if (this.pending) {
            setTimeout(function () {
                that.update(source).then(function () {
                    deferred.resolve();
                });
            }, 10);
            return deferred;
        }
        that.pending = true;
        let qel = this.qel;
        let strVal = String(qel.val() || '');
        let values = /^\[.*\]$/.test(strVal) ? JSON.parse(strVal) : null;
        if (values !== null) {
            for (let i in values) {
                values[i] = values[i] == 0 ? "" : values[i];
            }
        }
        this.values = values;
        source = source || that.setting.source;
        this.createBox(0, source).then(function () {
            //console.log('gengx渲染全部完成');
            deferred.resolve();
            that.pending = false;
        });
        return deferred;
    }

    private copyAttribute(box, index) {
        let level = index + 1;
        let qel = this.qel;
        let setting = this.setting;
        let config = YeeValidate.config;
        let valGroup = setting.group;
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
        for (let key of ['header', 'rule', 'message', 'default', 'correct']) {
            let dataName = key + String(level);
            let dataVal = setting[dataName] === void 0 ? null : setting[dataName];
            if ((key == 'rule' || key == 'message') && valGroup && valGroup.rule) {
                if (valGroup.rule[index] && key == 'rule') {
                    box.data('v@rule', valGroup.rule[index]);
                    continue;
                }
                if (valGroup.message[index] && key == 'message') {
                    box.data('v@message', valGroup.message[index]);
                    continue;
                }
            }
            if (dataVal !== null) {
                if (key == 'header') {
                    box.data(key, dataVal);
                } else {
                    box.data('v@' + key, dataVal);
                }
            } else {
                dataName = key + 's';
                dataVal = setting[dataName] === void 0 ? null : setting[dataName];
                if (dataVal && dataVal[index] !== void 0) {
                    if (key == 'header') {
                        box.data(key, dataVal[index]);
                    } else {
                        box.data('v@' + key, dataVal[index]);
                    }
                } else {
                    dataVal = setting[key] === void 0 ? null : setting[key];
                    if (dataVal !== null) {
                        if (key == 'header') {
                            box.data(key, dataVal);
                        } else {
                            box.data('v@' + key, dataVal);
                        }
                    }
                }
            }
        }
        //拷贝名称
        if (qelName) {
            let boxName = setting['name' + level] || null;
            if (boxName) {
                box.attr('name', boxName);
            } else {
                box.attr('name', qelName + '[]');
            }
        }
        // console.log(setting);
        //是否禁用验证
        if (setting['output'] !== void 0) {
            box.data('v@output', setting['output']);
        } else {
            box.data('v@output', '#' + qelName + '-validation');
        }
        box.show();
        //console.log(box.data());
    }

    private resetBox(box, index, items: Array<any> = null) {
        let deferred = $.Deferred();
        let level = index + 1;
        if (this.level !== 0 && level > this.level) {
            return deferred.resolve();
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
        let defVal = this.values[index] || '';
        if (items !== null) {
            for (let item of items) {
                let data = {value: null, text: null, childs: null};
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
                    if (item['childs'] !== void 0) {
                        data.childs = item.childs;
                    } else if (item['c'] !== void 0) {
                        data.childs = item.c;
                    } else if (item[2] !== void 0) {
                        data.childs = item[2];
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
                option['_childData'] = data.childs;
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

    private createBox(index = 0, items: Array<any> | string = null) {
        let deferred = $.Deferred();
        if (this.level !== 0 && index + 1 > this.level) {
            return deferred.resolve();
        }
        let that = this;
        let inputs = this.inputs;
        let qel = this.qel;
        let method = this.setting.method.toLocaleLowerCase();
        if (typeof items === 'string') {
            if (items == '') {
                return deferred.resolve();
            }
            if (YeeLinkage.cacheItemMap[items]) {
                return that.createBox(index, YeeLinkage.cacheItemMap[items]);
            }
            $[method](items, function (ret) {
                if (ret.status === true && ret.data) {
                    YeeLinkage.cacheItemMap[items] = ret.data;
                    that.createBox(index, YeeLinkage.cacheItemMap[items]).then(function () {
                        deferred.resolve();
                    });
                } else {
                    Yee.alert('无法加载远程数据！');
                }
            }, 'json');
            return deferred;
        }
        if (index + 1 > 10 || (this.level == 0 && items == null)) {
            return deferred.resolve();
        }
        //清空后面的选项
        let box = that.inputs[index] || null;
        if (this.level == 0 || box == null) {
            while (that.inputs.length > 0 && that.inputs.length > index) {
                that.inputs.pop().remove();
            }
            if (this.level == 0) {
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
        that.resetBox(box, index, items).then(function () {
            deferred.resolve();
        });
        return deferred;
    }
}