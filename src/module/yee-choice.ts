import {Yee} from "../yee";

export class YeeChoice {
    public constructor(elem, setting: { [p: string]: any } = {}) {
        let qel = $(elem);
        // @ts-ignore
        let obj = qel.instance('ajax');
        let name = setting.name || 'choice';
        let getValue = function () {
            let items = $(':checkbox:checked').filter(function () {
                return $(this).attr('name') == name;
            });
            if (items.length == 0) {
                Yee.msg('没有选择任何选项', {icon: 0, time: 2000});
                return null;
            }
            let value = [];
            items.each(function (_, el) {
                value.push($(el).val() || '');
            });
            return value.join(',');
        }
        if (obj) {
            qel.on('before', function (ev, info) {
                let value = getValue();
                if (value === null) {
                    return false;
                }
                info.param[name] = value;
            });
        } else {
            qel.on('click', function () {
                let value = getValue();
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
}
