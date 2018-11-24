"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeXheditor {
    constructor(elem, setting) {
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '180px';
        }
        yee_1.Yee.use('xheditor').then(function () {
            //@ts-ignore
            $(elem).xheditor(setting);
        });
    }
}
exports.YeeXheditor = YeeXheditor;
//# sourceMappingURL=yee-xheditor.js.map