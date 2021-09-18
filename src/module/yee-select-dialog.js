class YeeSelectDialog {
    constructor(elem) {
        let qel = $(elem);
        if (qel.is(':input')) {
            let frag = document.createDocumentFragment();
            let textBox = $('<input type="text" readonly="readonly"/>').appendTo(frag);
            textBox.attr('class', qel.attr('class'));
            textBox.attr('style', qel.attr('style'));
            textBox.attr('placeholder', qel.attr('placeholder'));
            let mode = parseInt(qel.data('mode') || 1);
            let value = qel.val() || '';
            value = value.toString();
            if (mode != 2 && value == '[]') {
                value = '';
            }
            let text = qel.data('text') || '';
            let itemData = {value: value, text: text};
            if (mode != 2) {
                if (/^\{/.test(value) && /\}$/.test(value)) {
                    try {
                        let temp = JSON.parse(value);
                        if (temp['value'] !== void 0 && temp['text'] !== void 0) {
                            itemData = temp;
                        }
                    } catch (e) {
                    }
                }
            }
            let span = $('<span></span>').insertAfter(textBox);
            let button = $('<a class="form-btn" href="javascript:;" yee-module="dialog" style="margin-left: 5px">选择</a>').appendTo(span);

            textBox.on('click', function () {
                button.trigger('click');
            });
            button.data('assign', itemData);
            textBox.val(itemData.text);
            let update = function () {
                if (qel.is(':disabled')) {
                    button.addClass('disabled');
                    textBox.prop('disabled', true);
                } else {
                    button.removeClass('disabled');
                    textBox.prop('disabled', false);
                }
                let url = qel.data('url') || '';
                button.data('url', url);
                let btnText = qel.data('btn-text');
                if (btnText) {
                    button.text(btnText);
                }
                button.data('carry', '#' + qel.attr('id'));
                let width = qel.data('width') || 0;
                if (width) {
                    button.data('width', width);
                }
                let height = qel.data('height') || 0;
                if (height) {
                    button.data('height', height);
                }
            }
            update();
            qel.on('update', update);
            let updateValue = function (data) {
                textBox.val(data.text || '');
                if ((data.value === '' || data.value === null) && (data.text === null || data.text === '')) {
                    qel.val('');
                    return;
                }
                if (mode == 2) {
                    qel.val(data.value);
                    return;
                } else {
                    qel.val(JSON.stringify(data));
                }
            };
            button.on('success', function (ev, data) {
                if (data) {
                    // @ts-ignore
                    let ret = qel.emit('select', data);
                    if (ret !== null) {
                        updateValue(data);
                        // @ts-ignore
                        if (typeof qel.setDefault == 'function') {
                            // @ts-ignore
                            qel.setDefault();
                        }
                    }
                }
            });
            let clearBtn = qel.data('clear-btn');
            if (clearBtn) {
                let clearBtn = $('<a class="form-btn" href="javascript:;" style="margin-left: 5px">清除</a>').appendTo(span);
                clearBtn.on('click', function () {
                    qel.val('');
                    textBox.val('');
                    qel.emit('clear');
                });
            }
            $(frag).insertAfter(qel);
            setTimeout(function () {
                Yee.render(span);
            }, 10);
        } else if (qel.is('a')) {
            qel.on('click', function () {
                let data = $(this).data() || null;
                Yee.readyDialog(function (dialog) {
                    dialog.success(data);
                    dialog.close();
                });
            });
        }
    }
}

export {YeeSelectDialog}