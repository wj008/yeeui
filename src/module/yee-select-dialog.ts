import {Yee} from "../yee";

export class YeeSelectDialog {

    public constructor(elem, setting) {
        let qel = $(elem);
        if (qel.is(':input')) {
            let textBox = $('<input type="text" readonly="readonly"/>').insertAfter(qel);
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
            button.data('assign', {value: qel.val(), text: qel.data('text') || ''});
            textBox.val(qel.data('text') || '');
            button.on('success', function (ev, data) {
                if (data && data.value && data.text) {
                    // @ts-ignore
                    let ret = qel.emit('select', data);
                    if (ret !== null) {
                        qel.val(data.value);
                        textBox.val(data.text);
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
                Yee.update(span);
            }, 100);

        } else if (qel.is('a')) {
            qel.on('click', function () {
                let data = $(this).data() || null;
                Yee.readyDialog(function (dialog: DialogHandle) {
                    dialog.success(data);
                    dialog.close();
                })
            });
        }
    }

}