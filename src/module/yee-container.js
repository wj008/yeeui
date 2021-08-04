class YeeContainer {
    constructor(elem) {
        this.index = 0;
        let qel = this.qel = $(elem);
        let that = this;
        this.minSize = parseInt(qel.data('min-size') || 0);
        this.maxSize = parseInt(qel.data('max-size') || 1000);
        this.initSize = parseInt(qel.data('init-size') || 0);
        this.index = parseInt(qel.data('index') || 0);
        this.wrap = qel.find('.container-wrap');
        if (this.wrap.find('.container-item').length > 0) {
            this.initSize = 0;
        }
        this.source = qel.data('source');
        if (this.source == null || this.source == '') {
            console.error('没有模板源数据!');
            return;
        }
        let source = this.source;
        if (window.atob) {
            that.template = decodeURIComponent(window.atob(source).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            that.init();
        } else {
            Yee.use('base64').then(function () {
                // @ts-ignore
                that.template = Base64.decode(source);
                that.init();
            });
        }
    }

    init() {
        let that = this;
        let qel = this.qel;
        let wrap = this.wrap;
        let addBtn = qel.find('a[name=add]');
        addBtn.on('click', function () {
            that.addItem();
        });
        //删除
        qel.on('click', 'a[name=remove]', function () {
            that.removeItem(this);
        });
        //插入
        qel.on('click', 'a[name=insert]', function () {
            that.insertItem(this);
        });
        //上移
        qel.on('click', 'a[name=upsort]', function () {
            that.upSort(this);
            return false;
        });
        //下移
        qel.on('click', 'a[name=dnsort]', function () {
            that.dnSort(this);
            return false;
        });
        //如果存在至少行数
        if (that.minSize || that.initSize) {
            let size = Math.max(that.minSize, that.initSize);
            if (wrap.find('.container-item').length < size) {
                for (let i = 0; i < size; i++) {
                    that.addItem();
                    if (wrap.find('.container-item').length >= size) {
                        break;
                    }
                }
            }
        }
        this.updateIndex();
        qel.emit('update');
    }

    upSort(element) {
        let qel = this.qel;
        let that = this;
        let next = $(element).parents('.container-item:first');
        let prev = next.prev('.container-item');
        if (prev.length > 0) {
            prev.before(next);
        }
        that.updateIndex();
        qel.emit('update');
    }

    dnSort(element) {
        let qel = this.qel;
        let that = this;
        let prev = $(element).parents('.container-item:first');
        let next = prev.next('.container-item');
        if (next.length > 0) {
            next.after(prev);
        }
        that.updateIndex();
        qel.emit('update');
    }

    insertItem(element) {
        let qel = this.qel;
        let that = this;
        let item = that.addItem();
        let prev = $(element).parents('.container-item:first');
        if (item) {
            prev.before(item);
        }
        that.updateIndex();
        qel.emit('update');
        return item;
    }

    removeItem(element) {
        let that = this;
        let qel = this.qel;
        let wrap = this.wrap;
        if (wrap.find('.container-item').length <= that.minSize) {
            Yee.alert('至少需要保留 ' + that.minSize + ' 项。');
            return;
        }
        let delItem = $(element).parents('.container-item:first');
        Yee.confirm('确定要删除该行了吗？', function (idx) {
            delItem.remove();
            that.updateIndex();
            if (wrap.find('.container-item').length <= that.minSize) {
                qel.find('a[name=remove]').hide();
            }
            Yee.close(idx);
            qel.emit('update');
        });
    }

    addItem() {
        if (this.template == null) {
            return;
        }
        this.index++;
        let qel = this.qel;
        let that = this;
        if (this.wrap.find('.container-item').length >= that.maxSize) {
            Yee.alert('至多不可超过 ' + that.maxSize + ' 项。');
            return null;
        }
        let code = this.template.replace(/@@index@@/g, 'a' + this.index);
        let item = $(code).appendTo(this.wrap);
        if (this.wrap.find('.container-item').length > that.minSize) {
            qel.find('a[name=remove]').show();
        }
        this.updateIndex();
        Yee.render(item).then(function () {
            qel.emit('addItem', item);
            qel.emit('update');
        });
        return item;
    }

    updateIndex() {
        let that = this;
        let qel = this.qel;
        let len = this.wrap.find('.container-item').length;
        this.wrap.find('.container-item').each(function (idx, el) {
            if (idx == 0) {
                $(el).find('a[name=upsort]').hide();
            } else {
                $(el).find('a[name=upsort]').show();
            }
            if (idx == len - 1) {
                $(el).find('a[name=dnsort]').hide();
            } else {
                $(el).find('a[name=dnsort]').show();
            }
            $(el).find('[name=index]').text(idx + 1);
        });
        if (that.maxSize > 0 && len >= that.maxSize) {
            qel.find('a[name=add]').hide();
        } else {
            qel.find('a[name=add]').show();
        }
    }
}

export {YeeContainer}