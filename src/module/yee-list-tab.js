"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeListTab {
    constructor(elem) {
        let qem = $(elem);
        let lis = qem.find('li');
        lis.each(function (idx, el) {
            let a = $(el).find('a');
            let tabIndex = a.data('tab-index') || null;
            if (tabIndex !== null) {
                let href = a.attr('href');
                let ainfo = yee_1.Yee.parseUrl(href);
                ainfo.param['tabIndex'] = tabIndex;
                href = yee_1.Yee.toUrl(ainfo);
                a.attr('href', href);
            }
        });
    }
}
exports.YeeListTab = YeeListTab;
//# sourceMappingURL=yee-list-tab.js.map