/**
 * 加载类别
 */
class Loader {
    /**
     * 获取类型及完整路径
     * @param path
     * @param baseUrl
     * @returns {(string|*)[]}
     */
    static getType(path, baseUrl) {
        let type = 'js';
        let match = path.match(/^css\!(.*)$/i);
        if (match) {
            path = match[1];
            type = 'css';
        }
        if (!/^\//.test(path)) {
            path = baseUrl + path;
        }
        return [type, path];
    }

    /**
     * 加载js
     * @param url 完整路径
     * @param callback
     */
    static loadCss(url, callback) {
        let heads = document.getElementsByTagName('head');
        if (heads.length > 0) {
            let head = heads[0];
            let link = document.createElement('link');
            link.href = url;
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            head.appendChild(link);
        }
        callback({url: url, status: true});
    }

    /**
     * 加载js文件
     * @param url
     * @param callback
     */
    static loadScript(url, callback) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        if (script['readyState']) {
            // @ts-ignore
            script.onreadystatechange = function () {
                // @ts-ignore
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    // @ts-ignore
                    script.onreadystatechange = null;
                    callback({url: url, status: true});
                }
            };
        } else {
            script.onload = function () {
                callback({url: url, status: true});
            };
            script.onerror = function () {
                callback({url: url, status: false});
            };
        }
        try {
            script.src = url;
            let head = document.getElementsByTagName('head');
            if (head.length > 0) {
                head[0].appendChild(script);
            } else {
                document.body.appendChild(script);
            }
        } catch (e) {
            callback({url: url, status: false});
        }
    }

    /**
     * 加载文件
     * @param path
     * @param baseUrl
     * @returns {Promise<unknown>|*}
     */
    static load(path, baseUrl) {
        if (Loader.loadedFiles[path]) {
            return Loader.loadedFiles[path];
        }
        Loader.loadedFiles[path] = true;
        let promise = new Promise(function (resolve, reject) {
            let [type, url] = Loader.getType(path, baseUrl);
            if (type == 'css') {
                return Loader.loadCss(url, resolve);
            }
            return Loader.loadScript(url, resolve);
        });
        Loader.loadedFiles[path] = promise;
        return promise;
    }
}

Loader.loadedFiles = {};
export {Loader}