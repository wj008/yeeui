export class YeeNumber {
    public constructor(elem, setting) {
        let that = $(elem);
        let numberScale = setting.numberScale === void 0 ? -1 : setting.numberScale;
        let lastValue = '';
        let reg = null;
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
    }
}

export class YeeInteger {
    public constructor(elem, setting) {
        let that = $(elem);
        let lastValue = null;
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
    }
}