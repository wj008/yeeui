import {Yee} from "../yee";

export class YeePagebar {

    public static getCode(info, option) {
        let pkey = option.keyName || 'page';
        let prevText = option.prevText || '上一页';
        let nextText = option.nextText || '下一页';
        let firstText = option.firstText || '首页';
        let lastText = option.lastText || '尾页';
        let page = parseInt(info.page);
        let size = option.pageSize;
        let maxPage = parseInt(info.pageCount);
        info.query = info.query || '';
        let query = Yee.parseUrl(info.query);
        let start = (maxPage < 10 || page <= 5) ? 1 : (page + 5 > maxPage ? maxPage - 9 : page - 4);
        let temp = start + 9;
        let end = (page + 5 > maxPage) ? maxPage : (temp > maxPage ? maxPage : temp);
        if (size) {
            query.prams.pageSize = size;
        }
        let prev = page - 1 <= 0 ? 1 : page - 1;
        let next = page + 1 >= maxPage ? maxPage : page + 1;
        let html = '';
        query.prams[pkey] = 1;
        if (option.firstPage == 1 || option.firstPage == 'true') {
            html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="first">' + firstText + '</a>';
        }
        query.prams[pkey] = prev;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="prev">' + prevText + '</a>';
        if (option.numPage == 1 || option.numPage == 'true') {
            for (let i = start; i <= end; i++) {
                let p_page = i;
                if (p_page == page) {
                    html += '<b>' + p_page + '</b>';
                } else {
                    query.prams[pkey] = p_page;
                    html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '">' + p_page + '</a>';
                }
            }
        }
        query.prams[pkey] = next;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="next">' + nextText + '</a>';
        if (option.lastPage == 1 || option.lastPage == 'true') {
            query.prams[pkey] = maxPage;
            html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="last">' + lastText + '</a>';
        }
        if (option.goPage == 1 || option.goPage == 'true') {
            let spage = page > maxPage ? maxPage : page;
            spage = spage <= 0 ? 1 : spage;
            query.prams[pkey] = '--gopage--';
            html += '<input type="text" class="inp" value="' + spage + '"/><a class="gopage" data-url="' + Yee.toUrl(query) + '" href="javascript:;">GO</a>';
        }
        return html;
    }

    private readonly qel = null;
    private readonly setting = null;
    private readonly pageBar = null;

    public constructor(elem, setting) {
        let qel = this.qel = $(elem);
        setting = this.setting = $.extend({
            pageSize: 0,
            hidden: 0,
            goPage: 1,
            numPage: 1,
            firstPage: 1,
            lastPage: 1,
            info: null
        }, setting);
        let that = this;
        let bindElem = setting.bind || null;
        let pageBar = this.pageBar = qel.find('[v-name="bar"]');
        if (pageBar.length > 0) {
            pageBar.on('click', 'a', function () {
                let _this = $(this);
                let url = _this.data('url') || '';
                if (_this.is('.gopage')) {
                    let input = _this.prev("input.inp");
                    let page = String(input.val() || '1');
                    page = /^\d+$/.test(page) ? page : '1';
                    url = url.replace('--gopage--', page);
                }
                if (bindElem && $(bindElem).length > 0) {
                    // @ts-ignore
                    $(bindElem).emit('load', url, true);
                }
                // @ts-ignore
                qel.emit('barClick');
            });
        }
        qel.on('source', function (ev, source) {
            that.render(source);
        });
        if (bindElem) {
            $(bindElem).on('source', function (ev, source) {
                that.render(source);
            });
        }
        if (setting.info) {
            let query = window.location.pathname + '.json' + window.location.search;
            let source: { [p: string]: any } = {};
            source.pageInfo = setting.info;
            source.query = query;
            that.render(source);
        }
    }

    public render(source) {
        let qel = this.qel;
        let setting = this.setting;
        let pageBar = this.pageBar;
        let pageInfo = source.pageInfo || {};
        pageInfo.query = source.query;
        if (pageBar.length > 0) {
            pageBar.html(YeePagebar.getCode(pageInfo, setting));
        }
        qel.find('[v-name="count"]').text(pageInfo.recordsCount);
        qel.find('[v-name="pageCount"]').text(pageInfo.pageCount);
        qel.find('[v-name="page"]').text(pageInfo.page);
        qel.find('[v-name="pageSize"]').text(pageInfo.pageSize);
        qel.find('[v-name="maxPage"]').text(pageInfo.pageCount);
        Yee.update(qel.get(0));
        qel.trigger('change');
    }
}