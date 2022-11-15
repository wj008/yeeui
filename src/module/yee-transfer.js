class YeeTransfer {
    constructor(elem) {
        let qel = this.qel = $(elem);
        let that = this;
        qel.hide();
        let transfer = this.transfer = $(`<div class="yee-transfer">
    <div class="trans-search">
        <input type="text"  class="form-inp text trans-search-inp"/><a class="form-btn trans-search-btn" href="javascript:;">搜索</a>
    </div>
    <div class="trans-main">
        <div class="trans-left">
            <div class="trans-head"><input type="checkbox"/><span class="trans-caption">备选列表</span><span class="trans-count">0</span></div>
            <div class="trans-warp"><ul class="trans-list"></ul></div>
            <div class="trans-foot"><div class="trans-pagebar"></div></div>
        </div>
        <div class="trans-middle"><div class="trans-btn-warp"><a class="trans-inc-btn"></a><a class="trans-dec-btn"></a></div></div>
        <div class="trans-right">
            <div class="trans-head"><input type="checkbox"/><span class="trans-caption">已选列表</span><span class="trans-count">0</span></div>
            <div class="trans-warp"><ul class="trans-list"></ul></div>
        </div>
    </div>
</div>`).insertAfter(qel);
        let pageBar = transfer.find('div.trans-left div.trans-pagebar');
        pageBar.on('click', 'a', function () {
            let url = $(this).data('url');
            that.load(url);
        });
        transfer.find('div.trans-middle a.trans-inc-btn').on('click', function () {
            that.insert();
        });
        transfer.find('div.trans-middle a.trans-dec-btn').on('click', function () {
            that.remove();
        });
        //全选
        transfer.find('div.trans-left .trans-head :checkbox').on('click', function () {
            transfer.find('div.trans-left ul.trans-list :checkbox').prop('checked', $(this).prop('checked'));
        });
        transfer.find('div.trans-right .trans-head :checkbox').on('click', function () {
            transfer.find('div.trans-right ul.trans-list :checkbox').prop('checked', $(this).prop('checked'));
        });
        let searchInp = transfer.find('div.trans-search input.trans-search-inp');
        let searchBtn = transfer.find('div.trans-search a.trans-search-btn');
        let placeholder = this.qel.attr('placeholder') || '请输入关键字搜索';
        searchInp.attr('placeholder', placeholder);
        searchBtn.on('click', function () {
            let keyword = searchInp.val() || '';
            let source = qel.data('source') || '';
            let temp = Yee.parseUrl(source);
            if (keyword == '') {
                temp.param['keyword'] = '';
            } else {
                temp.param['keyword'] = keyword;
            }
            source = Yee.toUrl(temp);
            that.load(source);
        });
        let caption = qel.data('caption') || '';
        if (caption != '') {
            transfer.find('div.trans-left .trans-caption').text(caption);
        }
        let width = qel.data('width') || 0;
        let height = qel.data('height') || 0;
        if (width > 0) {
            transfer.width(width + 'px');
        }
        if (height > 0) {
            transfer.height(height + 'px');
        }
        this.initValue();
        let source = qel.data('source') || '';
        this.load(source);
    }

    initPageBar(layout, url, info) {
        let pkey = info.keyName || 'page';
        let page = parseInt(info.page);
        let size = info.pageSize;
        let maxPage = parseInt(info.pageCount);
        let query = Yee.parseUrl(url);
        let nSize = 6;
        let bSize = Math.round(nSize / 2);
        let start = (maxPage < nSize || page <= bSize) ? 1 : (page + bSize > maxPage ? maxPage - (nSize - 1) : page - (bSize - 1));
        let temp = start + (nSize - 1);
        let end = (page + bSize > maxPage) ? maxPage : (temp > maxPage ? maxPage : temp);
        let prev = page - 1 <= 0 ? 1 : page - 1;
        let next = page + 1 >= maxPage ? maxPage : page + 1;
        let html = '';
        query.param[pkey] = 1;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn first"></a>';
        query.param[pkey] = prev;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn prev"></a>';
        for (let i = start; i <= end; i++) {
            let p_page = i;
            if (p_page == page) {
                html += '<b>' + p_page + '</b>';
            } else {
                query.param[pkey] = p_page;
                html += '<a href="javascript:;" class="page-btn" data-url="' + Yee.toUrl(query) + '">' + p_page + '</a>';
            }
        }
        query.param[pkey] = next;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn next"></a>';
        query.param[pkey] = maxPage;
        html += '<a href="javascript:;" data-url="' + Yee.toUrl(query) + '" class="page-btn last"></a>';
        layout.append(html);
        return;
    }

    /**
     * 加载
     * @param url
     * @param showMessage
     * @param param
     */
    load(url = null) {
        let that = this;
        let qel = this.qel;
        let method = qel.data('method') || 'get';
        let args = Yee.parseUrl(url);
        args.path = args.path || window.location.pathname;
        Yee.fetch(args.path, args.param, method).then(function (ret) {
            //拉取数据成功
            if (ret.status === true) {
                if (ret.data && ret.data.list && ret.data.pageInfo) {
                    that.render(ret.data);
                } else {
                    that.render(ret);
                }
            }
            //拉取数据错误
            if (ret.status === false) {
                if (ret.msg && typeof (ret.msg) === 'string') {
                    Yee.msg(ret.msg, {icon: 0, time: 2000});
                }
            }
        }).catch(function (e) {
            console.error(e);
        });
    }

    render(source) {
        let url = this.qel.data('source') || '';
        let layout = this.transfer.find('div.trans-left ul.trans-list');
        layout.empty();
        for (let item of source.list) {
            let text = '';
            if (typeof item == 'string' || typeof item == 'number') {
                text = item + '';
            } else if (typeof item == 'object') {
                if (item['text'] !== void 0) {
                    text = item['text'];
                } else if (item['name'] !== void 0) {
                    text = item['name'];
                } else if (item['title'] !== void 0) {
                    text = item['title'];
                } else {
                    text = JSON.stringify(item);
                }
            }
            let itemUI = $('<li class="trans-item"><label><span class="trans-box"><input type="checkbox"/></span><span class="trans-text"></span></label></li>');
            itemUI.find(':input').data('item-data', item);
            itemUI.find('span.trans-text').text(text);
            itemUI.appendTo(layout);
        }
        this.transfer.find('div.trans-left .trans-count').text(source.pageInfo.recordsCount || '');
        let pageBar = this.transfer.find('div.trans-left div.trans-pagebar');
        pageBar.empty();
        this.initPageBar(pageBar, url, source.pageInfo);
        this.updateState();
        this.transfer.find('div.trans-left .trans-head :checkbox').prop('checked', false);
    }

    addItem(layout, item) {
        if (item === void 0) {
            return;
        }
        let items = layout.find('li.trans-item');
        let has = false;
        items.each(function (index, element) {
            let temp = $(element).find(':input').data('item-data');
            if (JSON.stringify(temp) == JSON.stringify(item)) {
                has = true;
                return false;
            }
        });
        if (!has) {
            let text = '';
            if (typeof item == 'string' || typeof item == 'number') {
                text = item + '';
            } else if (typeof item == 'object') {
                if (item['text'] !== void 0) {
                    text = item['text'];
                } else if (item['name'] !== void 0) {
                    text = item['name'];
                } else if (item['title'] !== void 0) {
                    text = item['title'];
                } else {
                    text = JSON.stringify(item);
                }
            }
            let itemUI = $('<li class="trans-item"><label><span class="trans-box"><input type="checkbox"/></span><span class="trans-text"></span></label></li>');
            itemUI.find(':input').data('item-data', item);
            itemUI.find('span.trans-text').text(text);
            itemUI.appendTo(layout);
        }
    }

    updateState() {
        let itemsR = this.transfer.find('div.trans-right ul.trans-list li.trans-item');
        let itemsL = this.transfer.find('div.trans-left ul.trans-list li.trans-item');
        let hasFunc = function (value) {
            for (let item of itemsR) {
                let value2 = $(item).find(':input').data('item-data');
                if (JSON.stringify(value) == JSON.stringify(value2)) {
                    return true;
                }
            }
            return false;
        };
        itemsL.each(function (index, element) {
            let item = $(element);
            let value = item.find(':input').data('item-data');
            if (hasFunc(value)) {
                item.addClass('selected');
            } else {
                item.removeClass('selected');
            }
        });
    }

    insert() {
        let that = this;
        let selLayout = this.transfer.find('div.trans-right ul.trans-list');
        let layout = this.transfer.find('div.trans-left ul.trans-list');
        let items = layout.find('li.trans-item :input:checked');
        items.each(function (index, element) {
            let item = $(element).data('item-data');
            that.addItem(selLayout, item);
        });
        this.updateValue();
    }

    remove() {
        let layout = this.transfer.find('div.trans-right ul.trans-list');
        let items = layout.find('li.trans-item');
        items.each(function (index, element) {
            let li = $(element);
            let box = li.find(':input');
            if (box.is(':checked')) {
                li.remove();
            }
        });
        this.updateValue();
    }

    updateValue() {
        this.updateState();
        let values = [];
        let items = this.transfer.find('div.trans-right ul.trans-list li.trans-item');
        items.each(function (index, element) {
            let value = $(element).find(':input').data('item-data');
            values.push(value);
        });
        this.transfer.find('div.trans-right .trans-count').text(items.length);
        if (values.length == 0) {
            this.qel.val('');
            return;
        }
        this.qel.val(JSON.stringify(values));
    }

    initValue() {
        let value = this.qel.val() || '';
        if (value == '[]') {
            value = '';
        }
        if (value == '') {
            return;
        }
        let selLayout = this.transfer.find('div.trans-right ul.trans-list');
        try {
            let values = JSON.parse(value);
            if (Yee.isArray(values)) {
                for (let item of values) {
                    this.addItem(selLayout, item);
                }
            }
            this.transfer.find('div.trans-right .trans-count').text(values.length);
        } catch (e) {
            return;
        }
    }
}

export {YeeTransfer}