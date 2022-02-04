import {YeeTemplate} from "../libs/yee-template";

class YeePagebar {
    constructor(elem) {
        this.qel = null;
        this.setting = null;
        this.templates = [];
        this.bindElem = null;
        let qel = this.qel = $(elem);
        this.setting = $.extend({
            pageSize: 0, hidden: 0, goPage: 1, numPage: 1, firstPage: 1, lastPage: 1, info: null
        }, qel.data());
        this.init();
    }

    static getCode(info, option) {
        let pkey = option.keyName || 'page';
        let prevText = option.prevText === void 0 ? '上一页' : option.prevText;
        let nextText = option.nextText === void 0 ? '下一页' : option.nextText;
        let firstText = option.firstText === void 0 ? '首页' : option.firstText;
        let lastText = option.lastText === void 0 ? '尾页' : option.lastText;
        let page = parseInt(info.page);
        if (isNaN(page) || page <= 0) {
            page = 1;
        }
        let size = option.pageSize;
        let numSize = parseInt(option.numSize || 10);
        let maxPage = parseInt(info.pageCount);
        info.query = info.query || '';
        let query = Yee.parseUrl(info.query);
        let partSize = Math.ceil(numSize / 2);
        let start = (maxPage < numSize || page <= partSize) ? 1 : (page + partSize > maxPage ? maxPage - (numSize - 1) : page - (partSize - 1));
        let temp = start + (numSize - 1);
        let end = (page + partSize > maxPage) ? maxPage : (temp > maxPage ? maxPage : temp);
        if (size) {
            query.param.pageSize = size;
        }
        let prev = page - 1 <= 0 ? 1 : page - 1;
        let next = page + 1 >= maxPage ? maxPage : page + 1;
        let html = '';
        query.param[pkey] = 1;
        if (option.firstPage == 1 || option.firstPage == 'true') {
            html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn first">' + firstText + '</a>';
        }
        query.param[pkey] = prev;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn prev">' + prevText + '</a>';
        if (option.numPage == 1 || option.numPage == 'true') {
            for (let i = start; i <= end; i++) {
                let p_page = i;
                if (p_page == page) {
                    html += '<b>' + p_page + '</b>';
                } else {
                    query.param[pkey] = p_page;
                    html += '<a href="javascript:;" class="page-btn" data-url="' + Yee.toUrl(query) + '">' + p_page + '</a>';
                }
            }
        }
        query.param[pkey] = next;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn next">' + nextText + '</a>';
        if (option.lastPage == 1 || option.lastPage == 'true') {
            query.param[pkey] = maxPage;
            html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn last">' + lastText + '</a>';
        }
        if (option.goPage == 1 || option.goPage == 'true') {
            let spage = page > maxPage ? maxPage : page;
            spage = spage <= 0 ? 1 : spage;
            query.param[pkey] = '--gopage--';
            html += '<input type="text" class="page-inp" value="' + spage + '"/><a class="page-btn gopage" data-url="' + Yee.toUrl(query) + '" href="javascript:;">GO</a>';
        }
        return html;
    }

    init() {
        let qel = this.qel;
        let that = this;
        Yee.use('vue').then(function () {
            qel.find('[yee-template]').each(function (_, el) {
                that.templates.push(new YeeTemplate(el, {
                    barCode: '', recordsCount: 0, page: 0, pageCount: 0, pageSize: 0,
                }));
            });
            //按钮点击事件
            qel.on('click', 'a.page-btn', function () {
                let inp = $(this);
                let url = inp.data('url') || '';
                if (inp.is('.gopage')) {
                    let input = inp.prev("input.page-inp");
                    let page = String(input.val() || '1');
                    page = /^\d+$/.test(page) ? page : '1';
                    url = url.replace('--gopage--', page);
                }
                if (that.bindElem && that.bindElem.length > 0) {
                    // @ts-ignore
                    that.bindElem.emit('load', url, true);
                }
                // @ts-ignore
                qel.emit('page', url);
            });
            qel.on('source', function (ev, source) {
                that.render(source);
            });
            let bindElem = that.setting.bind || null;
            if (bindElem) {
                that.bindElem = $(bindElem);
                that.bindElem.on('render', function (ev, source, url) {
                    if (source.pageInfo) {
                        let pageInfo = source.pageInfo;
                        pageInfo.query = url;
                        that.render(pageInfo);
                    }
                });
            }
            if (that.setting.info) {
                let query = window.location.pathname + '.json' + window.location.search;
                let source = {};
                source.pageInfo = that.setting.info;
                source.query = query;
                that.render(source);
            }
        }).catch(function (err) {
            console.error(err);
        });
    }

    render(pageInfo) {
        let qel = this.qel;
        pageInfo.barCode = YeePagebar.getCode(pageInfo, this.setting);
        let promiseList = [];
        for (let template of this.templates) {
            let promise = template.render(pageInfo);
            promiseList.push(promise);
        }
        if (promiseList.length == 0) {
            qel.emit('render');
        } else {
            Promise.all(promiseList).then(function () {
                qel.emit('render');
            });
        }
    }
}

export {YeePagebar}
