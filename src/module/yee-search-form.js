class YeeSearchForm {
    constructor(elem) {
        let qel = this.qel = $(elem);
        let that = this;
        this.url = qel.attr('action') || null;
        this.method = qel.attr('method') || 'get';
        this.bind = qel.data('bind') || '#list';
        this.autoUrl = qel.data('auto-url') || 1;
        let list = $(this.bind);
        if (this.url == null && this.autoUrl == 1) {
            this.url = window.location.pathname + '.json';
        }
        this.initForm();
        qel.on('submit', function (ev) {
            if (ev.result === false) {
                return false;
            }
            let sendData = qel.serialize();
            if (list.length > 0) {
                list.each(function () {
                    // @ts-ignore
                    $(this).emit('load', that.url + '?' + sendData, {}, true);
                });
            }
            return false;
        });
    }

    initForm() {
        let args = Yee.parseUrl(window.location.href);
        for (let name in args.param) {
            let box = this.qel.find(':input[name="' + name + '"]');
            if (box.length > 0) {
                if (box.is(':radio') || box.is(':checkbox')) {
                    if (box.val() == args.param[name]) {
                        box.prop("checked", true);
                    }
                } else {
                    box.val(args.param[name]);
                }
            }
        }
    }

    reset() {
        this.qel.get(0).reset();
        this.initForm();
    }
}

export {YeeSearchForm}