class YeeDelaySelect {
    constructor(elem) {
        this.qel = null;
        let qel = this.qel = $(elem);
        let that = this;
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
        //不存在
        qel.on('change', function () {
            let selected = qel.children(':selected');
            if (selected.length > 0) {
                qel.data('value', selected[0].value);
            }
        });
        qel.on('update', function (ev, option, value) {
            that.update(option, value);
        });
        qel.on('source', function (ev, option, value) {
            that.update(option, value);
        });
        let source = qel.data('source') || '';
        that.update(source, value);
    }

    initItem(items) {
        let qel = this.qel;
        let element = qel.get(0);
        let value = qel.data('value') || null;
        let has = false;
        element.length = 0;

        let header = qel.data('header') || '';
        //添加头部
        if (header) {
            if (typeof header == 'string') {
                let opt = new Option(header, '');
                if (value == '') {
                    has = true;
                    opt.selected = true;
                }
                element.add(opt);
            } else if (typeof header == 'object' && header.text) {
                let optVal = header.value || '';
                let opt = new Option(header.text, header.value || '')
                if (value == optVal) {
                    has = true;
                    opt.selected = true;
                }
                element.add(opt);
            } else if (Yee.isArray(header) && header.length >= 2) {
                let opt = new Option(header[1], header[0]);
                if (value == header[0]) {
                    has = true;
                    opt.selected = true;
                }
                element.add(opt);
            }
        }

        if (items !== null && Yee.isArray(items)) {
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
        }
        return has;
    }

    update(items, value = null) {
        let that = this;
        let qel = this.qel;
        let method = qel.data('method') || 'get';
        if (typeof items == 'string') {
            let source = items;
            if (source === '') {
                that.update([], value);
                return;
            }
            let info = Yee.parseUrl(source);
            Yee.fetch(info.path, info.param, method).then(function (ret) {
                if (ret.status === true && ret.data) {
                    that.update(ret.data, value);
                } else {
                    Yee.alert('无法加载远程数据！');
                }
            }).catch((e) => console.log(e));
            return;
        }
        this.initItem(items, value);
        if (value !== null) {
            qel.data('value', value);
        }
    }
}

export {YeeDelaySelect}
