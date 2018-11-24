import {Yee} from "../yee";

export class YeeXheditor {
    public constructor(elem, setting) {
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '180px';
        }
        Yee.use('xheditor').then(function () {
            //@ts-ignore
            $(elem).xheditor(setting);
        });
    }
}