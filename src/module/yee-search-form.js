"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeSearchForm {
    constructor(elem, setting) {
        let qel = this.qel = $(elem);
        setting = $.extend({ method: 'get', autoUrl: 1, bind: '#list', url: qel.attr('action') }, setting);
        let list = $(setting.bind);
        if (setting.autoUrl == 1) {
            setting.url = window.location.pathname + '.json';
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
                    $(this).emot('load', setting.url + '?' + sendData, true);
                });
            }
            return false;
        });
    }
    initForm() {
        let args = yee_1.Yee.parseUrl(window.location.href);
        for (let name in args.prams) {
            let box = this.qel.find(':input[name="' + name + '"]');
            if (box.length > 0) {
                if (box.is(':radio') || box.is(':checkbox')) {
                    if (box.val() == args.prams[name]) {
                        box.prop("checked", true);
                    }
                }
                else {
                    box.val(args.prams[name]);
                }
            }
        }
    }
    reset() {
        this.qel.get(0).reset();
        this.initForm();
    }
}
exports.YeeSearchForm = YeeSearchForm;
//# sourceMappingURL=yee-search-form.js.map