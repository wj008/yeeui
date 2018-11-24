import mover = require("./mover");
import {Yee} from "../yee";

type Column = { width: number, wBorder: number, th: JQuery<HTMLElement>, tdList: Array<JQuery<HTMLElement>>, cover: JQuery<HTMLElement>, fixed: number };

export class YeeDatatable {

    public static index = 0;

    public static getNextId(): string {
        let id: string = 'yee-dt-' + YeeDatatable.index++;
        while (document.getElementById(id)) {
            id = 'yee-dt-' + YeeDatatable.index++;
        }
        return id;
    }

    //本地缓存
    private static storage = (function () {
        if (window.localStorage && window.localStorage.dataTableCache) {
            try {
                return JSON.parse(window.localStorage.dataTableCache);
            } catch (e) {
                return {};
            }
        }
        return null;
    })();

    //获取缓存
    private static getStorage(name) {
        if (window.localStorage && YeeDatatable.storage) {
            return YeeDatatable.storage[name] || null;
        }
        return null;
    }

    //保存
    private static saveStorage(name, value) {
        if (window.localStorage) {
            if (!YeeDatatable.storage) {
                YeeDatatable.storage = {};
            }
            YeeDatatable.storage[name] = value;
            window.localStorage.dataTableCache = JSON.stringify(YeeDatatable.storage);
        }
        return null;
    }

    public id: string = '';
    private readonly qel: JQuery<HTMLElement>;
    private readonly setting;
    private readonly tbName = '';
    private readonly tableLayer: JQuery<HTMLElement>;
    private readonly tableInside: JQuery<HTMLElement>;
    private readonly tableWrap: JQuery<HTMLElement>;

    private tableHeader: JQuery<HTMLElement>;
    private leftFixedInside: JQuery<HTMLElement> = null;
    private rightFixedInside: JQuery<HTMLElement> = null;
    //列信息
    private column: Array<Column> = [];
    //左列固定表格
    private leftFixedColumn: Array<Column> = [];
    //右列固定表格
    private rightFixedColumn: Array<Column> = [];
    private rightFixedInLine = false;
    private readonly trTemplate = null;
    private isEmptyData = true;
    private checkAllFunc = null;
    private lastSend = null;

    public constructor(elem, setting) {
        let qel = this.qel = $(elem);
        this.id = (function () {
            let id = qel.attr('id') || YeeDatatable.getNextId();
            if (!qel.attr('id')) {
                qel.attr('id', id);
            }
            return id;
        })();
        let temp = qel.find('tbody tr[yee-template]');
        if (temp.length > 0) {
            this.trTemplate = temp.clone();
            temp.remove();
        } else {
            this.trTemplate = null;
        }
        this.setting = setting;
        if (setting.leftFixed) {
            setting.leftFixed = parseInt(setting.leftFixed);
        }
        if (setting.rightFixed) {
            setting.rightFixed = parseInt(setting.rightFixed);
        }
        if (!setting.url) {
            setting.autoUrl = 1;
            if (/\/$/.test(String(window.location.pathname))) {
                setting.url = window.location.pathname + 'index.json' + window.location.search;
            } else {
                setting.url = window.location.pathname + '.json' + window.location.search;
            }
        }
        this.tbName = setting.tbname || (window.location.pathname + '') + '/dt-' + this.id;
        qel.attr('name', this.tbName);
        //添加外围元素---
        qel.wrap('<div class="yee-datatable-layer"></div>');
        this.tableLayer = qel.parent('.yee-datatable-layer');
        qel.wrap('<div class="yee-datatable-wrap"></div>');
        this.tableWrap = qel.parent('.yee-datatable-wrap');
        qel.wrap('<div class="yee-datatable-inside"></div>');
        this.tableInside = qel.parent('.yee-datatable-inside');
        //头部
        this.tableHeader = $('<div class="yee-datatable-header"></div>').prependTo(this.tableLayer);
        let that = this;
        this.initCacheSize();
        if (setting.autoLoad) {
            this.load(setting.url, null, true).then(function (ret) {
                that.init(ret);
            });
        } else {
            that.init();
        }
        qel.on('reload', function (ev, showMessage) {
            that.reload(showMessage).then(function (ret) {
                that.init(ret);
            });
        });
        qel.on('reset', function (ev, showMessage) {
            that.reset(showMessage).then(function (ret) {
                that.init(ret);
            });
        });
        qel.on('load', function (ev, url: string = null, prams: { [p: string]: any } = {}, showMessage = false) {
            that.load(url, prams, showMessage).then(function (ret) {
                that.init(ret);
            });
        });
    }

    public init(data = null) {

        this.initColumn();
        this.initLeftFixed();
        this.initRightFixed();
        this.initEvent();
        if (data) {
            // @ts-ignore
            this.qel.emit('change', data);
        }

    }

    //初始化缓存中的尺寸
    private initCacheSize() {
        let qel = this.qel;
        let setting = this.setting;
        if (setting.resize) {
            this.qel.removeAttr('width');
            this.qel.css({'width': 'auto'});
            let thRows = qel.find('thead th');
            let data = YeeDatatable.getStorage(this.tbName);
            this.tableInside.width(qel.outerWidth(true) + 10000);
            for (let i = 0; i < thRows.length; i++) {
                let th = thRows.eq(i);
                if (setting.resize && data && data[i]) {
                    th.width(data[i]);
                } else {
                    th.width(th.width());
                }
                th.removeAttr('width');
            }
            this.tableInside.width(qel.outerWidth(true));
        } else {
            let thRows = qel.find('thead th');
            let maxWTh = null;// 最长的一列清除长度
            let allHasWidth = true;//所有列都有宽度,如果都设置了宽，就取消最长那个
            for (let i = 0; i < thRows.length; i++) {
                let th = thRows.eq(i);
                if ((setting.leftFixed > 0 && i < setting.leftFixed) || (setting.rightFixed > 0 && i >= thRows.length - setting.rightFixed)) {
                    th.width(th.width());
                    th.removeAttr('width');
                    continue;
                }
                if (!th.attr('width')) {
                    allHasWidth = false;
                }
                let width = th.width();
                if (maxWTh == null) {
                    maxWTh = {width: width, th: th};
                } else {
                    if (width > maxWTh.width) {
                        maxWTh = {width: width, th: th};
                    }
                }
            }
            if (allHasWidth && maxWTh) {
                maxWTh.th.css('width', 'auto');
                maxWTh.th.removeAttr('width');
            }
        }
    }

    private saveCacheSize() {
        let setting = this.setting;
        if (!setting.resize) {
            return;
        }
        let data = [];
        for (let item of this.column) {
            let width = item.width - item.wBorder;
            data.push(width);
        }
        YeeDatatable.saveStorage(this.tbName, data);
    }


    private initEvent() {
        let that = this;
        let qel = this.qel;
        $(window).on('resize', function () {
            that.updateRightFixed();
        });
        let trList = qel.find('tbody tr');
        trList.on('mouseenter', function () {
            $(this).addClass('hover');
            that.syncBackground(0);
        });
        trList.on('mouseleave', function () {
            $(this).removeClass('hover');
            that.syncBackground(0);
        });
        trList.on('click', function () {
            trList.removeClass('selected');
            $(this).addClass('selected');
            that.syncBackground(0);
        });
        if (this.leftFixedInside) {
            let trList2 = this.leftFixedInside.find('tbody tr');
            trList2.on('mouseenter', function () {
                $(this).addClass('hover');
                that.syncBackground(1);
            });
            trList2.on('mouseleave', function () {
                $(this).removeClass('hover');
                that.syncBackground(1);
            });
            trList2.on('click', function () {
                trList2.removeClass('selected');
                $(this).addClass('selected');
                that.syncBackground(1);
            });
        }
        if (this.rightFixedInside) {
            let trList3 = this.rightFixedInside.find('tbody tr');
            trList3.on('mouseenter', function () {
                $(this).addClass('hover');
                that.syncBackground(2);
            });
            trList3.on('mouseleave', function () {
                $(this).removeClass('hover');
                that.syncBackground(2);
            });
            trList3.on('click', function () {
                trList3.removeClass('selected');
                $(this).addClass('selected');
                that.syncBackground(2);
            });
        }
        if (this.checkAllFunc == null) {
            this.checkAllFunc = function () {
                let checkBtn = $(this);
                let table = checkBtn.parents('table:first');
                let th = checkBtn.parents('th:first');
                let index = -1;
                let checked = checkBtn.prop('checked');
                table.find('thead th').each(function (idx, item) {
                    if (item == th.get(0)) {
                        index = idx;
                        return false;
                    }
                });
                if (index >= 0) {
                    table.find('tbody tr').each(function (_, trElem) {
                        let box = $(trElem).find('td').eq(index).find(':checkbox');
                        box.prop('checked', checked);
                    });
                }
            }
        }
        //设置全选
        for (let item of  this.column) {
            let checkBtn = item.th.find(':checkbox');
            if (checkBtn.length > 0) {
                if (that.checkAllFunc) {
                    checkBtn.off('click', that.checkAllFunc);
                }
                checkBtn.on('click', that.checkAllFunc);
            }
        }
    }

    /**
     * 同步背景样式
     * @param type
     */
    private syncBackground(type = 0) {
        let qel = this.qel;
        let that = this;
        //从原来的同步到两边
        if (type == 0) {
            qel.find('tbody tr').each(function (idx, trElem) {
                let tr = $(trElem);
                let css = tr.attr('class') || null;
                if (that.leftFixedInside) {
                    let ctr = that.leftFixedInside.find('tbody tr').eq(idx);
                    if (css) {
                        ctr.attr('class', css);
                    } else {
                        ctr.removeAttr('class');
                    }
                }
                if (that.rightFixedInside) {
                    let ctr = that.rightFixedInside.find('tbody tr').eq(idx);
                    if (css) {
                        ctr.attr('class', css);
                    } else {
                        ctr.removeAttr('class');
                    }
                }
            });
        }
        //从左边的同步到两边
        else if (type == 1 && that.leftFixedInside) {
            that.leftFixedInside.find('tbody tr').each(function (idx, trElem) {
                let tr = $(trElem);
                let css = tr.attr('class') || null;
                if (that.rightFixedInside) {
                    let ctr = that.rightFixedInside.find('tbody tr').eq(idx);
                    if (css) {
                        ctr.attr('class', css);
                    } else {
                        ctr.removeAttr('class');
                    }
                }

                let ctr = qel.find('tbody tr').eq(idx);
                if (css) {
                    ctr.attr('class', css);
                } else {
                    ctr.removeAttr('class');
                }

            });
        } else if (type == 2 && that.rightFixedInside) {
            that.rightFixedInside.find('tbody tr').each(function (idx, trElem) {
                let tr = $(trElem);
                let css = tr.attr('class') || null;
                if (that.leftFixedInside) {
                    let ctr = that.leftFixedInside.find('tbody tr').eq(idx);
                    if (css) {
                        ctr.attr('class', css);
                    } else {
                        ctr.removeAttr('class');
                    }
                }
                let ctr = qel.find('tbody tr').eq(idx);
                if (css) {
                    ctr.attr('class', css);
                } else {
                    ctr.removeAttr('class');
                }
            });
        }

    }

    //初始化列宽信息
    private initColumn() {
        let setting = this.setting;
        let qel = this.qel;
        let thRows = qel.find('thead th');
        let trRows = qel.find('tbody tr');
        let that = this;
        for (let item of  this.column) {
            if (item.cover) {
                item.cover.remove();
            }
        }
        let orderFunc = function () {
            let thItem = $(this);
            let name = thItem.data('order');
            qel.find('thead th').not(thItem).removeClass('down').removeClass('up');
            if (that.leftFixedInside) {
                that.leftFixedInside.find('table thead th').not(thItem).removeClass('down').removeClass('up');
            }
            if (that.rightFixedInside) {
                that.rightFixedInside.find('table thead th').not(thItem).removeClass('down').removeClass('up');
            }
            if (thItem.is('.down')) {
                thItem.removeClass('down').addClass('up');
                // @ts-ignore
                qel.emit('order', {name: name, order: 1});
            } else {
                thItem.removeClass('up').addClass('down');
                // @ts-ignore
                qel.emit('order', {name: name, order: -1});
            }
        }
        this.column = [];
        for (let i = 0; i < thRows.length; i++) {
            let th = thRows.eq(i);
            let data: Column = {
                width: 0,
                th: th,
                tdList: [],
                cover: null,
                fixed: 0,
                wBorder: 0
            };
            trRows.each(function (_, elem) {
                let tdCols = $(elem).find('td');
                data.tdList.push(tdCols.eq(i));
            });
            if (th.data('order')) {
                th.on('click', orderFunc);
            }
            data.width = th.outerWidth();
            data.wBorder = th.outerWidth(true) - th.width();
            let offLeft = th[0].offsetLeft;
            if (setting.leftFixed > 0 && i < setting.leftFixed) {
                data.fixed = 1;
            } else if (setting.rightFixed > 0 && i >= thRows.length - setting.rightFixed) {
                data.fixed = 2;
            } else if (setting.resize) {
                data.cover = $('<div class="yee-datatable-cover"></div>').appendTo(this.tableInside);
                data.cover.css({
                    left: offLeft + data.width,
                    top: 0,
                    height: th.outerHeight()
                });
                data.cover.on('mousedown', data, function (ev) {
                    let item = ev.data;
                    if (item.fixed) {
                        return false;
                    }
                    let oldWidth = item.width - item.wBorder;//原来内宽
                    let oldTbWidth = qel.outerWidth(true);//原来表格宽
                    that.tableLayer.addClass('resize');
                    mover.start(ev, function (oldPt: Point, newPt: Point) {
                        let left = newPt.left - oldPt.left;
                        let width = oldWidth + left;
                        if (width < 30) {
                            width = 30;
                            left = width - oldWidth;
                        }
                        //拉宽，表格提前拉开
                        that.tableInside.width(oldTbWidth + left + 1000);
                        let th = item.th;
                        th.width(width); //设置宽
                        item.width = th.outerWidth(true);//重新获得宽
                        that.reDrawCover();
                        that.syncHeight();
                        //收缩 表格跟随收缩
                        that.tableInside.width(qel.outerWidth(true));
                        that.updateRightFixed();
                    }, function () {
                        that.tableLayer.removeClass('resize');
                        that.reDrawCover();
                        that.syncHeight();
                        that.tableInside.width(qel.outerWidth(true));
                        that.updateRightFixed();
                    });
                });
            }
            this.column.push(data);
        }
    }

    public getCheckData(name: string = null) {
        let values = [];
        for (let item of  this.column) {
            let checkBtn = item.th.find(':checkbox');
            if (checkBtn.length > 0) {
                for (let td of item.tdList) {
                    let box = td.find(':checkbox:checked');
                    if (name && box.attr('name') != name) {
                        continue;
                    }
                    if (box.val()) {
                        values.push(box.val());
                    }
                }
            }
        }
        return values;
    }

    //重绘覆盖层
    private reDrawCover() {
        let column = this.column;
        for (let item of column) {
            if (item.cover !== null) {
                let offLeft = item.th[0].offsetLeft;
                if (!this.rightFixedInLine && item.fixed == 2) {
                    item.cover.css({
                        left: offLeft,
                    });
                    item.cover.addClass('right-cover');
                } else {
                    item.cover.css({
                        left: offLeft + item.width,
                    });
                    if (item.fixed == 2) {
                        item.cover.removeClass('right-cover');
                    }
                }
            }
        }
        this.saveCacheSize();
    }

    //同步高度
    private syncHeight() {
        let column = this.column;
        let first = column[0];
        let last = column[column.length - 1];
        if (first && first.th.get(0) && first.th.get(0)['__clone']) {
            first.th.height(first.th.get(0)['__clone'].height());
            for (let td of first.tdList) {
                if (td.get(0) && td.get(0)['__clone']) {
                    td.height(td.get(0)['__clone'].height());
                }
            }
        }
        if (last && last.th.get(0) && last.th.get(0)['__clone']) {
            last.th.height(last.th.get(0)['__clone'].height());
            for (let td of last.tdList) {
                if (td.get(0) && td.get(0)['__clone']) {
                    td.height(td.get(0)['__clone'].height());
                }
            }
        }
    }

    /**
     * 克隆
     * @param qe
     */
    private clone(qe: JQuery<HTMLElement>) {
        let elem: HTMLElement = qe.get(0);
        let cp: JQuery<HTMLElement> = elem['__clone'] = qe.clone();
        cp.css({'pointer-events': 'none', 'opacity': 0});
        // th.replaceWith(cp); 3.3.1 jq 存在替换节点会删除原来事件
        qe.parent().get(0).replaceChild(cp.get(0), elem);
    }

    /**
     * 初始化左边固定区域
     */
    private initLeftFixed = function () {
        let setting = this.setting;
        if (setting.leftFixed <= 0) {
            return;
        }
        let qel = this.qel;
        let that = this;
        let column = this.column;
        let tableInside: JQuery<HTMLElement> = this.leftFixedInside;
        let table = null;
        //创建表格
        if (tableInside == null) {
            this.leftFixedInside = tableInside = $('<div class="yee-datatable-left-fixed"></div>').appendTo(that.tableLayer);
            table = $('<table/>');
            table.attr('class', qel.attr('class'));
            table.attr('cellspacing', qel.attr('cellspacing'));
            table.attr('cellpadding', qel.attr('cellpadding'));
            table.attr('border', qel.attr('border'));
            $('<thead><tr></tr></thead>').appendTo(table);
            $('<tbody></tbody>').appendTo(table);
            table.removeAttr('id');
            table.removeAttr('yee-module');
            table.appendTo(tableInside);
            table.width('auto');
        } else {
            table = tableInside.children('table');
        }
        let fixed: Array<Column> = this.leftFixedColumn = [];
        for (let i = 0; i < setting.leftFixed && i < column.length; i++) {
            fixed.push(column[i]);
        }
        let thead = table.find('thead tr').empty();
        let tbody = table.find('tbody').empty();
        let trTpl = qel.find('tbody tr:first');
        if (trTpl.length == 0) {
            this.updateRightFixed();
            this.syncHeight();
            return;
        }
        //行
        let trList = [];
        for (let item of fixed) {
            let th = item.th;
            this.clone(th);
            $(th).appendTo(thead);
            let tdList = item.tdList;
            for (let n = 0; n < tdList.length; n++) {
                let td = tdList[n];
                this.clone(td);
                if (trList[n] === void 0) {
                    trList[n] = [];
                }
                trList[n].push(td);
            }
        }
        for (let row of trList) {
            let tr = trTpl.clone().empty();
            for (let td of row) {
                td.appendTo(tr);
            }
            tr.appendTo(tbody);
        }
        //处理拖动
        for (let data of fixed) {
            let th = data.th;
            if (!th.get(0)['__clone'] || !setting.resize) {
                continue;
            }
            let offLeft = th[0].offsetLeft;
            data.cover = $('<div class="yee-datatable-cover left-cover"></div>').appendTo(tableInside);
            data.cover.css({
                left: offLeft + data.width,
                top: 0,
                height: th.outerHeight()
            });
            data.cover.on('mousedown', data, function (ev) {
                let item = ev.data;
                let oldWidth = item.width - item.wBorder;//原来内宽
                let oldTbWidth = table.outerWidth(true);//原来表格宽
                let oldOrgTbWidth = qel.outerWidth(true);//原来表格宽
                that.tableLayer.addClass('resize');
                mover.start(ev, function (oldPt: Point, newPt: Point) {
                    let left = newPt.left - oldPt.left;
                    let width = oldWidth + left;
                    if (width < 30) {
                        width = 30;
                        left = width - oldWidth;
                    }
                    tableInside.width(oldTbWidth + left + 1000);
                    that.tableInside.width(oldOrgTbWidth + left + 1000);
                    let th = item.th;
                    th.width(width); //设置宽
                    th.get(0)['__clone'].width(width);
                    item.width = th.outerWidth(true);//重新获得宽
                    that.reDrawCover();
                    that.syncHeight();
                    tableInside.width(table.outerWidth(true));
                    that.tableInside.width(qel.outerWidth(true));
                    that.updateRightFixed();
                }, function () {
                    that.tableLayer.removeClass('resize');
                    that.reDrawCover();
                    that.syncHeight();
                    tableInside.width(table.outerWidth());
                    that.tableInside.width(qel.outerWidth(true));
                    that.updateRightFixed();
                });
            });
        }
        this.syncHeight();
    }

    /**
     * 初始化右边固定区域
     */
    private initRightFixed = function () {
        let setting = this.setting;
        if (setting.rightFixed <= 0) {
            return;
        }
        let qel = this.qel;
        let that = this;
        let column = this.column;
        let tableInside: JQuery<HTMLElement> = this.rightFixedInside;
        let table = null;
        //创建表格
        if (tableInside == null) {
            this.rightFixedInside = tableInside = $('<div class="yee-datatable-right-fixed"></div>').appendTo(that.tableLayer);
            table = $('<table/>');
            table.attr('class', qel.attr('class'));
            table.attr('cellspacing', qel.attr('cellspacing'));
            table.attr('cellpadding', qel.attr('cellpadding'));
            table.attr('border', qel.attr('border'));
            $('<thead><tr></tr></thead>').appendTo(table);
            $('<tbody></tbody>').appendTo(table);
            table.removeAttr('id');
            table.removeAttr('yee-module');
            table.appendTo(tableInside);
            table.width('auto');
        } else {
            table = tableInside.children('table');
        }
        let fixed: Array<Column> = this.rightFixedColumn = [];
        for (let i = column.length - setting.rightFixed; i < column.length; i++) {
            fixed.push(column[i]);
        }
        let thead = table.find('thead tr').empty();
        let tbody = table.find('tbody').empty();
        let trTpl = qel.find('tbody tr:first');
        if (trTpl.length == 0) {
            this.updateRightFixed();
            return;
        }
        //行
        let trList = [];
        for (let item of fixed) {
            let th = item.th;
            this.clone(th);
            $(th).appendTo(thead);
            let tdList = item.tdList;
            for (let n = 0; n < tdList.length; n++) {
                let td = tdList[n];
                this.clone(td);
                if (trList[n] === void 0) {
                    trList[n] = [];
                }
                trList[n].push(td);
            }
        }
        for (let row of trList) {
            let tr = trTpl.clone().empty();
            for (let td of row) {
                td.appendTo(tr);
            }
            tr.appendTo(tbody);
        }
        //处理拖动
        for (let data of fixed) {
            let th = data.th;
            if (!th.get(0)['__clone'] || !setting.resize) {
                continue;
            }
            let offLeft = th[0].offsetLeft;
            data.cover = $('<div class="yee-datatable-cover"></div>').appendTo(tableInside);
            if (this.rightFixedInLine) {
                data.cover.css({
                    left: offLeft + data.width,
                    top: 0,
                    height: th.outerHeight()
                });
            } else {
                data.cover.css({
                    left: offLeft,
                    top: 0,
                    height: th.outerHeight()
                });
            }
            data.cover.on('mousedown', data, function (ev) {
                let item = ev.data;
                let oldWidth = item.width - item.wBorder;//原来内宽
                let oldTbWidth = table.outerWidth(true);//原来表格宽
                let oldOrgTbWidth = qel.outerWidth(true);//原来表格宽
                that.tableLayer.addClass('resize');
                mover.start(ev, function (oldPt: Point, newPt: Point) {
                    let left = oldPt.left - newPt.left;
                    if (that.rightFixedInLine) {
                        left = -left;
                    }
                    let width = oldWidth + left;
                    if (width < 30) {
                        width = 30;
                        left = width - oldWidth;
                    }
                    tableInside.width(oldTbWidth + left + 1000);
                    that.tableInside.width(oldOrgTbWidth + left + 1000);
                    let th = item.th;
                    th.width(width); //设置宽
                    th.get(0)['__clone'].width(width);
                    item.width = th.outerWidth(true);//重新获得宽
                    that.reDrawCover();
                    that.syncHeight();
                    tableInside.width(table.outerWidth(true));
                    that.tableInside.width(qel.outerWidth(true));
                }, function () {
                    that.tableLayer.removeClass('resize');
                    that.reDrawCover();
                    that.syncHeight();
                    tableInside.width(table.outerWidth(true));
                    that.tableInside.width(qel.outerWidth(true));
                    that.updateRightFixed();
                });
            });
        }
        this.syncHeight();
        this.updateRightFixed();
    }

    /**
     * 更新右边
     * @param offset
     */
    private updateRightFixed() {
        let qel = this.qel;
        let tableLayer = this.tableLayer;
        let width = qel.outerWidth(true);
        let layWidth = tableLayer.width();
        if (width > layWidth) {
            if (this.rightFixedInside !== null) {
                this.rightFixedInside.css({right: 0, left: 'auto'});
            }
            this.rightFixedInLine = false;
        } else {
            if (this.rightFixedInside !== null) {
                let right = width - this.rightFixedInside.outerWidth();
                this.rightFixedInside.css({left: right, right: 'auto'});
            }
            this.rightFixedInLine = true;
        }
        this.reDrawCover();
    }

    /**
     * 渲染数据
     * @param source
     */
    public render(source) {
        if (this.trTemplate == null) {
            console.error('未定义渲染模板!');
            return;
        }
        let qel = this.qel;
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
        let tbody = qel.find('tbody').empty();
        if (list.length == 0) {
            this.isEmptyData = true;
            let emptyText = this.setting.emptyText || '没有找到任何数据!';
            let trTpl = this.trTemplate.clone();
            trTpl.empty();
            let td = $('<td colspan="1000" style="text-align: center"></td>').text(emptyText);
            td.appendTo(trTpl);
            tbody.append(trTpl);
            return;
        }
        let temp = this.trTemplate.html().match(/\s:[a-z0-9_-]+\s*=/ig);
        let assign = this.trTemplate.attr('yee-item') || 'it';
        //console.log(assign);
        let tempMap: { [p: string]: string } = {};
        if (temp) {
            for (let item of temp) {
                let name = String(item).replace(/\s(:[a-z0-9_-]+)\s*=/i, '$1');
                name = name.toLowerCase();
                tempMap[name] = '[' + name.replace(/^:/, '\\:') + ']';
            }
        }
        //console.log(tempMap);
        for (let item of list) {
            let trTpl = this.trTemplate.clone();
            trTpl.removeAttr('yee-template');
            for (let name in tempMap) {
                let find = tempMap[name];
                trTpl.find(find).each(function () {
                    let el = $(this);
                    let text = (function () {
                        let code = String(el.attr(name) || '').trim();
                        if (code) {
                            if (code.substr(0, 1) == '@') {
                                return code.substr(1);
                            }
                            try {
                                code = 'return (' + code.trim() + ');';
                                let func = new Function(assign, code);
                                //console.log(func);
                                if (typeof func == 'function') {
                                    return func(item);
                                }
                            } catch (e) {
                                return '';
                            }
                        }
                        return '';
                    })();
                    switch (name) {
                        case ':text':
                            el.text(text);
                            break;
                        case ':value':
                            el.val(text);
                            break;
                        case ':html':
                            el.html(text);
                            break;
                        default:
                            let attr = name.replace(/^:/, '');
                            el.attr(attr, text);
                            break;
                    }
                    el.removeAttr(name);
                });
            }
            tbody.append(trTpl);
        }
        Yee.update(tbody);
    }


    /**
     * 加载
     * @param url
     * @param showMessage
     * @param prams
     */
    public load(url: string = null, prams: { [p: string]: any } = {}, showMessage = false) {
        let deferred = $.Deferred();
        let qel = this.qel;
        let that = this;
        url = url || this.setting.url;
        let method = this.setting.method || 'get';
        let args = Yee.parseUrl(url);
        args.path = args.path || window.location.pathname;
        for (let key in prams) {
            args.prams[key] = prams[key];
        }
        this.lastSend = {
            url: args.path,
            data: args.prams
        };

        $.ajax({
            type: method,
            url: args.path,
            data: args.prams,
            cache: false,
            dataType: 'json',
            success: function (ret) {
                //拉取数据成功
                if (ret.status === true) {
                    if (showMessage && ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 1, time: 1000});
                    }
                    that.render(ret);
                    // @ts-ignore
                    qel.emit('success', ret);
                    deferred.resolve(ret);
                }
                //拉取数据错误
                if (ret.status === false) {
                    if (showMessage && ret.msg && typeof (ret.msg) === 'string') {
                        Yee.msg(ret.msg, {icon: 0, time: 2000});
                    }
                    // @ts-ignore
                    qel.emit('error', ret);
                    deferred.reject();
                }
            }
        });
        return deferred;
    }

    public reload(showMessage = false) {
        if (this.lastSend) {
            return this.load(this.lastSend.url, this.lastSend.data, showMessage);
        }
        return $.Deferred().resolve();
    }

    public reset(showMessage = false) {
        return this.load(this.setting.url, null, showMessage);
    }
}