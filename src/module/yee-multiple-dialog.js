class YeeMultipleDialog {
    constructor(elem) {
        const qel = $(elem).hide();
        const frag = document.createDocumentFragment();
        const textBox = $('<div></div>').appendTo(frag);
        const mode = parseInt(qel.data('mode') || '1');
        let itemsData = qel.data('items') ?? null;
        if (mode !== 2 && itemsData === null) {
            let value = qel.val() ?? '';
            if (/^\[[\w\W]*]$/.test(value)) {
                try {
                    let temp = JSON.parse(value);
                    let temp2 = [];
                    if (Yee.isArray(temp)) {
                        for (let item of temp) {
                            if (typeof item == 'object') {
                                temp2.push(item);
                            } else {
                                item = item + '';
                                temp2.push({value: item, text: item});
                            }
                        }
                    }
                    itemsData = temp2;
                } catch (e) {
                    console.log(e);
                    itemsData = null;
                }
            }
        }
        if (itemsData == null) {
            itemsData = [];
        }
        textBox.attr('class', qel.attr('class'));
        textBox.attr('style', qel.attr('style'));
        textBox.attr('placeholder', qel.attr('placeholder'));
        if (qel.is(':disabled')) {
            textBox.css({'background-color': '#EBEBE4'});
        }
        textBox.show();
        let span = $('<span></span>').appendTo(frag);
        let button = $('<a class="form-btn" href="javascript:;" yee-module="dialog" style="margin-left: 5px">选择</a>').appendTo(span);
        let btnText = qel.data('btn-text');
        if (btnText) {
            button.text(btnText);
        }
        if (qel.is(':disabled')) {
            button.addClass('disabled');
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
        textBox.on('click', function () {
            if (qel.is(':disabled')) {
                return false;
            }
            button.trigger('click');
        });
        let url = qel.data('url') || '';
        button.data('url', url);
        button.data('assign', itemsData);
        button.on('mousedown', function () {
            if (typeof (qel.setDefault) == 'function') {
                qel.setDefault();
            }
        });
        let updateItems = function (data) {
            if (data && Yee.isArray(data)) {
                textBox.empty();
                for (let rs of data) {
                    let item = $('<label><span></span><i class="icofont-close"></i></label>');
                    item.data('value', rs.value || 0);
                    item.data('text', rs.text || 0);
                    item.find('span').text(rs.text);
                    textBox.append(item);
                }
                itemsData = data;
                button.data('assign', data);
            }
        };
        let updateValue = function (data) {
            if (data.length === 0) {
                qel.val('');
                return;
            }
            if (mode === 2) {
                let temp = [];
                for (let item of data) {
                    temp.push(item.value);
                }
                qel.val(JSON.stringify(temp));
            } else {
                qel.val(JSON.stringify(data));
            }
        };
        textBox.on('click', 'label i', function (ev) {
            if (qel.is(':disabled')) {
                return false;
            }
            let item = $(this).parent('label');
            item.remove();
            let tempItems = [];
            textBox.find('label').each(function (idx, elem) {
                let val = $(elem).data('value') || null;
                if (val) {
                    let text = $(elem).data('text') || '';
                    tempItems.push({value: val, text: text});
                }
            });
            if (tempItems.length === 0) {
                updateValue([]);
                updateItems([]);
            } else {
                updateValue(tempItems);
                updateItems(tempItems);
            }
            ev.preventDefault();
            return false;
        });
        updateItems(itemsData);
        button.on('success', function (ev, data) {
            if (qel.is(':disabled')) {
                return false;
            }
            if (data !== void 0 && Yee.isArray(data)) {
                // @ts-ignore
                let ret = qel.emit('select', data);
                if (ret !== null) {
                    updateValue(data);
                    updateItems(data);
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
            if (qel.is(':disabled')) {
                clearBtn.addClass('disabled');
            }
            clearBtn.on('click', function () {
                if (qel.is(':disabled')) {
                    return false;
                }
                qel.val('');
                textBox.empty();
            });
        }
        $(frag).insertAfter(qel);
        setTimeout(function () {
            Yee.render(span);
        }, 10);
    }
}

export {YeeMultipleDialog}
