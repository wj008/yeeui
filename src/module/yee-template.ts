import {Yee} from "../yee";

export class YeeTemplate {

    private readonly template: HTMLElement = null;
    private static index = 0;
    public static instance = {};
    //已经插入的
    private rendered = [];
    private readonly _parent = null;
    private readonly placeholder = null;

    public constructor(elem, setting: { [p: string]: any } = {}) {
        let qel = $(elem);
        let template = this.template = qel.get(0);
        if (setting.tplId) {
            YeeTemplate.instance[setting.tplId] = this;
        }
        let oComment = this.placeholder = document.createComment('yee-template-' + YeeTemplate.index++);
        let parent = this._parent = template.parentNode;
        parent.insertBefore(oComment, template);
        parent.removeChild(template);
        if (setting.source) {
            this.render(setting.source);
        }
    }

    private static getAttr(template) {
        let attrs = template.attributes;
        let data = {};
        for (let i = 0; i < attrs.length; i++) {
            let item = attrs.item(i);
            let name = item.name;
            if (/^:[a-z0-9_-]+$/ig.test(name)) {
                data[name] = item.value;
            }
        }
        return data;
    }

    private static runFunc(code, data) {
        try {
            code = 'return (' + code.trim() + ');';
            let keys = [];
            for (let key in data) {
                keys.push(key + '=__data__.' + key);
            }
            if (keys.length > 0) {
                code = 'var ' + keys.join(',') + ';' + code;
            }
            let func = new Function('__data__', code);
            if (typeof func == 'function') {
                return func(data);
            }
        } catch (e) {
            return null;
        }
    }

    private renderFor(elem: HTMLElement, data, each, item) {
        elem.removeAttribute('yee-each');
        elem.removeAttribute('yee-item');
        let key = elem.getAttribute('yee-key') || null;
        if (key) {
            elem.removeAttribute('yee-key');
        }
        if (!/^\w+$/.test(key)) {
            key = null;
        }
        let loop = YeeTemplate.runFunc(each, data);
        if (Yee.isArray(loop)) {
            for (let i = 0; i < loop.length; i++) {
                let value = loop[i];
                let itemData = Object.assign({}, data);
                itemData[item] = value;
                if (key) {
                    itemData[key] = i;
                }
                let clone = elem.cloneNode(true);
                if (!elem.parentNode) {
                    this._parent.insertBefore(clone, this.placeholder);
                    this.rendered.push(clone);
                } else {
                    elem.parentNode.insertBefore(clone, elem);
                }
                this.renderItem(clone, itemData);
            }
        } else if (Yee.isObject(loop)) {
            for (let i in loop) {
                let value = loop[i];
                let itemData = Object.assign({}, data);
                itemData[item] = value;
                if (key) {
                    itemData[key] = i;
                }
                let clone = elem.cloneNode(true);
                if (!elem.parentNode) {
                    this._parent.insertBefore(clone, this.placeholder);
                    this.rendered.push(clone);
                } else {
                    elem.parentNode.insertBefore(clone, elem);
                }
                this.renderItem(clone, itemData);
            }
        }
        if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }

    private renderIf(elem: HTMLElement, data, code) {
        elem.removeAttribute('yee-if');
        let condition = YeeTemplate.runFunc(code, data);
        if (condition) {
            let each = elem.getAttribute('yee-each');
            let item = elem.getAttribute('yee-item');
            if (each && item && /^\w+$/.test(item)) {
                this.renderFor(elem, data, each, item);
                return;
            }
            this.renderItem(elem, data);
        } else {
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }
    }

    private renderItem(elem, data) {
        let attrs = YeeTemplate.getAttr(elem);
        for (let name in attrs) {
            elem.removeAttribute(name);
            let code = String(attrs[name]).trim();
            if (!code) {
                continue;
            }
            let text = YeeTemplate.runFunc(code, data);
            switch (name) {
                case ':text':
                    elem.innerText = text;
                    break;
                case ':html':
                    elem.innerHTML = text;
                    break;
                default:
                    let attr = name.replace(/^:/, '');
                    elem.setAttribute(attr, text);
                    break;
            }
        }
        for (let child of elem.children) {
            this.renderAll(child, data);
        }
        if (!elem.parentNode) {
            this._parent.insertBefore(elem, this.placeholder);
            this.rendered.push(elem);
        }

    }

    private renderAll(elem: HTMLElement, data) {
        let code = elem.getAttribute('yee-if');
        if (code) {
            this.renderIf(elem, data, code);
            return;
        }
        let each = elem.getAttribute('yee-each');
        let item = elem.getAttribute('yee-item');
        if (each && item && /^\w+$/.test(item)) {
            this.renderFor(elem, data, each, item);
            return;
        }
        this.renderItem(elem, data);
    }

    public render(data) {
        for (let node of this.rendered) {
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
        this.rendered = [];
        // @ts-ignore
        let tpl: HTMLElement = this.template.cloneNode(true);
        tpl.removeAttribute('yee-template');
        this.renderAll(tpl, data);
        return this.rendered;
    }

    public parent() {
        return this._parent;
    }

}