class YeeDelaySelect {
    constructor(elem) {
        this.qel = null;
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
        let source = qel.data('source') || '';
        let method = qel.data('method') || 'get';
        if (typeof (source) == 'string') {
            if (source === '') {
                that.update([]);
                return;
            }
            let info = Yee.parseUrl(source);
            Yee.fetch(info.path, info.param, method).then(function (ret) {
                if (ret.status === true && ret.data) {
                    that.update(ret.data);
                } else {
                    Yee.alert('无法加载远程数据！');
                }
            }).catch((e) => console.log(e));
        } else if (Yee.isArray(source)) {
            that.update(source);
        }
    }

    initItem(items, value = null) {
        let qel = this.qel;
        let element = qel.get(0);
        value = value === null ? qel.data('value') || '' : value;
        if (items !== null && Yee.isArray(items)) {
            let has = false;
            for (let item of items) {
                let opt = {};
                if (typeof (item) === 'number' || typeof (item) === 'string') {
                    opt.value = item;
                    opt.text = item;
                } else {
                    if (item['value'] !== void 0) {
                        opt.value = item.value;
                    } else if (item[0] !== void 0) {
                        opt.value = item[0];
                    } else {
                        continue;
                    }
                    if (item['text'] !== void 0) {
                        opt.text = item.text;
                    } else if (item[1] !== void 0) {
                        opt.text = item[1];
                    } else {
                        opt.text = opt.value;
                    }
                    if (item['data_url'] !== void 0) {
                        opt.data_url = item.text;
                    }
                }
                if (element.length == 1 && (opt.value === null || opt.value === '')) {
                    element.length = 0;
                    opt.value = '';
                }
                let option = new Option(opt.text, opt.value);
                element.add(option);
                if (opt.data_url !== void 0) {
                    $(option).data('url', opt.data_url);
                }
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
        let that = this;
        let qel = this.qel;
        let method = qel.data('method') || 'get';
        if (typeof items == 'string') {
            let source = items;
            if (source === '') {
                that.update([]);
                return;
            }
            let info = Yee.parseUrl(source);
            Yee.fetch(info.path, info.param, method).then(function (ret) {
                if (ret.status === true && ret.data) {
                    that.update(ret.data);
                } else {
                    Yee.alert('无法加载远程数据！');
                }
            }).catch((e) => console.log(e));
            return;
        }
        let element = qel.get(0);
        element.length = 0;
        let header = qel.data('header') || '';
        //添加头部
        if (header) {
            if (typeof header == 'string') {
                element.add(new Option(header, ''));
            } else if (typeof header == 'object' && header.text) {
                element.add(new Option(header.text, header.value || ''));
            } else if (Yee.isArray(header) && header.length >= 2) {
                element.add(new Option(header[1], header[0]));
            }
        }
        this.initItem(items, value);
    }
}

export {YeeDelaySelect}