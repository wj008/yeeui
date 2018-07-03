(function ($, Yee) {

    function Remote(el, setting) {
        var elem = $(el);
        var name = elem.attr('name') || '';
        var url = setting('url', '');
        if (name == '' || url == '') {
            return;
        }
        var method = setting('method', 'post').toUpperCase();
        var bind = setting('bind', '');//绑定的名称
        var form = elem.form ? $(elem.form) : $(elem).parents('form:first');
        if (form.length == 0) {
            form = $(document.body);
        }
        var timer = null;
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
                var data = {};
                var value = elem.val();
                data[name] = value;
                if (bind != '') {
                    var arrTemp = bind.split(',');
                    for (var i = 0; i < arrTemp.length; i++) {
                        var xname = arrTemp[i];
                        var qel = form.find(':input[name="' + xname + '"]');
                        if (qel.length > 0) {
                            var val = qel.val() || '';
                            if (qel.length > 0) {
                                var temp = [];
                                qel.filter(':checked').each(function () {
                                    temp.push($(this).val());
                                });
                                val = temp.join(',');
                            }
                            data[xname] = val;
                        } else {
                            var xAars = Yee.parseUrl(window.location.search);
                            if (xAars.prams[xname] !== void 0) {
                                data[xname] = xAars.prams[xname];
                            }
                        }
                    }
                }
                $.ajax({
                    url: url, data: data, type: method, dataType: 'json', success: function (ret) {
                        if (ret.status === true) {
                            elem.data('remoteResult', true);
                            elem.data('remoteMessage', ret.message);
                            if (typeof(elem.setValid) == 'function') {
                                elem.setValid(ret.message);
                            }
                        } else {
                            elem.data('remoteResult', false);
                            elem.data('remoteMessage', ret.error);
                            if (typeof(elem.setError) == 'function') {
                                elem.setError(ret.error);
                            }
                        }
                    }
                });
            }, 5);
        });
    }

    Yee.extend(':input', 'remote', Remote);
})(jQuery, Yee);