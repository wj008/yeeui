(function ($, Yee) {
    //配置信息------------------
    var Config = {
        //-CSS--------------------------
        field_error: 'field-error'
        , field_valid: 'field-valid'
        , field_default: 'field-default'
        , input_error: 'input-error'
        , input_valid: 'input-valid'
        , input_default: 'input-default'
        //消息配置----------------------
        , message_required: '必选字段'
        , message_email: '请输入正确格式的电子邮件'
        , message_url: '请输入正确格式的网址'
        , message_date: '请输入正确格式的日期'
        , message_number: '仅可输入数字'
        , message_integer: '只能输入整数'
        , message_equalto: '请再次输入相同的值'
        , message_maxlength: '请输入一个 长度最多是 {0} 的字符串'
        , message_minlength: '请输入一个 长度最少是 {0} 的字符串'
        , message_rangelength: '请输入 一个长度介于 {0} 和 {1} 之间的字符串'
        , message_range: '请输入一个介于 {0} 和 {1} 之间的值'
        , message_max: '请输入一个小于 {0} 的值'
        , message_min: '请输入一个大于 {0} 的值'
        , message_regex: '请输入正确格式字符'
        , message_mobile: '手机号码格式不正确'
        , message_idcard: '身份证号码格式不正确'
        , message_money: '仅可输入带有2位小数以内的数字及整数'
        , message_minsize: '至少需要选择 {0} 项'
        , message_maxsize: '至多可以选择 {0} 项'
        , message_rangesize: '请选择 {0} 到 {1} 项'
    };

    var Util = {
        findRBox: function (elem) {
            if (!(elem.is(':radio') || elem.is(':checkbox'))) {
                return null;
            }
            var name = elem.attr('name');
            var form = elem.get(0).form ? $(elem.get(0).form) : elem.parents('form:first');
            var ckbox = elem.is(':radio') ? form.find(':radio[name="' + name + '"]') : form.find(':checkbox[name="' + name + '"]');
            return ckbox.length > 0 ? ckbox : null;
        },
        randomString: function (len) {
            len = len === void 0 ? 32 : len;
            var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            var maxPos = chars.length;
            var run = '';
            for (var i = 0; i < len; i++) {
                run += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return run;
        },
        stringFormat(str, args) {
            var args = args;
            if (str == '' || str == null || args == void 0) {
                return str;
            }
            if (!$.isArray(args)) {
                args = [args];
            }
            return str.replace(/\{(\d+)\}/ig, function ($0, $1) {
                var index = parseInt($1);
                return args.length > index ? args[index] : '';
            });
        },
        getTipLabel(elem) {
            var label = null;
            var id = elem.attr('id') || null;
            var forId = elem.data('val-for') || null;
            if (!forId) {
                if (id === '' || id === null) {
                    forId = null;
                } else {
                    forId = '#' + id + '-validation';
                    elem.data('val-for', forId);
                }
            }
            if (forId) {
                label = $(forId.replace(/(:|\.)/g, '\\$1'));
                if (label.length == 0) {
                    id = forId.substr(1);
                    label = $('<span id="' + id + '"></span>').appendTo(elem.parent());
                }
            } else {
                id = Util.randomString(20);
                label = $('<span id="temp-validation-' + id + '"></span>').appendTo(elem.parent());
                elem.data('val-for', '#temp-validation-' + id);
            }
            return label;
        }
    };

    var funcManager = {
        funcs: {
            'required': function (val, bwo) {
                if (this.is(':radio') || this.is(':checkbox')) {
                    var boxs = Util.findRBox(this);
                    if (boxs == null) {
                        return false;
                    }
                    if (boxs.filter(':checked').length == 0) {
                        return false;
                    }
                    return true;
                }
                if (val === null) {
                    return false;
                }
                if (bwo === 1) {
                    val = val.replace(/\s+/, '');
                }
                if (bwo === 2) {
                    val = val.replace(/<[^>]+>/, '');
                    val = val.replace(/\s+/, '');
                }
                return !(val === null || val === '' || val.length === 0);
            },
            'email': function (val) {
                return /^([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,8}([\.][a-zA-Z]{2,8})?$/.test(val);
            },
            'number': function (val) {
                return /^[\-\+]?((\d+(\.\d*)?)|(\.\d+))$/.test(val);
            },
            'integer': function (val) {
                return /^[\-\+]?\d+$/.test(val);
            },
            'max': function (val, num, noeq) {
                if (noeq === true)
                    return val < Number(num);
                else
                    return val <= Number(num);
            },
            'min': function (val, num, noeq) {
                if (noeq === true)
                    return val > Number(num);
                else
                    return val >= Number(num);
            },
            'range': function (val, num1, num2, noeq) {
                if (noeq === false) {
                    return val > Number(num1) && val < Number(num2);
                } else {
                    return val >= Number(num1) && val <= Number(num2);
                }
            },
            'minlength': function (val, len) {
                return val.length >= len;
            },
            'maxlength': function (val, len) {
                return val.length <= len;
            },
            'rangelength': function (val, len1, len2) {
                return val.length >= len1 && val.length <= len2;
            },
            'minsize': function (val, len) {
                var length = 0;
                if (this.is(':radio') || this.is(':checkbox')) {
                    var boxs = Util.findRBox(this);
                    if (boxs !== null) {
                        length = boxs.filter(':checked').length;
                    }
                }
                return length >= len;
            },
            'maxsize': function (val, len) {
                var length = 0;
                if (this.is(':radio') || this.is(':checkbox')) {
                    var boxs = Util.findRBox(this);
                    if (boxs !== null) {
                        length = boxs.filter(':checked').length;
                    }
                }
                return length <= len;
            },
            'rangesize': function (val, len1, len2) {
                var length = 0;
                if (this.is(':radio') || this.is(':checkbox')) {
                    var boxs = Util.findRBox(this);
                    if (boxs !== null) {
                        length = boxs.filter(':checked').length;
                    }
                }
                return length >= len1 && length <= len2;
            },
            'money': function (val) {
                return /^[-]{0,1}\d+[\.]\d{1,2}$/.test(val) || /^[-]{0,1}\d+$/.test(val);
            },
            'date': function (val) {
                return /^\d{4}-\d{1,2}-\d{1,2}(\s\d{1,2}(:\d{1,2}(:\d{1,2})?)?)?$/.test(val);
            },
            'url': function (val, h) {
                if (h && val == '#') {
                    return true;
                }
                return /^(http|https|ftp):\/\/\w+\.\w+/i.test(val);
            },
            'equal': function (val, str) {
                return String(val) == String(str);
            },
            'notequal': function (val, str) {
                return String(val) != String(str);
            },
            'equalto': function (val, str) {
                return val == $(str).val();
            },
            'mobile': function (val) {
                return /^1[3456789]\d{9}$/.test(val);
            },
            'idcard': function (val) {
                return /^[1-9]\d{5}(19|20)\d{2}(((0[13578]|1[02])([0-2]\d|30|31))|((0[469]|11)([0-2]\d|30))|(02[0-2][0-9]))\d{3}(\d|X|x)$/.test(val);
            },
            'regex': function (val, str) {
                var re = new RegExp(str).exec(val);
                return (re && (re.index === 0) && (re[0].length === val.length));
            }
        },
        shortName: {
            'num': 'number',
            'r': 'required',
            'int': 'integer',
            'digits': 'integer',
            'minlen': 'minlength',
            'maxlen': 'maxlength',
            'rangelen': 'rangelength',
            'eqto': 'equalto',
            'eq': 'equal',
            'neq': 'notequal'
        },
        getFunc: function (name) {
            return this.funcs[name] || null;
        },
        getOirName: function (key) {
            if (this.shortName[key])
                return this.shortName[key];
            return key;
        },
        getOirRules: function (rules) {
            var tempRules = {};
            //先加入required
            for (var key in rules) {
                var oir_key = this.getOirName(key);
                if (oir_key === 'required') {
                    tempRules[oir_key] = rules[key];
                    break;
                }
            }
            //在加入其他
            for (var key in rules) {
                var oir_key = this.getOirName(key);
                if (oir_key !== 'required') {
                    tempRules[oir_key] = rules[key];
                }
            }
            return tempRules;
        },
        getOirMessages: function (rules, messages) {
            var tempMessages = {};
            for (var key in messages) {
                var oir_key = this.getOirName(key);
                tempMessages[oir_key] = messages[key];
            }
            for (var key in rules) {
                var oir_key = this.getOirName(key);
                if (!tempMessages[oir_key] && Config['message_' + oir_key]) {
                    tempMessages[oir_key] = Config['message_' + oir_key];
                }
            }
            return tempMessages;
        },
        regFunc: function (name, fn, defmsg) {
            if (typeof (fn) === 'function') {
                this.funcs[name] = fn;
                if (typeof (defmsg) !== 'undefined') {
                    Config['message_' + name] = defmsg;
                }
            } else if (typeof (fn) === 'string') {
                this.shortName[name] = fn;
            }
        }
    };

    var getFieldData = function (elem) {
        var data = elem.data();
        if (!data['val']) {
            return null;
        }
        data['valOff'] = data['valOff'] === true || data['valOff'] === 'true' || data['valOff'] === 1;
        data['valMsg'] = data['valMsg'] || {};
        var ret = {
            rules: funcManager.getOirRules(data['val']),
            valMsg: funcManager.getOirMessages(data['val'], data['valMsg']),
            valDefault: data['valDefault'] || '',
            valValid: data['valValid'] || '',
            valError: data['valError'] || '',
            valOff: data['valOff'],
            errType: null,
            pass: true
        };
        return ret;
    }

    function Validate(form, setting) {
        var self = this;
        var qform = this.form = $(form);
        var validateMode = setting('mode', 0);
        var tempValFors = {};
        this.fields = null;
        //获取所有输入字段
        this.getFields = function (force) {
            if (!force && self.fields != null) {
                return self.fields;
            }
            self.fields = [];
            for (var i = 0; i < form.elements.length; i++) {
                self.fields.push(form.elements.item(i));
            }
            self.fields = $(self.fields).filter(':input[type!=submit][type!=reset][type!=button]').not(':disabled');
            return self.fields;
        }
        //初始化字段,页面第一次加载
        this.initField = function (elem) {
            //如果初始化了就不再初始化
            if (elem.data('yee-validate-init')) {
                return;
            }
            elem.data('yee-validate-init', true);
            //显示默认
            if (elem.data('valDefault')) {
                self.setDefault(elem, elem.data('valDefault'));
            }
            //错误显示
            if (elem.data('valError')) {
                self.setError(elem, elem.data('valError'));
                elem.removeData('valError');
            }
            var input = function (ev) {
                var data = getFieldData(elem);
                if (!data || data['valOff']) {
                    return true;
                }
                data = self.checkElem(elem, data);
                if (data.pass) {
                    elem.data('normalResult', true);
                    if (data.valDefault) {
                        elem.setDefault(data.valDefault);
                    } else {
                        elem.setDefault();
                    }
                } else {
                    elem.data('normalResult', false);
                    if ('required' == data.errType) {
                        return true;
                    }
                    var msg = data.valMsg[data.errType] || '';
                    msg = Util.stringFormat(msg, data.rules[data.errType]);
                    elem.setError(msg);
                }
            }
            if (elem.is(':checkbox') || elem.is(':radio')) {
                var boxs = Util.findRBox(elem);
                if (boxs) {
                    boxs.on('click', input);
                }
            } else {
                elem.on('input', input);
            }
        }
        this.checkElem = function (elem, data) {
            var val = elem.val();
            var rules = data.rules;
            if (elem.is(':checkbox') || elem.is(':radio')) {
                var boxs = Util.findRBox(elem);
                val = '';
                if (boxs) {
                    var vitem = [];
                    boxs.filter(':checked').each(function (idx, em) {
                        vitem.push($(em).val());
                    });
                    val = vitem.join(',');
                }
            }
            for (var key in rules) {
                var func = funcManager.getFunc(key);
                if (!func || typeof (func) !== 'function') {
                    continue;
                }
                //验证非空====
                if ((key === 'required') && rules[key] !== false && !func.call(elem, val, rules[key])) {
                    data.errType = key;
                    data.pass = false;
                }
                if (!data.pass && !rules['force'] && val === '') {
                    return data;
                }
                var args = rules[key];
                if (!$.isArray(args)) {
                    args = [args];
                }
                args = args.slice(0);
                args.unshift(val);
                if (!func.apply(elem, args)) {
                    data.errType = key;
                    data.pass = false;
                    return data;
                }
            }
            return data;
        }
        this.checkForm = function (suspend) {
            if (qform.emit('beforeValid') === false) {
                return false;
            }
            tempValFors = {};
            var errItems = [];
            var inputs = this.getFields();
            inputs.each(function (index, element) {
                var elem = $(element);
                var data = getFieldData(elem);
                if (!data || data.valOff) {
                    return;
                }
                data = self.checkElem(elem, data);
                //如果远程检查错误
                if (!data.pass) {
                    var msg = data.valMsg[data.errType] || '';
                    msg = Util.stringFormat(msg, data.rules[data.errType]);
                    errItems.push({elem: elem, msg: msg});
                } else {
                    if (elem.getModuleInstance('remote')) {
                        if (elem.data('remoteResult') == false) {
                            errItems.push({elem: elem, msg: elem.data('remoteMessage') || '检查数据不符'});
                        } else {
                            self.setValid(elem, elem.data('remoteMessage') || '');
                        }
                    } else {
                        self.setValid(elem, data.valValid);
                    }
                }
                if (errItems.length > 0 && suspend === true) {
                    return false;
                }
            });
            if (errItems.length > 0) {
                self.displayAllError(errItems);
            }
            return errItems.length == 0;
        }
        this.setFocus = function (elem) {
            try {
                if (elem.is(':hidden')) {
                    elem.emit('focus');
                } else {
                    elem.trigger('focus');
                }
            } catch (e) {
                elem.emit('focus');
            }
        }
        this.displayAllError = function (errItems) {
            if (!errItems || errItems.length == 0) {
                return;
            }
            var firstElem = errItems[0].elem;
            if (validateMode == 0) {
                setTimeout(function () {
                    self.setFocus(firstElem);
                }, 10);
            }
            if (qform.emit('displayAllError', errItems) === false) {
                return;
            }
            if (validateMode == 1) {
                var errors = [];
                $(errItems).each(function () {
                    errors.push('* ' + this.msg);
                });
                Yee.alert(errors.join('<br/>'), {
                    title: '错误提示',
                    icon: 7,
                    anim: 5
                }, function (idx) {
                    self.setFocus(firstElem);
                    Yee.close(idx);
                });
            }
            if (validateMode == 2) {
                var error = errItems[0].msg;
                Yee.alert(error, {
                    title: '错误提示',
                    icon: 7,
                    anim: 5
                }, function (idx) {
                    self.setFocus(firstElem);
                    Yee.close(idx);
                });
            }
            $(errItems).each(function () {
                self.setError(this.elem, this.msg);
            });
        }
        this.setError = function (elem, msg) {
            var forid = elem.data('valFor') || '';
            if (forid !== '') {
                if (tempValFors[forid] === void 0) {
                    tempValFors[forid] = msg;
                } else {
                    msg = tempValFors[forid];
                }
            }
            elem.setError(msg, validateMode);
        }
        this.setDefault = function (elem, msg) {
            elem.setDefault(msg);
        }
        this.setValid = function (elem, msg) {
            var forid = elem.data('valFor') || '';
            if (forid !== '' && tempValFors[forid] !== void 0) {
                return;
            }
            elem.setValid(msg);
        }

        qform.on('submit', function (ev) {
            if (ev.result === false) {
                return false;
            }
            try {
                return self.checkForm();
            } catch (e) {
                return false;
            }
        });
        qform.on('update', function () {
            self.getFields(true).each(function (index, element) {
                var elem = $(element);
                self.initField(elem);
            });
        });
        qform.emit('update');
    }

    //显示错误
    $.fn.setError = function (msg, mode) {
        this.each(function (idx, el) {
            var elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            var ckBoxs = Util.findRBox(elem) || elem;
            ckBoxs.removeClass(Config.input_valid + ' ' + Config.input_default).addClass(Config.input_error);
            if (mode == 1 || mode == 2) {
                return;
            }
            if (msg) {
                var label = Util.getTipLabel(elem);
                label.removeClass(Config.field_valid + ' ' + Config.field_default).addClass(Config.field_error);
                label.show();
                label.html(msg);
            }
        });
    }
    //显示正确
    $.fn.setDefault = function (msg) {
        this.each(function (idx, el) {
            var elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            var ckBoxs = Util.findRBox(elem) || elem;
            ckBoxs.removeClass(Config.input_error + ' ' + Config.input_valid).addClass(Config.input_default);
            var label = Util.getTipLabel(elem);
            label.removeClass(Config.field_error + ' ' + Config.field_valid).addClass(Config.field_default);
            if (msg) {
                label.html(msg);
                label.show();
            } else {
                label.hide();
            }
        });
    }
    //显示正确
    $.fn.setValid = function (msg) {
        this.each(function (idx, el) {
            var elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            var ckBoxs = Util.findRBox(elem) || elem;
            ckBoxs.removeClass(Config.input_error + ' ' + Config.input_default).addClass(Config.input_valid);
            if (msg) {
                var label = Util.getTipLabel(elem);
                label.show();
                label.removeClass(Config.field_error + ' ' + Config.field_default).addClass(Config.field_valid);
                label.html(msg);
            } else {
                elem.setDefault();
            }
        });
    }
    //表单检查
    $.fn.checkForm = function () {
        var form = $(this.get(0));
        if (!form.is('form')) {
            return false;
        }
        var instance = form.getModuleInstance('validate');
        if (instance) {
            return instance.checkForm();
        }
        return false;
    }

    //显示错误
    $.fn.showError = function (formError) {
        var form = $(this[0]);
        if (!form.is('form')) {
            return;
        }
        var errItems = [];
        var firstError = null;
        for (var name in formError) {
            if (firstError == null) {
                firstError = formError[name];
            }
            var elem = form.find(":input[name='" + name + "']");
            if (elem.length > 0) {
                var msg = formError[name];
                errItems.push({elem: elem, msg: msg});
            }
        }
        if (errItems.length == 0 && firstError) {
            Yee.alert(firstError, {
                title: '错误提示',
                icon: 7,
                anim: 6
            });
        } else {
            var instance = form.getModuleInstance('validate');
            if (instance) {
                instance.displayAllError(errItems);
            }
        }
    }

    Yee.extend('form', 'validate', Validate);


})(jQuery, Yee);