import {Yee} from "../yee";

export class YeeListTab {

    public constructor(elem) {
        let qem = $(elem);
        let lis = qem.find('li');
        lis.each(function (idx, el) {
            let a = $(el).find('a');
            let tabIndex = a.data('tab-index') || null;
            if (tabIndex !== null) {
                let href = a.attr('href');
                let ainfo = Yee.parseUrl(href);
                ainfo.param['tabIndex'] = tabIndex;
                href = Yee.toUrl(ainfo);
                a.attr('href', href);
            }
        });
    }

}