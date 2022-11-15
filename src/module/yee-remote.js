class YeeRemote {
    constructor(element) {
        let qel = $(element);
        let name = qel.data('name') || qel.attr('name') || '';
        let url = qel.data('url') || '';
        if (name == '' || url == '') {
            return;
        }
        let method = qel.data('method') || 'post';
        let carry = qel.data('carry') || ''; //绑定的名称
        let form = element.form ? $(element.form) : $(element).parents('form:first');
        if (form.length == 0) {
            form = $(document.body);
        }
        let timer = null;
        qel.on('change', function () {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
            //先保住其他判断无错
            timer = window.setTimeout(function () {
                if (qel.data('yee-validate-init') && !qel.data('normal-result')) {
                    return;
                }
                let data = {};
                let value = qel.val();
                data[name] = value;
                if (carry != '') {
                    Yee.carryData(carry, data, form);
                }
                Yee.fetch(url, data, method).then(function (ret) {
                    if (ret.status === true) {
                        qel.data('remote-result', true);
                        qel.data('remote-message', ret.msg);
                        if (typeof (qel.setCorrect) == 'function') {
                            qel.setCorrect(ret.msg);
                        }
                    } else {
                        qel.data('remote-result', false);
                        qel.data('remote-message', ret.msg);
                        if (typeof (qel.setError) == 'function') {
                            qel.setError(ret.msg);
                        }
                    }
                }).catch((e) => console.log(e));
            }, 5);
        });
    }
}

export {YeeRemote}