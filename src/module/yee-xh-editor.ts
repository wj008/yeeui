import {Yee} from "../yee";

export class YeeXhEditor {
    public constructor(elem, setting) {
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '180px';
        }
        Yee.seq(['xheditor', 'xheditor-lang']).then(function () {
            //@ts-ignore
            $(elem).xheditor(setting);
        });
    }
}