(function ($) {
    //number 数值输入
    Yee.extend(':input', 'number', function (elem) {
        var that = $(elem);
        var numberScale = that.data('numberScale') || -1;
        var lastValue = '';
        var reg = null;
        if (numberScale > 0) {
            reg = new RegExp('^-?([1-9]\\d*|0)\\.\\d{1,' + numberScale + '}$');
        }
        that.on('keydown', function (ev) {
            if (numberScale < 0) {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                    lastValue = this.value;
                }
            }
            else if (numberScale == 0) {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                    lastValue = this.value;
                }
            }
            else {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || reg.test(this.value)) {
                    lastValue = this.value;
                }
            }
        });
        that.on('keypress keyup', function (ev) {
            if (numberScale < 0) {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || /^-?([1-9]\d*|0)\.\d+$/.test(this.value)) {
                    lastValue = this.value;
                    return true;
                }
            }
            else if (numberScale == 0) {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                    lastValue = this.value;
                    return true;
                }
            }
            else {
                if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value) || /^-?([1-9]\d*|0)\.$/.test(this.value) || reg.test(this.value)) {
                    lastValue = this.value;
                    return true;
                }
            }
            this.value = lastValue || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            if (numberScale < 0) {
                this.value = /^-?([1-9]\d*|0)(\.\d+)?$/.test(this.value) ? this.value : '';
            }
            else if (numberScale == 0) {
                this.value = /^-?([1-9]\d*|0)$/.test(this.value) ? this.value : '';
            } else {
                this.value = reg.test(this.value) ? this.value : '';
            }
        });
    });
    //integer 整数输入
    Yee.extend(':input', 'integer', function (elem) {
        var that = $(elem);
        var lastValue = null;
        that.on('keydown', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                lastValue = this.value;
                return true;
            }
            return false;
        });
        that.on('keypress keyup', function (event) {
            if (this.value == '' || this.value == '-' || /^-?([1-9]\d*|0)$/.test(this.value)) {
                lastValue = this.value;
                return true;
            }
            this.value = lastValue || '';
            return false;
        });
        that.on('dragenter', function () {
            return false;
        });
        that.on('blur', function () {
            this.value = /^-?([1-9]\d*|0)$/.test(this.value) ? this.value : '';
        });
    });

})(jQuery);