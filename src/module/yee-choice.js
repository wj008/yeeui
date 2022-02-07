class YeeChoice {
    constructor(elem) {
        let qel = this.qel = $(elem);
        let that = this;
        setTimeout(function () {
            that.init();
        }, 10)
    }

    init() {
        let qel = this.qel;
        let that = this;
        let name = this.name = qel.data('name') || 'choice';
        let ajax = qel.instance('ajax');
        let dialog = qel.instance('dialog');
        if (ajax) {
            qel.on('before', function (ev, info) {
                let value = that.getValue();
                if (value === null) {
                    return false;
                }
                info.param[name] = value;
            });
        } else if (dialog) {
            qel.on('openDialog', function (ev, info) {
                let value = that.getValue();
                if (value === null) {
                    return false;
                }
                info.param[name] = value;
            });
        } else {
            qel.on('click', function () {
                let value = that.getValue();
                if (value === null) {
                    return false;
                }
                let info = Yee.parseUrl(qel.attr('href') || '');
                info.param[name] = value;
                let url = Yee.toUrl(info);
                qel.attr('href', url);
                return true;
            });
        }
    }

    getValue() {
        let qel = this.qel;
        let name = this.name;
        let emptyMessage = qel.data('empty-message') || '没有勾选任何信息';
        let items = $(':checkbox:checked').filter(function () {
            return $(this).attr('name') == name;
        });
        if (items.length == 0) {
            if (qel.data('alert')) {
                Yee.alert(emptyMessage, {icon: 0});
            } else {
                Yee.msg(emptyMessage, {icon: 0, time: 3000});
            }
            return null;
        }
        let value = [];
        items.each(function (_, el) {
            value.push($(el).val() || '');
        });
        return value.join(',');
    }
}

export {YeeChoice}
