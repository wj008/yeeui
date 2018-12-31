import {Yee} from "../yee";

export class YeeContainer {

    private index = 0;
    private template: string = null;
    private readonly qel: JQuery<HTMLElement>;
    private readonly setting: { [p: string]: any };
    private readonly wrap: JQuery<HTMLElement>;

    public constructor(elem, setting: { [p: string]: any } = {}) {
        let qel = this.qel = $(elem);
        let that = this;
        this.setting = setting;
        setting.minSize = parseInt(setting['minSize'] || 0);
        setting.maxSize = parseInt(setting['maxSize'] || 1000);
        this.index = parseInt(setting.index || '0');
        this.wrap = qel.find('.container-wrap');
        if (setting.source == null || setting.source == '') {
            console.error('没有模板源数据!');
            return;
        }
        let source = setting.source;
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

    public init() {
        let that = this;
        let qel = this.qel;
        let setting = this.setting;
        let wrap = this.wrap;
        let addBtn = qel.find('a[name=add]');
        addBtn.on('click', function () {
            that.addItem();
        });
        //删除
        qel.on('click', 'a[name=remove]', function () {
            if (wrap.find('.container-item').length <= setting.minSize) {
                Yee.alert('至少需要保留 ' + setting.minSize + ' 项。');
                return;
            }
            let delItem = $(this).parents('.container-item:first');
            Yee.confirm('确定要删除该行了吗？', function (idx) {
                delItem.remove();
                that.updateIndex();
                if (wrap.find('.container-item').length <= setting.minSize) {
                    qel.find('a[name=remove]').hide();
                }
                Yee.close(idx);
            });
        });
        //插入
        qel.on('click', 'a[name=insert]', function () {
            let item = that.addItem();
            let prev = $(this).parents('.container-item:first');
            if (item) {
                prev.before(item);
            }
            that.updateIndex();
        });
        //上移
        qel.on('click', 'a[name=upsort]', function () {
            let next = $(this).parents('.container-item:first');
            let prev = next.prev('.container-item');
            if (prev.length > 0) {
                prev.before(next);
            }
            that.updateIndex();
            return false;
        });
        //下移
        qel.on('click', 'a[name=dnsort]', function () {
            let prev = $(this).parents('.container-item:first');
            let next = prev.next('.container-item');
            if (next.length > 0) {
                next.after(prev);
            }
            that.updateIndex();
            return false;
        });
        //如果存在至少行数
        if (setting['minSize']) {
            if (wrap.find('.container-item').length < setting['minSize']) {
                for (let i = 0; i < setting['minSize']; i++) {
                    that.addItem();
                    if (wrap.find('.container-item').length >= setting['minSize']) {
                        break;
                    }
                }
            }
        }
        this.updateIndex();
    }

    public addItem() {
        if (this.template == null) {
            return;
        }
        this.index++;
        let qel = this.qel;
        let setting = this.setting;
        if (this.wrap.find('.container-item').length >= setting.maxSize) {
            Yee.alert('至多不可超过 ' + setting.maxSize + ' 项。');
            return null;
        }
        let code = this.template.replace(/@@index@@/g, 'a' + this.index);
        let item = $(code).appendTo(this.wrap);
        if (this.wrap.find('.container-item').length > setting.minSize) {
            qel.find('a[name=remove]').show();
        }
        this.updateIndex();
        Yee.update(item);
        // @ts-ignore
        qel.emit('addItem', item);
        return item;
    }

    public updateIndex() {
        let setting = this.setting;
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
        if (setting.maxSize > 0 && len >= setting.maxSize) {
            $('a[name=add]').hide();
        } else {
            $('a[name=add]').show();
        }
    }

}