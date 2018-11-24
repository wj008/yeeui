"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class YeeFormTab {
    constructor(elem, setting = {}) {
        let qel = $(elem);
        let currCss = setting.currCss || 'curr';
        let binds = [];
        let lis = qel.find('li');
        let allBinds = [];
        lis.each(function (idx, el) {
            let name = $(el).data('bind-name');
            allBinds.push('div[name="' + name + '"]:first');
            let bind = $('div[name="' + name + '"]').data('idx', idx);
            if (bind.length > 0) {
                binds.push({ name: name, elem: bind });
            }
        });
        lis.on('click', function () {
            let that = $(this);
            let name = that.data('bind-name');
            $(binds).each(function (idx, item) {
                if (item.name == name) {
                    item.elem.show();
                }
                else {
                    item.elem.hide();
                }
            });
            lis.not(that).removeClass(currCss);
            that.addClass(currCss);
            $(window).triggerHandler('resize');
        });
        $('form').on('displayAllError', function (e, items) {
            $(items).each(function () {
                let div = this.elem.parents(allBinds.join(','));
                if (div.length > 0) {
                    let idx = div.data('idx');
                    lis.eq(idx).trigger('click');
                }
                return false;
            });
        });
        lis.first().trigger('click');
    }
}
exports.YeeFormTab = YeeFormTab;
//# sourceMappingURL=yee-form-tab.js.map