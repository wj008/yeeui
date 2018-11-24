import {Yee} from "../yee";

export class YeeValidate {

    /**
     * 配置项
     */
    public static config: { [p: string]: string } = {
        field_error: 'yee-field-error'
        , field_correct: 'yee-field-correct'
        , field_default: 'yee-field-default'
        , input_error: 'yee-input-error'
        , input_correct: 'yee-input-correct'
        , input_default: 'yee-input-default'
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

    /**
     * 函数表
     */
    private static funcMap: { [p: string]: Function } = {
        'required': function (val, bwo) {
            if (this.is(':radio') || this.is(':checkbox')) {
                let rcBox = YeeValidate.findRcBox(this);
                if (rcBox == null) {
                    return false;
                }
                if (rcBox.filter(':checked').length == 0) {
                    return false;
                }
                return true;
            }
            if (val === null) {
                return false;
            }
            if (bwo === 1) {
                val = String(val).replace(/\s+/, '');
            }
            if (bwo === 2) {
                val = String(val).replace(/<[^>]+>/, '');
                val = String(val).replace(/\s+/, '');
            }
            return !(val === null || val === '' || val.length === 0);
        },
        'email': function (val) {
            return /^([a-zA-Z0-9]+[-_.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-_.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,8}([.][a-zA-Z]{2,8})?$/.test(val);
        },
        'number': function (val) {
            return /^[-+]?((\d+(\.\d*)?)|(\.\d+))$/.test(val);
        },
        'integer': function (val) {
            return /^[-+]?\d+$/.test(val);
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
            let length = 0;
            if (this.is(':radio') || this.is(':checkbox')) {
                let rcBox = YeeValidate.findRcBox(this);
                if (rcBox !== null) {
                    length = rcBox.filter(':checked').length;
                }
            }
            return length >= len;
        },
        'maxsize': function (val, len) {
            let length = 0;
            if (this.is(':radio') || this.is(':checkbox')) {
                let rcBox = YeeValidate.findRcBox(this);
                if (rcBox !== null) {
                    length = rcBox.filter(':checked').length;
                }
            }
            return length <= len;
        },
        'rangesize': function (val, len1, len2) {
            let length = 0;
            if (this.is(':radio') || this.is(':checkbox')) {
                let rcBox = YeeValidate.findRcBox(this);
                if (rcBox !== null) {
                    length = rcBox.filter(':checked').length;
                }
            }
            return length >= len1 && length <= len2;
        },
        'money': function (val) {
            return /^[-]?\d+[\.]\d{1,2}$/.test(val) || /^[-]?\d+$/.test(val);
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
            let re = new RegExp(str).exec(val);
            return (re && (re.index === 0) && (re[0].length === val.length));
        }
    };
    /**
     * 简写表
     */
    private static shortName: { [p: string]: string } = {
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
    };

    /**
     * 查找 radio 和checkbox
     * @param elem
     */
    public static findRcBox(elem) {
        if (!(elem.is(':radio') || elem.is(':checkbox'))) {
            return null;
        }
        let name = elem.attr('name');
        let form = elem.get(0).form ? $(elem.get(0).form) : elem.parents('form:first');
        let rcBox = elem.is(':radio') ? form.find(':radio[name="' + name + '"]') : form.find(':checkbox[name="' + name + '"]');
        return rcBox.length > 0 ? rcBox : null;
    }

    /**
     * 生成随机数
     * @param len
     */
    public static randomString(len = 32) {
        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        let maxPos = chars.length;
        let run = '';
        for (let i = 0; i < len; i++) {
            run += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return run;
    }

    /**
     * 字符格式化
     * @param str
     * @param args
     */
    public static stringFormat(str, args) {
        if (str == '' || str == null || args == void 0) {
            return str;
        }
        if (!Yee.isArray(args)) {
            args = [args];
        }
        return String(str).replace(/\{(\d+)\}/ig, function ($0, $1) {
            let index = parseInt($1);
            return args.length > index ? args[index] : '';
        });
    }

    /**
     * 获取提示标签
     * @param elem
     */
    public static getOutputLabel(elem) {
        let label = null;
        let id = elem.attr('id') || null;
        let data = YeeValidate.getFieldData(elem);
        let output = data.output;
        if (!output) {
            if (id === '' || id === null) {
                output = null;
            } else {
                output = '#' + id + '-validation';
                elem.data('v@output', output);
            }
        }
        if (output) {
            label = $(String(output).replace(/(:|\.)/g, '\\$1'));
            if (label.length == 0) {
                id = output.substr(1);
                label = $('<span id="' + id + '"></span>').appendTo(elem.parent());
            }
        } else {
            id = YeeValidate.randomString(20);
            label = $('<span id="temp-validation-' + id + '"></span>').appendTo(elem.parent());
            elem.data('v@output', '#temp-validation-' + id);
        }
        return label;
    }

    /**
     * 获取方法
     * @param name
     */
    public static getFunc(name) {
        return YeeValidate.funcMap[name] || null;
    }

    /**
     * 获取原名
     * @param key
     */
    public static getOirName(key) {
        if (YeeValidate.shortName[key]) {
            return YeeValidate.shortName[key];
        }
        return key;
    }

    /**
     * 获取原规则
     * @param rule
     */
    public static getOirRules(rule) {
        let tempRules = {};
        //先加入required
        for (let key in rule) {
            let oir_key = YeeValidate.getOirName(key);
            if (oir_key === 'required') {
                tempRules[oir_key] = rule[key];
                break;
            }
        }
        //在加入其他
        for (let key in rule) {
            let oir_key = YeeValidate.getOirName(key);
            if (oir_key !== 'required') {
                tempRules[oir_key] = rule[key];
            }
        }
        return tempRules;
    }

    /**
     * 获取原消息
     * @param rule
     * @param messages
     */
    public static getOirMessages(rule, messages) {
        let tempMessages = {};
        for (let key in messages) {
            let oir_key = YeeValidate.getOirName(key);
            tempMessages[oir_key] = messages[key];
        }
        for (let key in rule) {
            let oir_key = YeeValidate.getOirName(key);
            if (!tempMessages[oir_key] && YeeValidate.config['message_' + oir_key]) {
                tempMessages[oir_key] = YeeValidate.config['message_' + oir_key];
            }
        }
        return tempMessages;
    }

    /**
     * 注册函数
     * @param name
     * @param fn
     * @param defMsg
     */
    public static regFunc(name, fn, defMsg = '') {
        if (typeof (fn) === 'function') {
            YeeValidate.funcMap[name] = fn;
            if (typeof (defMsg) !== 'undefined') {
                YeeValidate.config['message_' + name] = defMsg;
            }
        } else if (typeof (fn) === 'string') {
            YeeValidate.shortName[name] = fn;
        }
    }

    /**
     * 获取字段验证数据
     * @param elem
     */
    public static getFieldData = function (elem) {
        let data = Yee.getElemData(elem, 'v');
        //console.log(data);
        data['disabled'] = data['disabled'] === true || data['disabled'] === 'true' || data['disabled'] === 1;
        data['message'] = data['message'] || {};
        let ret = {
            rule: null,
            message: null,
            default: data['default'] || '',
            correct: data['correct'] || '',
            error: data['error'] || '',
            disabled: data['disabled'],
            output: data['output'],
            errType: null,
            pass: true
        };
        if (data['rule']) {
            ret.rule = YeeValidate.getOirRules(data['rule']);
            ret.message = YeeValidate.getOirMessages(data['rule'], data['message']);
        }

        return ret;
    }

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    private fields = null;
    private form = null;
    private tempValFor = null;
    private readonly validateMode;

    public constructor(form, setting) {
        let qForm = this.form = $(form);
        this.validateMode = setting.mode || 0;
        let that = this;
        qForm.on('submit', function (ev) {
            if (ev.result === false) {
                return false;
            }
            try {
                return that.checkForm();
            } catch (e) {
                return false;
            }
        });
        qForm.on('update', function () {
            that.getFields(true).each(function (index, element) {
                let elem = $(element);
                that.initField(elem);
            });
        });
        // @ts-ignore
        qForm.emit('update');
    }

    /**
     * 获取所有字段
     * @param force
     */
    public getFields(force: boolean = false) {
        if (!force && this.fields != null) {
            return this.fields;
        }
        this.fields = [];
        for (let i = 0; i < this.form[0].elements.length; i++) {
            this.fields.push(this.form[0].elements.item(i));
        }
        this.fields = $(this.fields).filter(':input[type!=submit][type!=reset][type!=button]').not(':disabled');
        return this.fields;
    }

    public initField(elem) {
        //如果初始化了就不再初始化
        if (elem.data('yee-validate-init')) {
            return;
        }
        let that = this;
        elem.data('yee-validate-init', true);
        let data = YeeValidate.getFieldData(elem);
        //显示默认
        if (data.default) {
            that.setDefault(elem, data.default);
        }
        //错误显示
        if (data.error) {
            that.setError(elem, data.error);
        }
        let input = function (ev) {
            let data = YeeValidate.getFieldData(elem);
            if (!data || data.rule == null || data['disabled']) {
                return true;
            }
            data = that.checkElem(elem, data);
            if (data.pass) {
                elem.data('normalResult', true);
                if (data.default) {
                    elem.setDefault(data.default);
                } else {
                    elem.setDefault();
                }
            } else {
                elem.data('normalResult', false);
                if ('required' == data.errType) {
                    return true;
                }
                let msg = data.message[data.errType] || '';
                msg = YeeValidate.stringFormat(msg, data.rule[data.errType]);
                elem.setError(msg);
            }
        };
        if (elem.is(':checkbox') || elem.is(':radio')) {
            let rcBox = YeeValidate.findRcBox(elem);
            if (rcBox) {
                rcBox.on('click', input);
            }
        } else {
            elem.on('input', input);
        }
    }

    public checkElem(elem, data) {
        let val = elem.val();
        let rule = data.rule;
        if (elem.is(':checkbox') || elem.is(':radio')) {
            let rcBox = YeeValidate.findRcBox(elem);
            val = '';
            if (rcBox) {
                let vItem = [];
                rcBox.filter(':checked').each(function (idx, em) {
                    vItem.push($(em).val());
                });
                val = vItem.join(',');
            }
        }
        for (let key in rule) {
            let func = YeeValidate.getFunc(key);
            if (!func || typeof (func) !== 'function') {
                continue;
            }
            //验证非空====
            if ((key === 'required') && rule[key] !== false && !func.call(elem, val, rule[key])) {
                data.errType = key;
                data.pass = false;
            }
            if (!data.pass && !rule['force'] && val === '') {
                return data;
            }
            let args = rule[key];
            if (!Yee.isArray(args)) {
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

    public checkForm(suspend: boolean = false) {
        if (this.form.emit('beforeValid') === false) {
            return false;
        }
        let that = this;
        this.tempValFor = {};
        let errItems = [];
        let inputs = this.getFields(true);
        inputs.each(function (index, element) {
            let elem = $(element);
            let data = YeeValidate.getFieldData(elem);
            // console.log(elem, data);
            if (!data || data.rule == null || data.disabled) {
                return;
            }
            data = that.checkElem(elem, data);
            //如果远程检查错误
            if (!data.pass) {
                let msg = data.message[data.errType] || '';
                msg = YeeValidate.stringFormat(msg, data.rule[data.errType]);
                errItems.push({elem: elem, msg: msg});
            } else {
                // @ts-ignore
                if (elem.instance('remote')) {
                    if (elem.data('remoteResult') == false) {
                        errItems.push({elem: elem, msg: elem.data('remoteMessage') || '检查数据不符'});
                    } else {
                        that.setCorrect(elem, elem.data('remoteMessage') || '');
                    }
                } else {
                    that.setCorrect(elem, data.correct);
                }
            }
            if (errItems.length > 0 && suspend === true) {
                return false;
            }
        });
        if (errItems.length > 0) {
            that.displayAllError(errItems);
        }
        return errItems.length == 0;
    }

    public setFocus(elem) {
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

    public displayAllError(errItems) {
        if (!errItems || errItems.length == 0) {
            return;
        }
        let that = this;
        let firstElem = errItems[0].elem;
        if (that.validateMode == 0) {
            setTimeout(function () {
                that.setFocus(firstElem);
            }, 10);
        }
        if (that.form.emit('displayAllError', errItems) === false) {
            return;
        }
        if (that.validateMode == 1) {
            let errors = [];
            $(errItems).each(function () {
                errors.push('* ' + this.msg);
            });
            Yee.alert(errors.join('<br/>'), {
                title: '错误提示',
                icon: 7,
                anim: 5
            }, function (idx) {
                that.setFocus(firstElem);
                Yee.close(idx);
            });
        }
        if (that.validateMode == 2) {
            let error = errItems[0].msg;
            Yee.alert(error, {
                title: '错误提示',
                icon: 7,
                anim: 5
            }, function (idx) {
                that.setFocus(firstElem);
                Yee.close(idx);
            });
        }
        $(errItems).each(function () {
            that.setError(this.elem, this.msg);
        });
    }

    public setError(elem, msg) {
        let data = YeeValidate.getFieldData(elem);
        let output = data.output;
        if (output !== '') {
            if (this.tempValFor[output] === void 0) {
                this.tempValFor[output] = msg;
            } else {
                msg = this.tempValFor[output];
            }
        }
        elem.setError(msg, this.validateMode);
    }

    public setDefault(elem, msg) {
        elem.setDefault(msg);
    }

    /**
     * 设置正确
     * @param elem
     * @param msg
     */
    public setCorrect(elem, msg) {
        let data = YeeValidate.getFieldData(elem);
        let output = data.output;
        if (output !== '' && this.tempValFor[output] !== void 0) {
            return;
        }
        elem.setCorrect(msg);
    }

}

//显示错误
$.fn.extend({
    setError: function (msg = null, mode = 0) {
        this.each(function (_, el) {
            let elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            let config = YeeValidate.config;
            let ckBoxs = YeeValidate.findRcBox(elem) || elem;
            ckBoxs.removeClass(config.input_valid + ' ' + config.input_default).addClass(config.input_error);
            if (mode == 1 || mode == 2) {
                return;
            }
            if (msg) {
                let label = YeeValidate.getOutputLabel(elem);
                label.removeClass(config.field_valid + ' ' + config.field_default).addClass(config.field_error);
                label.show();
                label.html(msg);
            }
        });
    },
    setDefault: function (msg = null) {
        this.each(function (_, el) {
            let elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            let config = YeeValidate.config;
            let ckBoxs = YeeValidate.findRcBox(elem) || elem;
            ckBoxs.removeClass(config.input_error + ' ' + config.input_valid).addClass(config.input_default);
            let label = YeeValidate.getOutputLabel(elem);
            label.removeClass(config.field_error + ' ' + config.field_valid).addClass(config.field_default);
            if (msg) {
                label.html(msg);
                label.show();
            } else {
                label.hide();
            }
        });
    },
    setCorrect: function (msg = null) {
        this.each(function (idx, el) {
            let elem = $(el);
            if (!elem.is(':input')) {
                return;
            }
            let config = YeeValidate.config;
            let ckBoxs = YeeValidate.findRcBox(elem) || elem;
            ckBoxs.removeClass(config.input_error + ' ' + config.input_default).addClass(config.input_valid);
            if (msg) {
                let label = YeeValidate.getOutputLabel(elem);
                label.show();
                label.removeClass(config.field_error + ' ' + config.field_default).addClass(config.field_valid);
                label.html(msg);
            } else {
                // @ts-ignore
                elem.setDefault();
            }
        });
    },
    checkForm: function () {
        let form = $(this.get(0));
        if (!form.is('form')) {
            return false;
        }
        // @ts-ignore
        let instance = form.instance('validate');
        if (instance) {
            return instance.checkForm();
        }
        return false;
    },
    showError: function (formError) {
        let form = $(this[0]);
        if (!form.is('form')) {
            return;
        }
        let errItems = [];
        let firstError = null;
        for (let name in formError) {
            if (firstError == null) {
                firstError = formError[name];
            }
            let elem = form.find(":input[name='" + name + "']");
            if (elem.length > 0) {
                let msg = formError[name];
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
            // @ts-ignore
            let instance = form.instance('validate');
            if (instance) {
                instance.displayAllError(errItems);
            }
        }
    }
});

