"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yee_1 = require("../yee");
class YeeUpload {
    static getFileInfo(file) {
        let path = file.name.toString();
        let extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
        return { path: path, extension: extension };
    }
    static getExtension(url) {
        return url.lastIndexOf('.') === -1 ? '' : url.substr(url.lastIndexOf('.') + 1, url.length).toLowerCase();
    }
    static createImage(url, width, height) {
        let def = $.Deferred();
        let imgTemp = new Image();
        imgTemp.onload = function () {
            let w = imgTemp.width;
            let h = imgTemp.height;
            if (w > width) {
                let pt = width / w; //高比宽
                w = width;
                h = h * pt;
            }
            if (h > height) {
                let pt = height / h; //宽比高
                h = height;
                w = w * pt;
            }
            let img = $('<img/>');
            img.height(Math.round(h));
            img.width(Math.round(w));
            img.attr('src', url);
            // let table = $('<table  border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0px; vertical-align:middle; text-align:center; overflow: hidden; line-height:0px;"></td></tr></table>');
            let table = $('<div style="display: table-cell; text-align: center; vertical-align: middle; overflow: hidden; line-height: 0px;"></div>');
            table.width(width);
            table.height(height);
            table.append(img);
            //table.find('td').append(img);
            def.resolve(table);
        };
        imgTemp.src = url;
        return def;
    }
    constructor(elem, setting) {
        this.setting = setting;
        this.qel = $(elem);
        let that = this;
        let multiple = setting.multiple || false;
        let fieldName = setting.fieldName || 'filedata';
        let type = setting.type || 'file';
        // console.log(setting);
        if (type == 'image') {
            multiple = false;
        }
        let form = this.form = $('<form></form>').hide().appendTo(document.body);
        let field = this.field = $('<input type="file"/>').attr('name', fieldName).appendTo(form);
        if (multiple) {
            field.attr('multiple', 'multiple');
        }
        field.on('change', function () {
            that.upload();
            setTimeout(function () {
                form.trigger('reset');
            }, 100);
            return false;
        });
        //文件上传
        if (type == 'file') {
            that.upFile();
        }
        //单图片上传
        else if (type == 'image') {
            that.upImage();
        }
        //多图上传
        else if (type == 'imgGroup') {
            that.upImgGroup();
        }
        //多文件上传
        else if (type == 'fileGroup') {
            that.upFileGroup();
        }
    }
    //上传文档
    upFile() {
        let field = this.field;
        let qel = this.qel;
        if (qel.is('input')) {
            let button = $('<a  href="javascript:;" class="yee-btn">选择文件</a>');
            button.insertAfter(qel);
            button.on('click', function () {
                field.trigger('click');
                // @ts-ignore
                if (typeof (qel.setDefault) == 'function') {
                    // @ts-ignore
                    qel.setDefault();
                }
                return false;
            });
            qel.on('uploadComplete', function (ev, ret) {
                if (!ret.status) {
                    if (ret.msg !== '') {
                        yee_1.Yee.alert(ret.msg);
                    }
                    return;
                }
                if (ret.data) {
                    if (yee_1.Yee.isArray(ret.data)) {
                        let urls = [];
                        for (let i = 0; i < ret.data.length; i++) {
                            if (ret.data[i].url) {
                                urls.push(ret.data[i].url);
                            }
                        }
                        qel.val(JSON.stringify(urls));
                    }
                    else if (ret.data.url) {
                        qel.val(ret.data.url);
                    }
                }
                if (ret.msg) {
                    yee_1.Yee.msg(ret.msg);
                }
            });
        }
        else if (qel.is('a')) {
            qel.on('click', function () {
                field.trigger('click');
                return false;
            });
        }
    }
    //上传图片
    upImage() {
        let setting = this.setting;
        let field = this.field;
        let qel = this.qel;
        let btnWidth = setting.btnWidth || 100;
        let btnHeight = setting.btnHeight || 100;
        qel.hide();
        let btnWrap = $('<div class="yee-img-wrap"></div>');
        btnWrap.insertAfter(qel);
        let button = $('<a class="img-btn" href="javascript:;"></a>').appendTo(btnWrap);
        button.width(btnWidth).height(btnHeight);
        let delBtn = $('<a href="javascript:;"></a>').addClass('img-del').hide().appendTo(btnWrap);
        delBtn.on('click', function () {
            qel.val('');
            button.empty();
            button.removeClass('img-bgnone');
        });
        if (qel.val()) {
            YeeUpload.createImage(qel.val(), btnWidth, btnHeight).then(function (img) {
                button.empty().append(img);
                button.addClass('img-bgnone');
                delBtn.show();
            });
        }
        qel.on('uploadComplete', function (ev, ret) {
            if (!ret.status) {
                if (ret.msg !== '') {
                    yee_1.Yee.alert(ret.msg);
                }
                return;
            }
            if (ret.data && ret.data.url) {
                qel.val(ret.data.url);
                YeeUpload.createImage(ret.data.url, btnWidth, btnHeight).then(function (img) {
                    button.empty().append(img);
                    button.addClass('img-bgnone');
                    delBtn.show();
                });
            }
            if (ret.msg) {
                yee_1.Yee.msg(ret.msg);
            }
        });
        button.on('click', function () {
            field.trigger('click');
            if (typeof (qel.setDefault) == 'function') {
                qel.setDefault();
            }
            return false;
        });
    }
    //上传图片组
    upImgGroup() {
        let setting = this.setting;
        let field = this.field;
        let qel = this.qel;
        let btnWidth = setting.btnWidth || 100;
        let btnHeight = setting.btnHeight || 100;
        let size = setting.size || 0;
        qel.hide();
        let shower = $('<div class="yee-img-wrap"></div>').insertAfter(qel);
        let button = $('<a href="javascript:;" class="img-btn"></a>').appendTo(shower);
        button.width(btnWidth).height(btnHeight);
        //跟新值
        let update = function () {
            let imgItems = [];
            shower.find('div.img-item').each(function (index, element) {
                let _this = $(element);
                let dat = _this.data('value');
                imgItems.push(dat);
            });
            if (imgItems.length === 0) {
                qel.val('');
            }
            else {
                let strValue = JSON.stringify(imgItems);
                qel.val(strValue);
            }
            if (size > 0) {
                if (imgItems.length >= size) {
                    button.hide();
                }
                else {
                    button.show();
                }
            }
        };
        let addImg = function (url) {
            let item = $('<div class="img-item"></div>').data('value', url);
            let delBtn = $('<a href="javascript:;"></a>').addClass('img-del').appendTo(item);
            delBtn.hide();
            delBtn.on('click', function () {
                $(this).parent('.img-item').remove();
                update();
            });
            YeeUpload.createImage(url, btnWidth, btnHeight).then(function (img) {
                item.append(img);
                delBtn.show();
            });
            item.insertBefore(button);
            update();
        };
        let strValue = qel.val() || '[]';
        let arrValue = [];
        if (strValue !== '' && strValue !== 'null') {
            try {
                arrValue = JSON.parse(strValue);
            }
            catch (e) {
                arrValue = [];
            }
        }
        for (let i = 0; i < arrValue.length; i++) {
            addImg(arrValue[i]);
        }
        button.on('click', function () {
            field.trigger('click');
            if (typeof (qel.setDefault) == 'function') {
                qel.setDefault();
            }
            return false;
        });
        //监听上传完成
        qel.on('uploadComplete', function (ev, ret) {
            if (!ret.status) {
                if (ret.msg !== '') {
                    yee_1.Yee.alert(ret.msg);
                }
                return;
            }
            if (ret.data) {
                if (yee_1.Yee.isArray(ret.data)) {
                    for (let i = 0; i < ret.data.length; i++) {
                        if (ret.data[i].url) {
                            addImg(ret.data[i].url);
                        }
                    }
                }
                else if (ret.data.url) {
                    addImg(ret.data.url);
                }
            }
            if (ret.msg) {
                yee_1.Yee.msg(ret.msg);
            }
        });
    }
    //上传文件组
    upFileGroup() {
        let setting = this.setting;
        let field = this.field;
        let qel = this.qel;
        let size = setting.size || 0;
        qel.hide();
        let shower = $('<div class="yee-file-wrap"></div>').insertAfter(qel);
        let button = $('<a href="javascript:;" class="yee-btn file-btn">选择文件</a>').appendTo(shower);
        //跟新值
        let update = function () {
            let imgItems = [];
            shower.find('div.file-item').each(function (index, element) {
                let _this = $(element);
                let dat = _this.data('value'); //值
                imgItems.push(dat);
            });
            if (imgItems.length === 0) {
                qel.val('');
            }
            else {
                let strValue = JSON.stringify(imgItems);
                qel.val(strValue);
            }
            if (size > 0) {
                if (imgItems.length >= size) {
                    button.hide();
                }
                else {
                    button.show();
                }
            }
        };
        //添加图片
        let addFile = function (url, name = '') {
            let item = $('<div class="file-item"></div>').data('value', { url: url, name: name });
            item.text(name);
            let ext = YeeUpload.getExtension(url);
            item.addClass(ext);
            let delBtn = $('<a href="javascript:;"></a>').addClass('file-del').appendTo(item);
            delBtn.on('click', function () {
                $(this).parent('.file-item').remove();
                update();
            });
            item.insertBefore(button);
            update();
        };
        let strValue = qel.val() || '[]';
        let arrValue = [];
        if (strValue !== '' && strValue !== 'null') {
            try {
                arrValue = JSON.parse(strValue);
            }
            catch (e) {
                arrValue = [];
            }
        }
        for (let item of arrValue) {
            addFile(item.url, item.name);
        }
        //按钮点击
        button.on('click', function () {
            field.trigger('click');
            if (typeof (qel.setDefault) == 'function') {
                qel.setDefault();
            }
            return false;
        });
        //监听上传完成
        qel.on('uploadComplete', function (ev, ret) {
            if (!ret.status) {
                if (ret.msg !== '') {
                    yee_1.Yee.alert(ret.msg);
                }
                return;
            }
            if (ret.data) {
                if (yee_1.Yee.isArray(ret.data)) {
                    for (let item of ret.data) {
                        if (item.url) {
                            addFile(item.url, item.orgName);
                        }
                    }
                }
                else if (ret.data.url) {
                    addFile(ret.data.url, ret.data.orgName);
                }
            }
            if (ret.msg) {
                yee_1.Yee.msg(ret.msg);
            }
        });
    }
    upload() {
        let setting = this.setting;
        let that = this;
        let allowExtensions = setting.extensions || '';
        let files = this.field[0].files;
        let type = setting.type || 'file';
        let bindData = {};
        if (setting.token) {
            bindData.token = setting.token;
        }
        //携带参数
        if (setting.param && yee_1.Yee.isObject(setting.param)) {
            for (let key in setting.param) {
                let val = setting.param['key'];
                bindData[key] = String(val);
            }
        }
        if (type == 'image') {
            bindData.catSizes = setting.catSizes || null;
            bindData.catType = setting.catType || null;
            bindData.strictSize = setting.strictSize || null;
        }
        let multiple = setting.multiple || false;
        let fieldName = setting.fieldName || 'filedata';
        let url = setting.url || '';
        //检查文件类型
        if (allowExtensions != '') {
            for (let i = 0; i < files.length; i++) {
                let info = YeeUpload.getFileInfo(files[i]);
                let re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
                if ((re.exec(allowExtensions) === null || info.extension === '')) {
                    yee_1.Yee.alert('对不起，只能上传 ' + allowExtensions + ' 类型的文件。');
                    this.form.trigger('reset');
                    return;
                }
            }
        }
        if (this.qel.emit('uploadBefore', bindData, files) === false) {
            // @ts-ignore
            this.trigger('reset');
            return;
        }
        let xhr = new XMLHttpRequest();
        //监听进度
        xhr.upload.addEventListener("progress", function (evt) {
            let percent = Math.round(evt.loaded / evt.total * 100);
            that.qel.emit('uploadProgress', [{ total: evt.total, loaded: evt.loaded, percent: percent }]);
        }, false);
        //监听完成
        xhr.addEventListener("load", function (evt) {
            // @ts-ignore
            let jsonText = evt.target.responseText;
            try {
                let data = JSON.parse(jsonText);
                that.qel.emit('uploadComplete', data);
            }
            catch (e) {
                yee_1.Yee.alert('上传失败，服务器出现了些状况');
            }
        }, false);
        let fd = new FormData();
        for (let key in bindData) {
            if (bindData[key] !== null) {
                fd.append(key, bindData[key]);
            }
        }
        if (multiple) {
            for (let i = 0; i < that.field[0].files.length; i++) {
                fd.append(fieldName + '[]', that.field[0].files[i]);
            }
        }
        else {
            fd.append(fieldName, that.field[0].files[0]);
        }
        xhr.open("POST", url);
        xhr.send(fd);
    }
}
exports.YeeUpload = YeeUpload;
//# sourceMappingURL=yee-upload.js.map