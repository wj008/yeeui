"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
const yee_template_1 = require("./yee-template");
class YeePagebar {
    constructor(elem, setting) {
        this.qel = null;
        this.setting = null;
        this.templates = [];
        this.bindElem = null;
        let qel = this.qel = $(elem);
        let that = this;
        qel.find('[yee-template]').each(function (_, it) {
            that.templates.push(new yee_template_1.YeeTemplate(it));
        });
        setting = this.setting = $.extend({
            pageSize: 0,
            hidden: 0,
            goPage: 1,
            numPage: 1,
            firstPage: 1,
            lastPage: 1,
            info: null
        }, setting);
        //按钮点击事件
        qel.on('click', 'a.page-btn', function () {
            let _this = $(this);
            let url = _this.data('url') || '';
            if (_this.is('.gopage')) {
                let input = _this.prev("input.inp");
                let page = String(input.val() || '1');
                page = /^\d+$/.test(page) ? page : '1';
                url = url.replace('--gopage--', page);
            }
            if (that.bindElem && that.bindElem.length > 0) {
                // @ts-ignore
                that.bindElem.emit('load', url, true);
            }
            // @ts-ignore
            qel.emit('page');
        });
        let bindElem = setting.bind || null;
        if (bindElem) {
            this.bindElem = $(bindElem);
            this.bindElem.on('render', function (ev, source, url) {
                if (source.pageInfo) {
                    let pageInfo = source.pageInfo;
                    pageInfo.query = url;
                    that.render(pageInfo);
                }
            });
        }
        if (setting.info) {
            let query = window.location.pathname + '.json' + window.location.search;
            let source = {};
            source.pageInfo = setting.info;
            source.query = query;
            that.render(source);
        }
    }
    static getCode(info, option) {
        let pkey = option.keyName || 'page';
        let prevText = option.prevText || '上一页';
        let nextText = option.nextText || '下一页';
        let firstText = option.firstText || '首页';
        let lastText = option.lastText || '尾页';
        let page = parseInt(info.page);
        let size = option.pageSize;
        let maxPage = parseInt(info.pageCount);
        info.query = info.query || '';
        let query = yee_1.Yee.parseUrl(info.query);
        let start = (maxPage < 10 || page <= 5) ? 1 : (page + 5 > maxPage ? maxPage - 9 : page - 4);
        let temp = start + 9;
        let end = (page + 5 > maxPage) ? maxPage : (temp > maxPage ? maxPage : temp);
        if (size) {
            query.param.pageSize = size;
        }
        let prev = page - 1 <= 0 ? 1 : page - 1;
        let next = page + 1 >= maxPage ? maxPage : page + 1;
        let html = '';
        query.param[pkey] = 1;
        if (option.firstPage == 1 || option.firstPage == 'true') {
            html += '<a href="javascript:;" data-url="' + yee_1.Yee.toUrl(query) + '" class="page-btn first">' + firstText + '</a>';
        }
        query.param[pkey] = prev;
        html += '<a href="javascript:;" data-url="' + yee_1.Yee.toUrl(query) + '" class="page-btn prev">' + prevText + '</a>';
        if (option.numPage == 1 || option.numPage == 'true') {
            for (let i = start; i <= end; i++) {
                let p_page = i;
                if (p_page == page) {
                    html += '<b>' + p_page + '</b>';
                }
                else {
                    query.param[pkey] = p_page;
                    html += '<a href="javascript:;" class="page-btn" data-url="' + yee_1.Yee.toUrl(query) + '">' + p_page + '</a>';
                }
            }
        }
        query.param[pkey] = next;
        html += '<a href="javascript:;" data-url="' + yee_1.Yee.toUrl(query) + '" class="page-btn next">' + nextText + '</a>';
        if (option.lastPage == 1 || option.lastPage == 'true') {
            query.param[pkey] = maxPage;
            html += '<a href="javascript:;" data-url="' + yee_1.Yee.toUrl(query) + '" class="page-btn last">' + lastText + '</a>';
        }
        if (option.goPage == 1 || option.goPage == 'true') {
            let spage = page > maxPage ? maxPage : page;
            spage = spage <= 0 ? 1 : spage;
            query.param[pkey] = '--gopage--';
            html += '<input type="text" class="page-inp" value="' + spage + '"/><a class="page-btn gopage" data-url="' + yee_1.Yee.toUrl(query) + '" href="javascript:;">GO</a>';
        }
        return html;
    }
    render(pageInfo) {
        let qel = this.qel;
        pageInfo.barCode = YeePagebar.getCode(pageInfo, this.setting);
        for (let template of this.templates) {
            template.render(pageInfo);
        }
        yee_1.Yee.update(qel.get(0));
        qel.emit('render');
    }
}
exports.YeePagebar = YeePagebar;
//# sourceMappingURL=yee-pagebar.js.map