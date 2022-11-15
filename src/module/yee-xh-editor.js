class YeeXhEditor {
    constructor(elem) {
        let qel = $(elem);
        let setting = qel.data();
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '180px';
        }
        Yee.use(['xheditor', 'xheditor-lang']).then(function () {
            //@ts-ignore
            qel.xheditor(setting);
        });
    }
}

export {YeeXhEditor}