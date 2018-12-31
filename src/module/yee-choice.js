"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeChoice {
    constructor(elem, setting = {}) {
        let qel = $(elem);
        // @ts-ignore
        let obj = qel.instance('ajax');
        let name = setting.name || 'choice';
        let getValue = function () {
            let items = $(':checkbox:checked').filter(function () {
                return $(this).attr('name') == name;
            });
            if (items.length == 0) {
                yee_1.Yee.msg('没有选择任何选项', { icon: 0, time: 2000 });
                return null;
            }
            let value = [];
            items.each(function (_, el) {
                value.push($(el).val() || '');
            });
            return value.join(',');
        };
        if (obj) {
            qel.on('before', function (ev, info) {
                let value = getValue();
                if (value === null) {
                    return false;
                }
                info.param[name] = value;
            });
        }
        else {
            qel.on('click', function () {
                let value = getValue();
                if (value === null) {
                    return false;
                }
                let info = yee_1.Yee.parseUrl(qel.attr('href') || '');
                info.param[name] = value;
                let url = yee_1.Yee.toUrl(info);
                qel.attr('href', url);
                return true;
            });
        }
    }
}
exports.YeeChoice = YeeChoice;
//# sourceMappingURL=yee-choice.js.map