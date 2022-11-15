class YeeTemplate {
    constructor(element, define = {}) {
        let qel = $(element);
        let that = this;
        this.template = qel.get(0);
        let cp = $(this.template).clone();
        // @ts-ignore
        this.app = new Vue({
            el: cp.get(0),
            data: define
        });
    }

    render(data) {
        let that = this;
        return new Promise(function (resolve) {
            let vm = that.app;
            for (let key in data) {
                vm[key] = data[key];
            }
            vm.$nextTick(function () {
                vm.$el.removeAttribute('yee-template');
                let node = vm.$el.cloneNode(true);
                let parent = that.template.parentNode;
                parent.replaceChild(node, that.template);
                that.template = node;
                Yee.render(that.template).then(function () {
                    resolve(true);
                });
            });
        });
    }
}

export {YeeTemplate}