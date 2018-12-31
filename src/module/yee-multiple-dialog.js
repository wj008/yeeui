"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeMultipleDialog {
    constructor(elem, setting) {
        let qel = $(elem);
        let textBox = $('<div></div>').insertAfter(qel);
        let textData = qel.data('text') || {};
        textBox.attr('class', qel.attr('class'));
        textBox.attr('style', qel.attr('style'));
        textBox.attr('placeholder', qel.attr('placeholder'));
        qel.hide();
        let span = $('<span></span>').insertAfter(textBox);
        let button = $('<a class="form-btn" href="javascript:;" yee-module="dialog" style="margin-left: 5px">选择</a>').appendTo(span);
        if (setting.btnText) {
            button.text(setting.btnText);
        }
        button.data('carry', '#' + qel.attr('id'));
        if (setting.width) {
            button.data('width', setting.width);
        }
        if (setting.height) {
            button.data('height', setting.height);
        }
        textBox.on('click', function () {
            button.trigger('click');
        });
        button.data('url', setting.href || setting.url || '');
        button.data('assign', { value: qel.val(), text: textData });
        button.on('mousedown', function () {
            // @ts-ignore
            if (typeof (qel.setDefault) == 'function') {
                // @ts-ignore
                qel.setDefault();
            }
        });
        let updateText = function (data) {
            if (data && yee_1.Yee.isArray(data)) {
                textBox.empty();
                for (let rs of data) {
                    let item = $('<label><span></span><i class="icofont-close"></i></label>');
                    item.data('value', rs.value || 0);
                    item.data('text', rs.text || 0);
                    item.find('span').text(rs.text);
                    textBox.append(item);
                }
                textData = data;
                button.data('assign', { value: qel.val(), text: data });
            }
        };
        textBox.on('click', 'label', function () {
            let item = $(this);
            item.remove();
            let values = [];
            let textItems = [];
            textBox.find('label').each(function (idx, elem) {
                let val = $(elem).data('value') || null;
                if (val) {
                    values.push(val);
                    let text = $(elem).data('text') || '';
                    textItems.push({ value: val, text: text });
                }
            });
            if (values.length == 0) {
                qel.val('');
                updateText([]);
            }
            else {
                qel.val(JSON.stringify(values));
                updateText(textItems);
            }
        });
        updateText(textData);
        button.on('success', function (ev, data) {
            if (data && data.value && data.text) {
                // @ts-ignore
                let ret = qel.emit('select', data);
                if (ret !== null) {
                    if (typeof (data.value) == 'string' || typeof (data.value) == 'number') {
                        qel.val(data.value);
                    }
                    else if (data.value instanceof Array) {
                        if (data.value == 0) {
                            qel.val('');
                        }
                        else {
                            qel.val(JSON.stringify(data.value));
                        }
                    }
                    updateText(data.text);
                    // @ts-ignore
                    if (typeof qel.setDefault == 'function') {
                        // @ts-ignore
                        qel.setDefault();
                    }
                }
            }
        });
        if (setting.clearBtn) {
            let clearBtn = $('<a class="form-btn" href="javascript:;" style="margin-left: 5px">清除</a>').appendTo(span);
            clearBtn.on('click', function () {
                qel.val('');
                textBox.val('');
            });
        }
        setTimeout(function () {
            yee_1.Yee.update(span);
        }, 100);
    }
}
exports.YeeMultipleDialog = YeeMultipleDialog;
//# sourceMappingURL=yee-multiple-dialog.js.map