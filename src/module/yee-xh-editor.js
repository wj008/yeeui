"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeXhEditor {
    constructor(elem, setting) {
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '180px';
        }
        yee_1.Yee.seq(['xheditor', 'xheditor-lang']).then(function () {
            //@ts-ignore
            $(elem).xheditor(setting);
        });
    }
}
exports.YeeXhEditor = YeeXhEditor;
//# sourceMappingURL=yee-xh-editor.js.map