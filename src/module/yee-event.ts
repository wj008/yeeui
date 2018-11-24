export class YeeEvent {

    private eventMap: { [p: string]: Array<{ once: boolean, func: Function }> } = {};

    public emit(event: string, ...data) {
        if (this.eventMap[event]) {
            let ret = true;
            for (let i = this.eventMap[event].length - 1; i >= 0; i--) {
                let item = this.eventMap[event][i];
                let tmp = item.func(...data);
                if (typeof (tmp) == 'boolean') {
                    ret = ret && tmp;
                }
                if (item.once) {
                    this.eventMap[event].splice(i, 1);
                    if (this.eventMap[event].length == 0) {
                        delete this.eventMap[event];
                    }
                }
            }
            return ret;
        }
        return true;
    }

    public on(event: string, func: Function) {
        let events = event.split(' ');
        for (let i = 0; i < events.length; i++) {
            let key = events[i];
            if (key == '') {
                continue;
            }
            if (!this.eventMap[key]) {
                this.eventMap[key] = [];
            }
            this.eventMap[key].push({once: false, func: func});
        }
    }

    public one(event: string, func: Function) {
        let events = event.split(' ');
        for (let i = 0; i < events.length; i++) {
            let key = events[i];
            if (key == '') {
                continue;
            }
            if (!this.eventMap[key]) {
                this.eventMap[key] = [];
            }
            this.eventMap[key].push({once: true, func: func});
        }
    }

    public off(event: string, func: Function = null) {
        if (this.eventMap[event]) {
            if (func !== null) {
                let temp = [];
                for (let item of this.eventMap[event]) {
                    if (item.func !== func) {
                        temp.push(item);
                    }
                }
                this.eventMap[event] = temp;
            } else {
                this.eventMap[event] = null;
                delete this.eventMap[event];
            }
        }
    }
}