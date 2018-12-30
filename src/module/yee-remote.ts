import {Yee} from "../yee";

export class YeeRemote {
    public constructor(el, setting) {
        let elem = $(el);
        let name = elem.attr('name') || '';
        let url = setting.url || '';
        if (name == '' || url == '') {
            return;
        }
        let method = (setting.method || 'post').toUpperCase();
        let bind = setting.bind || '';//绑定的名称
        // @ts-ignore
        let form = elem.form ? $(elem.form) : $(elem).parents('form:first');
        if (form.length == 0) {
            form = $(document.body);
        }
        let timer = null;
        elem.on('change', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            //先保住其他判断无错
            timer = window.setTimeout(function () {
                if (!elem.data('normalResult')) {
                    return;
                }
                let data = {};
                let value = elem.val();
                data[name] = value;
                if (bind != '') {
                    let arrTemp = bind.split(',');
                    for (let i = 0; i < arrTemp.length; i++) {
                        let key = arrTemp[i];
                        let qel = form.find(':input[name="' + key + '"]');
                        if (qel.length > 0) {
                            let val = qel.val() || '';
                            if (qel.length > 0) {
                                let temp = [];
                                qel.filter(':checked').each(function () {
                                    temp.push($(this).val());
                                });
                                val = temp.join(',');
                            }
                            data[key] = val;
                        } else {
                            let urlInfo = Yee.parseUrl(window.location.search);
                            if (urlInfo.param[key] !== void 0) {
                                data[key] = urlInfo.param[key];
                            }
                        }
                    }
                }
                $.ajax({
                    url: url, data: data, type: method, dataType: 'json', success: function (ret) {
                        if (ret.status === true) {
                            elem.data('remoteResult', true);
                            elem.data('remoteMessage', ret.msg);
                            // @ts-ignore
                            if (typeof (elem.setCorrect) == 'function') {
                                // @ts-ignore
                                elem.setCorrect(ret.msg);
                            }
                        } else {
                            elem.data('remoteResult', false);
                            elem.data('remoteMessage', ret.msg);
                            // @ts-ignore
                            if (typeof (elem.setError) == 'function') {
                                // @ts-ignore
                                elem.setError(ret.msg);
                            }
                        }
                    }
                });
            }, 5);
        });
    }
}