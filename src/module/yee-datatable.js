import {YeeMover} from "../libs/yee-mover";
import {YeeTemplate} from "../libs/yee-template";

const mover = new YeeMover();

$.fn.extend({
    wrapEx: function (html) {
        this.wrap(html);
        return this.parent();
    }, cloneEx: function () {
        let elem = this.get(0);
        if (elem) {
            let cp = elem.__clone = this.clone();
            cp[0].__origin = elem;
            cp.addClass('yee-dt-clone');
            this.parent().get(0).replaceChild(cp.get(0), elem);
            return cp;
        }
        return null;
    }
});

class YeeDatatable {
    constructor(elem) {
        this.id = '';
        this.tbName = '';
        this.templates = [];
        this.lastSend = null;
        this.currentUrl = null;
        //覆盖层
        this.dtCovers = [];
        this.styleSheet = null;
        this.cssSheet = null;
        this.isInitEvent = false;
        this.checkAllBox = null;
        this.checkItems = null;
        let table = this.table = $(elem);
        this.id = (function () {
            let id = table.attr('id') || YeeDatatable.getNextId();
            if (!table.attr('id')) {
                table.attr('id', id);
            }
            return id;
        })();
        this.baseUrl = table.data('url') || '';
        this.captureUrl = table.data('capture-url') === void 0 ? !!table.data('auto-url') : false;
        this.autoLoad = !!table.data('auto-load');
        this.resize = !!table.data('resize');
        this.headFixed = !!table.data('head-fixed');
        this.leftFixed = parseInt(table.data('left-fixed') || 0);
        this.rightFixed = parseInt(table.data('right-fixed') || 0);
        if (isNaN(this.leftFixed)) {
            this.leftFixed = 0;
        }
        if (isNaN(this.rightFixed)) {
            this.rightFixed = 0;
        }
        if (this.leftFixed > 0 || this.rightFixed > 0) {
            this.resize = true;
        }
        if (this.resize) {
            this.headFixed = true;
            table.addClass('yee-dt-resize');
        }
        if (this.baseUrl == '') {
            this.captureUrl = true;
            if (/\/$/.test(String(window.location.pathname))) {
                this.baseUrl = window.location.pathname + 'index.json' + window.location.search;
            } else {
                this.baseUrl = window.location.pathname + '.json' + window.location.search;
            }
        }
        let args = Yee.parseUrl(this.baseUrl);
        this.lastSend = {
            url: args.path, data: args.param
        };
        this.tbName = table.data('tbname') || table.attr('name') || (window.location.pathname + '') + '/dt-' + this.id;
        table.attr('name', this.tbName);
        this.init();
    }

    static getNextId() {
        let id = 'yee-dt-' + YeeDatatable.idIndex++;
        while (document.getElementById(id)) {
            id = 'yee-dt-' + YeeDatatable.idIndex++;
        }
        return id;
    }

    //获取缓存
    static getStorage(name) {
        if (window.localStorage && YeeDatatable.storage) {
            return YeeDatatable.storage[name] || null;
        }
        return null;
    }

    //保存
    static saveStorage(name, value) {
        if (window.localStorage) {
            if (!YeeDatatable.storage) {
                YeeDatatable.storage = {};
            }
            YeeDatatable.storage[name] = value;
            window.localStorage.dataTableCache = JSON.stringify(YeeDatatable.storage);
        }
        return null;
    }

    init() {
        let table = this.table;
        let that = this;
        //主体---------------
        // @ts-ignore
        let dtMainWarp = this.dtMainWarp = table.wrapEx('<div class="yee-dt-main-wrap"></div>');
        // @ts-ignore
        this.dtMain = this.dtMainWarp.wrapEx('<div class="yee-dt-main"></div>');
        // @ts-ignore
        this.dtBox = this.dtMain.wrapEx('<div class="yee-dt-box yee-dt-render"></div>');
        //是否固定列
        if (this.headFixed) {
            this.dtHeader = $('<div class="yee-dt-header"></div>').prependTo(this.dtBox);
            this.dtHeadWarp = $('<div class="yee-dt-head-wrap"></div>').appendTo(this.dtHeader);
        }
        //获取样式名称
        let tbRule = this.tbRule = (function (idx) {
            return 'dt-table' + idx;
        })(++YeeDatatable.index);
        table.addClass(tbRule);
        //创建样式表
        this.styleSheet = (function () {
            let styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(styleElement);
            return styleElement.sheet;
        })();
        //列设置
        this.cssSheet = {
            srcCells: [], items: {}, setWidth: function (idx, width) {
                this.items[idx] = width;
                let rule = '.' + tbRule + '-c' + idx;
                that.addCssRule(rule, 'width:' + width + 'px');
            }, getWidth: function (idx) {
                if (this.items[idx] !== void 0) {
                    return this.items[idx];
                }
                let width = $(this.srcCells[idx]).outerWidth();
                this.setWidth(idx, width);
                return width;
            }
        };
        this.initClassName();
        Yee.use('vue').then(function () {
            table.find('[yee-template]').each(function (_, el) {
                let tpl = new YeeTemplate(el, {list: [], pageInfo: [], other: {}});
                that.templates.push(tpl);
            });
            //底部滚动条
            let dtScroll = that.dtScroll = $('<div class="yee-dt-scroll"></div>').appendTo(that.dtBox);
            that.dtScrollBar = $('<div class="yee-dt-scrollbar"></div>').addClass(tbRule).appendTo(that.dtScroll);
            dtScroll.on('scroll', function (ev) {
                let left = $(this).scrollLeft();
                dtMainWarp.scrollLeft(left);
                if (that.dtHeadWarp) {
                    that.dtHeadWarp.scrollLeft(left);
                }
            });
            if (that.leftFixed > 0) {
                that.dtHeadFixedL = $('<div class="yee-dt-fixed-left"></div>').addClass(tbRule + '-fl').appendTo(that.dtHeader);
                that.dtMainFixedL = $('<div class="yee-dt-fixed-left"></div>').addClass(tbRule + '-fl').appendTo(that.dtMain);
            }
            if (that.rightFixed > 0) {
                that.dtMainFixedR = $('<div class="yee-dt-fixed-right"></div>').addClass(tbRule + '-fr').appendTo(that.dtMain);
                that.dtHeadFixedR = $('<div class="yee-dt-fixed-right"></div>').addClass(tbRule + '-fr').appendTo(that.dtHeader);
            }
            //开始处理数据
            table.on('reload', function (ev, showMessage) {
                that.reload(showMessage).then(function () {
                    that.initTable();
                });
            });
            table.on('resume', function (ev, showMessage) {
                that.resume(showMessage).then(function () {
                    that.initTable();
                });
            });
            table.on('load', function (ev, url = null, prams = {}, showMessage = false) {
                that.load(url, prams, showMessage).then(function () {
                    that.initTable();
                });
            });
            if (that.autoLoad) {
                let showMessage = !!table.data('show-message');
                that.load(that.baseUrl, null, showMessage).then(function () {
                    that.initTable();
                });
            } else {
                that.initTable();
            }
        }).catch(function (err) {
            console.error(err);
        });
    }

    /**
     * 第一次初始化样式信息
     */
    initClassName() {
        let table = this.table;
        let tbRule = this.tbRule;
        let cssSheet = this.cssSheet;
        let thead = table.find('thead');
        if (!this.isInitEvent) {
            //处理表头
            let thRows = thead.find('tr');
            if (thRows.length) {
                let row = thRows.get(0);
                //设置样式
                if (this.resize) {
                    let rule1 = tbRule + '-r0';
                    let height = $(thRows.get(0).cells[0]).height();
                    this.addCssRule('.' + rule1, 'height:' + height + 'px');
                    if (row.className) {
                        row.className += ' ' + rule1;
                    } else {
                        row.className = rule1;
                    }
                }
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j];
                    cssSheet.srcCells.push(cell);
                    //设置样式
                    if (this.resize) {
                        let rule2 = tbRule + '-c' + j;
                        if (cell.className) {
                            cell.className += ' ' + rule2;
                        } else {
                            cell.className = rule2;
                        }
                    }
                }
            }
            //从缓存回复尺寸
            if (this.resize) {
                this.resumeCache();
            }
        }
        //加入对齐约束行
        if (!this.isInitEvent && this.headFixed) {
            // @ts-ignore
            let colgroup = $('<colgroup>').prependTo(this.table);
            thead.find('th').each(function (idx, item) {
                let col = $('<col>').appendTo(colgroup);
                let th = $(item);
                if (th.attr('width')) {
                    col.attr('width', th.attr('width'));
                }
                if (th.attr('class')) {
                    col.attr('class', th.attr('class'));
                }
                if (th.attr('style')) {
                    col.attr('style', th.attr('style'));
                }
            });
        }
    }

    /**
     * 初始化表单，并完善样式
     */
    initTable() {
        let that = this;
        let table = this.table;
        let tbRule = this.tbRule;
        let dtBox = this.dtBox;
        //更新行样式-----
        let tbody = table.find('tbody');
        let tdRows = tbody.find('tr');
        // 添加行样式和绑定行事件
        // @ts-ignore
        for (let i = 0; i < tdRows.length; i++) {
            // @ts-ignore
            let row = tdRows.get(i);
            let temp = tbRule + '-r';
            let rule1 = temp + (i + 1);
            let reg = new RegExp(temp + '\\d+');
            if (row.className.length > 0 && reg.test(row.className)) {
                row.className = row.className.replace(reg, rule1);
            } else {
                if (row.className) {
                    row.className += ' ' + rule1;
                } else {
                    row.className = rule1;
                }
            }
            //处理鼠标事件----
            let data = {selector: 'tr.' + rule1};
            $(row).on('mouseenter', data, function (ev) {
                dtBox.find(ev.data.selector).addClass('hover');
            }).on('mouseleave', data, function (ev) {
                dtBox.find(ev.data.selector).removeClass('hover');
            }).on('click', data, function (ev) {
                dtBox.find('tr.selected').removeClass('selected');
                dtBox.find(ev.data.selector).addClass('selected');
            });
        }
        //------------
        this.initCheckBox();
        if (!this.isInitEvent) {
            this.initOrder();
            this.initCover();
            this.initHeader();
        }
        this.initFixedL();
        this.initFixedR();
        this.updateTableWidth();
        this.updateCoverOffset();
        this.updateFixedR();
        this.updateRowHeight();
        if (!this.isInitEvent) {
            $(window).on('resize', function () {
                that.updateFixedR();
            });
            table.on('resize', function () {
                that.updateFixedR();
            });
            setTimeout(function () {
                that.updateFixedR();
                //.log('yee-dt-render');
                that.dtBox.removeClass('yee-dt-render');
            }, 10);
        }
        this.isInitEvent = true;
    }

    /**
     * 保存列宽到缓存中
     */
    saveCache() {
        if (!this.resize) {
            return;
        }
        let cssSheet = this.cssSheet;
        let data = [];
        for (let i = 0; i < cssSheet.srcCells.length; i++) {
            //console.log(item.wBorder);
            let width = Math.floor(cssSheet.getWidth(i));
            data.push(width);
        }
        YeeDatatable.saveStorage(this.tbName, data);
    }

    /**
     * 从缓存回复列框
     */
    resumeCache() {
        if (!this.resize) {
            return;
        }
        let data = YeeDatatable.getStorage(this.tbName);
        if (data == null) {
            return;
        }
        let cssSheet = this.cssSheet;
        for (let i = 0; i < cssSheet.srcCells.length; i++) {
            if (data[i] !== void 0 && data[i] > 0) {
                cssSheet.setWidth(i, data[i]);
            }
        }
        // console.log(data);
    }

    /**
     * 更新行高
     */
    updateRowHeight() {
        let tbRule = this.tbRule;
        let table = this.table;
        let tbody = table.find('tbody');
        let tdRows = tbody.find('tr');
        for (let i = 0; i < tdRows.length; i++) {
            let row = tdRows.get(i);
            let rule1 = tbRule + '-r' + (i + 1);
            let height = $(row).height();
            this.addCssRule('.' + rule1, 'height:' + height + 'px');
        }
    }

    /**
     * 初始化选项框
     */
    initCheckBox() {
        let table = this.table;
        let that = this;
        if (this.checkAllBox == null) {
            this.checkAllBox = table.find('thead :checkbox:first');
            this.checkAllBox.on('click', function () {
                that.checkItems.each(function () {
                    $(this).prop('checked', that.checkAllBox.prop('checked'));
                });
            });
        }
        let checkItems = this.checkItems = table.find('tbody :checkbox');
        let updateCheckAll = function () {
            let temp = checkItems.length > 0;
            checkItems.each(function () {
                temp = temp && $(this).prop('checked');
            });
            that.checkAllBox.prop('checked', temp);
        };
        updateCheckAll();
        checkItems.on('click', updateCheckAll);
    }

    /**
     * 初始化排序
     */
    initOrder() {
        let table = this.table;
        let cssSheet = this.cssSheet;
        let btnList = [];

        function setOrder(sortBtn, name, sort) {
            for (let item of btnList) {
                item.removeAttr('yee-sort');
            }
            if (sort == 'desc') {
                sortBtn.attr('yee-sort', 'desc');
                // @ts-ignore
                table.emit('order', {name: name, order: -1, sort: 'desc', value: name + '-desc'});
            } else if (sort == 'asc') {
                sortBtn.attr('yee-sort', 'asc');
                // @ts-ignore
                table.emit('order', {name: name, order: 1, sort: 'asc', value: name + '-asc'});
            } else {
                sortBtn.removeAttr('yee-sort');
                // @ts-ignore
                table.emit('order', {name: name, order: 0, sort: '', value: ''});
            }
        }

        for (let cell of cssSheet.srcCells) {
            let item = $(cell);
            let name = item.data('order') || null;
            if (name) {
                item.wrapInner('<span class="yee-dt-sort-text"></span>');
                let spanBtn = item.children('span');
                let sortBtn = $('<span class="yee-dt-sort"></span>').appendTo(item);
                let ascBtn = $('<i class="yee-dt-sort-asc"></i>').appendTo(sortBtn);
                let descBtn = $('<i class="yee-dt-sort-desc"></i>').appendTo(sortBtn);
                spanBtn.on('click', {selector: sortBtn}, function (ev) {
                    let sortBtn = ev.data.selector;
                    let val = sortBtn.attr('yee-sort') || '';
                    if (val == 'desc') {
                        setOrder(sortBtn, name, 'asc');
                    } else if (val == 'asc') {
                        setOrder(sortBtn, name, '');
                    } else {
                        setOrder(sortBtn, name, 'desc');
                    }
                });
                ascBtn.on('click', {selector: sortBtn}, function (ev) {
                    let sortBtn = ev.data.selector;
                    setOrder(sortBtn, name, 'asc');
                    ev.preventDefault();
                    return false;
                });
                descBtn.on('click', {selector: sortBtn}, function (ev) {
                    let sortBtn = ev.data.selector;
                    setOrder(sortBtn, name, 'desc');
                    ev.preventDefault();
                    return false;
                });
                btnList.push(sortBtn);
            }
        }
    }

    /**
     * 初始化浮动层
     */
    initCover() {
        if (!this.resize) {
            return;
        }
        let cssSheet = this.cssSheet;
        let dtCovers = this.dtCovers;
        let that = this;
        for (let i = 0; i < cssSheet.srcCells.length; i++) {
            let cell = $(cssSheet.srcCells[i]);
            let cover = $('<div class="yee-dt-cover"></div>').appendTo(this.dtHeadWarp);
            // @ts-ignore
            cover[0].__bindCell = cell[0];
            cell[0].__cover = cover[0];
            dtCovers.push(cover);
            cover.css({
                height: cell.outerHeight()
            });
            cover.on('mousedown', i, function (ev) {
                let idx = ev.data;
                let oldW = cssSheet.getWidth(idx);
                mover.start(ev, function (oPt, nPt) {
                    let left = nPt.left - oPt.left;
                    let width = oldW + left;
                    if (width < 40) {
                        width = 40;
                    }
                    cssSheet.setWidth(idx, width);
                    that.updateTableWidth();
                    that.updateCoverOffset();
                    that.updateFixedR();
                }, function () {
                    that.updateFixedR();
                    that.saveCache();
                });
            });
        }
    }

    /**
     * 更新浮动层的偏移
     */
    updateCoverOffset() {
        if (!this.resize) {
            return;
        }
        let dtCovers = this.dtCovers;
        for (let i = 0; i < dtCovers.length; i++) {
            let cover = dtCovers[i];
            let th = $(cover[0].__bindCell);
            let width = th.width();
            let left = th[0].offsetLeft + width;
            cover.css({left: left});
        }
    }

    /**
     * 更新表格宽度
     */
    updateTableWidth() {
        let cssSheet = this.cssSheet;
        let tbRule = this.tbRule;
        let width = 0;
        let flWidth = 0;
        let frWidth = 0;
        for (let i = 0; i < cssSheet.srcCells.length; i++) {
            let cell = cssSheet.srcCells[i];
            let w = cssSheet.getWidth(i);
            width += w;
            if (cell.__FL) {
                flWidth += w;
            }
            if (cell.__FR) {
                frWidth += w;
            }
        }
        if (this.resize) {
            this.addCssRule('.' + tbRule, 'width:' + width + 'px');
        } else {
            this.addCssRule('.' + tbRule, 'width:100%');
        }
        this.addCssRule('.' + tbRule + '-fl', 'width:' + flWidth + 'px');
        this.addCssRule('.' + tbRule + '-fr', 'width:' + frWidth + 'px');
    }

    /**
     * 克隆一个表格
     */
    cloneTable() {
        let table = this.table;
        let tb = $('<table/>');
        tb.attr('class', table.attr('class'));
        tb.attr('cellspacing', table.attr('cellspacing'));
        tb.attr('cellpadding', table.attr('cellpadding'));
        tb.attr('border', table.attr('border'));
        return tb;
    }

    /**
     * 创建头部
     */
    initHeader() {
        if (this.isInitEvent || !this.headFixed) {
            return;
        }
        //迁移头部
        let headTable = this.dtHeadTable = this.cloneTable().appendTo(this.dtHeadWarp);
        let thead = this.table.find('thead');
        thead.appendTo(headTable);
    }

    /**
     * 创建左边固定列
     */
    initFixedL() {
        if (this.leftFixed == 0) {
            return;
        }
        let dtBox = this.dtBox;
        let table = this.table;
        let headTable = this.dtHeadTable;
        let tbRule = this.tbRule;
        // @ts-ignore
        let firstRow = headTable[0].rows[0];
        if (!this.isInitEvent) {
            //处理固定头
            let fixedHead = this.cloneTable().removeClass(tbRule).addClass(tbRule + '-fl').appendTo(this.dtHeadFixedL);
            let thead = $('<thead></thead>').appendTo(fixedHead);
            let rule = tbRule + '-r' + 0;
            let tr = $('<tr></tr>').addClass(rule).appendTo(thead);
            for (let i = 0; i < this.leftFixed; i++) {
                let cell = $(firstRow.cells[i]);
                cell.cloneEx();
                cell.appendTo(tr);
                cell[0].__FL = true;
                if (this.resize) {
                    $(cell[0].__cover).appendTo(this.dtHeadFixedL);
                }
            }
        }
        this.dtMainFixedL.empty();
        //处理固定body
        let fixedBody = this.cloneTable().removeClass(tbRule).addClass(tbRule + '-fl').appendTo(this.dtMainFixedL);
        //添加colgroup占位
        let colgroup = $('<colgroup>').prependTo(fixedBody);
        for (let j = 0; j < this.leftFixed; j++) {
            let col = $('<col>').appendTo(colgroup);
            let th = $(firstRow.cells[j]);
            if (th.attr('width')) {
                col.attr('width', th.attr('width'));
            }
            if (th.attr('class')) {
                col.attr('class', th.attr('class'));
            }
            if (th.attr('style')) {
                col.attr('style', th.attr('style'));
            }
        }
        //添加colgroup占位
        let tbody = $('<tbody></tbody>').appendTo(fixedBody);
        let rows = table.find('tbody tr');
        // @ts-ignore
        for (let i = 0; i < rows.length; i++) {
            let rule = tbRule + '-r' + (i + 1);
            let tr = $('<tr></tr>').addClass(rule).appendTo(tbody);
            //绑定鼠标事件
            let data = {selector: 'tr.' + rule};
            tr.on('mouseenter', data, function (ev) {
                dtBox.find(ev.data.selector).addClass('hover');
            }).on('mouseleave', data, function (ev) {
                dtBox.find(ev.data.selector).removeClass('hover');
            }).on('click', data, function (ev) {
                dtBox.find('tr.selected').removeClass('selected');
                dtBox.find(ev.data.selector).addClass('selected');
            });
            for (let j = 0; j < this.leftFixed; j++) {
                // @ts-ignore
                let cell = $(rows.get(i).cells[j]);
                if (cell.length) {
                    // @ts-ignore
                    cell.cloneEx();
                    cell.appendTo(tr);
                }
            }
        }
    }

    /**
     * 创建右列固定列
     */
    initFixedR() {
        if (this.rightFixed == 0) {
            return;
        }
        let dtBox = this.dtBox;
        let table = this.table;
        let headTable = this.dtHeadTable;
        let tbRule = this.tbRule;
        // @ts-ignore
        let len = headTable[0].rows[0].cells.length;
        let start = len - this.rightFixed;
        if (start <= 0) {
            return;
        }
        // @ts-ignore
        let firstRow = headTable[0].rows[0];
        if (!this.isInitEvent) {
            //处理固定头
            let fixedHead = this.cloneTable().removeClass(tbRule).addClass(tbRule + '-fr').appendTo(this.dtHeadFixedR);
            let thead = $('<thead></thead>').appendTo(fixedHead);
            let rule = tbRule + '-r' + 0;
            let tr = $('<tr></tr>').addClass(rule).appendTo(thead);
            for (let i = start; i < len; i++) {
                // @ts-ignore
                let cell = $(firstRow.cells[i]);
                if (cell.length) {
                    // @ts-ignore
                    cell.cloneEx();
                    cell.appendTo(tr);
                    cell[0].__FR = true;
                    if (this.resize) {
                        $(cell[0].__cover).appendTo(this.dtHeadFixedR);
                    }
                }
            }
        }
        this.dtMainFixedR.empty();
        //处理固定body
        let fixedBody = this.cloneTable().removeClass(tbRule).addClass(tbRule + '-fr').appendTo(this.dtMainFixedR);
        //添加colgroup占位
        let colgroup = $('<colgroup>').prependTo(fixedBody);
        for (let j = start; j < len; j++) {
            let col = $('<col>').appendTo(colgroup);
            let th = $(firstRow.cells[j]);
            if (th.attr('width')) {
                col.attr('width', th.attr('width'));
            }
            if (th.attr('class')) {
                col.attr('class', th.attr('class'));
            }
            if (th.attr('style')) {
                col.attr('style', th.attr('style'));
            }
        }
        //添加tbody
        let tbody = $('<tbody></tbody>').appendTo(fixedBody);
        let rows = table.find('tbody tr');
        // @ts-ignore
        for (let i = 0; i < rows.length; i++) {
            let rule = tbRule + '-r' + (i + 1);
            let tr = $('<tr></tr>').addClass(rule).appendTo(tbody);
            //绑定鼠标事件
            let data = {selector: 'tr.' + rule};
            tr.on('mouseenter', data, function (ev) {
                dtBox.find(ev.data.selector).addClass('hover');
            }).on('mouseleave', data, function (ev) {
                dtBox.find(ev.data.selector).removeClass('hover');
            }).on('click', data, function (ev) {
                dtBox.find('tr.selected').removeClass('selected');
                dtBox.find(ev.data.selector).addClass('selected');
            });
            for (let j = start; j < len; j++) {
                // @ts-ignore
                let cell = $(rows.get(i).cells[j]);
                if (cell.length) {
                    // @ts-ignore
                    cell.cloneEx();
                    cell.appendTo(tr);
                }
            }
        }
    }

    /**
     * 更新右列固定列位置
     */
    updateFixedR() {
        if (this.rightFixed == 0) {
            return;
        }
        let width = this.table.outerWidth(true);
        let box_width = this.dtBox.width();
        let mw_width = this.dtMainWarp.outerWidth();
        this.dtScroll.width(mw_width);
        this.dtHeadWarp.width(mw_width);
        //计算出出现滚动条后的差距
        let sr = this.dtMain.outerWidth() - mw_width;
        if (width <= box_width) {
            let right = box_width - width;
            this.dtMainFixedR.css({right: right - sr});
            this.dtHeadFixedR.css({right: right});
        } else {
            this.dtHeadFixedR.css({right: sr});
            this.dtMainFixedR.css({right: 0});
        }
    }

    /**
     * 获得选中的值
     * @param name
     */
    getCheckData(name = null) {
        let values = [];
        let items = this.table.find('tbody :checkbox');
        items.each(function (idx, item) {
            let box = $(item);
            let boxName = box.attr('name') || '';
            if (name !== null && name.length > 0 && boxName != name) {
                return;
            }
            let td = box.parents('td:first');
            if (td.length > 0) {
                if (td.is('.yee-dt-clone') && td[0]['__origin']) {
                    if (boxName.length > 0) {
                        box = $(td[0]['__origin']).find(':checkbox[name=\'' + boxName + '\']');
                    } else {
                        box = $(td[0]['__origin']).find(':checkbox[name=\'' + boxName + '\']');
                    }
                }
            }
            if (box.length > 0 && box.is(':checked')) {
                let value = box.val();
                if (value !== null && (value + '').length > 0) {
                    values.push(value);
                }
            }
        });
        return values;
    }

    /**
     * 添加CSS样式
     * @param rule
     * @param css
     */
    addCssRule(rule, css) {
        let styleSheet = this.styleSheet;
        for (let n = 0; n < styleSheet.rules.length; n++) {
            if (styleSheet.rules[n].selectorText == rule) {
                styleSheet.removeRule(n);
                break;
            }
        }
        styleSheet.addRule(rule, css);
    }

    /**
     * 渲染数据
     * @param source
     */
    render(source) {
        let qel = this.table;
        let that = this;
        return new Promise(function (resolve) {
            if (that.templates.length == 0) {
                // @ts-ignore
                qel.emit('render', source, that.currentUrl);
                return resolve(true);
            }
            let list = [];
            if (source.list && Yee.isArray(source.list)) {
                list = source.list;
            } else if (Yee.isArray(source)) {
                list = source;
            }
            // @ts-ignore
            let data = qel.emit('filter', list);
            if (data !== void 0) {
                list = data;
            }
            for (let i = 0; i < list.length; i++) {
                // @ts-ignore
                let item = qel.emit('filterItem', list[i]);
                if (item !== void 0) {
                    if (item !== void 0) {
                        list[i] = item;
                    }
                }
            }
            let promiseList = [];
            for (let template of that.templates) {
                let promise = template.render({list: list, pageInfo: source.pageInfo || {}});
                promiseList.push(promise);
            }
            if (promiseList.length == 0) {
                // @ts-ignore
                qel.emit('render', source, that.currentUrl);
                qel.find('thead th :checkbox').prop('checked', false);
                return resolve(true);
            } else {
                Promise.all(promiseList).then(function () {
                    // @ts-ignore
                    qel.emit('render', source, that.currentUrl);
                    qel.find('thead th :checkbox').prop('checked', false);
                    return resolve(true);
                });
            }
        });
    }

    /**
     * 加载
     * @param url
     * @param showMessage
     * @param param
     */
    /**
     * 加载
     * @param url
     * @param showMessage
     * @param param
     */
    load(url = null, param = {}, showMessage = false) {
        let qel = this.table;
        let that = this;
        url = url || this.baseUrl;
        let method = qel.data('method') || 'get';
        let rewrite = !!qel.data('rewrite');
        let args = Yee.parseUrl(url);
        args.path = args.path || window.location.pathname;
        for (let key in param) {
            args.param[key] = param[key];
        }
        this.lastSend = {
            url: args.path, data: args.param
        };
        if (rewrite) {
            let temp1 = Yee.parseUrl(window.location.href);
            for (let key in args.param) {
                temp1.param[key] = args.param[key];
            }
            let param = {};
            for (let key in temp1.param) {
                if (temp1.param[key] !== '') {
                    param[key] = temp1.param[key];
                }
            }
            temp1.param = param;
            let href = Yee.toUrl(temp1);
            if (typeof (window.history.replaceState) == 'function') {
                window.history.replaceState({}, '', href);
            }
        }
        return new Promise(function (resolve) {
            Yee.fetch(args.path, args.param, method).then(function (ret) {
                //拉取数据成功
                if (ret.status === true) {
                    if (showMessage && ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {time: 1000});
                    }
                    that.currentUrl = Yee.toUrl(args);
                    that.render(ret).then(function () {
                        // @ts-ignore
                        qel.emit('success', ret, that.currentUrl);
                        resolve(true);
                    });
                }
                //拉取数据错误
                if (ret.status === false) {
                    if (ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 0, time: 2000});
                    }
                    // @ts-ignore
                    qel.emit('error', ret);
                    resolve(false);
                }
            });
        });
    }

    /**
     * 刷新
     * @param showMessage
     */
    reload(showMessage = false) {
        if (this.lastSend) {
            return this.load(this.lastSend.url, this.lastSend.data, showMessage);
        }
        return Promise.resolve(true);
    }

    /**
     * 重置
     * @param showMessage
     */
    resume(showMessage = false) {
        return this.load(this.baseUrl, null, showMessage);
    }
}

YeeDatatable.index = 0;
YeeDatatable.idIndex = 0;
//本地缓存
YeeDatatable.storage = (function () {
    if (window.localStorage && window.localStorage.dataTableCache) {
        try {
            return JSON.parse(window.localStorage.dataTableCache);
        } catch (e) {
            return {};
        }
    }
    return null;
})();

export {YeeDatatable}
