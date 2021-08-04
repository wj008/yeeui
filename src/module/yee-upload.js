class YeeUpload {
    constructor(elem) {
        let qel = this.qel = $(elem);
        let that = this;
        let multiple = qel.data('multiple') || false;
        let fieldName = qel.data('fieldName') || 'filedata';
        let mode = qel.data('mode') || 'file';
        if (mode == 'image') {
            multiple = false;
        }
        let form = this.form = $('<form></form>').hide().appendTo(document.body);
        let field = this.field = $('<input type="file"/>').attr('name', fieldName).appendTo(form);
        if (multiple) {
            field.attr('multiple', 'multiple');
        }
        let accept = qel.data('accept');
        if (accept !== void 0 && accept != '') {
            field.attr('accept', accept);
        }
        field.on('change', function () {
            that.upload().then(function () {
                setTimeout(function () {
                    form.trigger('reset');
                }, 100);
            });
            return false;
        });
        //文件上传
        if (mode == 'file') {
            that.upFile();
        }
        //单图片上传
        else if (mode == 'image') {
            that.upImage();
        }
        //多图上传
        else if (mode == 'imgGroup') {
            that.upImgGroup();
        }
        //多文件上传
        else if (mode == 'fileGroup') {
            that.upFileGroup();
        }
    }

    static getFileInfo(file) {
        let path = file.name.toString();
        let extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
        return {path: path, extension: extension};
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

    //上传文档
    upFile() {
        let field = this.field;
        let qel = this.qel;
        let nameInputSelector = qel.data('name-input');
        if (qel.is('input')) {
            let button = null;
            let btnSelector = qel.data('button');
            if (btnSelector) {
                button = $(btnSelector);
            } else {
                button = $('<a  href="javascript:;" class="yee-btn">选择文件</a>');
                button.insertAfter(qel);
            }
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
                        Yee.alert(ret.msg);
                    }
                    return;
                }
                if (ret.data) {
                    if (Yee.isArray(ret.data)) {
                        let urls = [];
                        for (let i = 0; i < ret.data.length; i++) {
                            if (ret.data[i].url) {
                                urls.push(ret.data[i].url);
                            }
                        }
                        qel.val(JSON.stringify(urls));
                    } else if (ret.data.url) {
                        if (nameInputSelector) {
                            let nameInput = null;
                            if (/^[a-zA-Z\[\]0-9_]+$/.test(nameInputSelector)) {
                                nameInput = $(":input[name='" + nameInputSelector + "']");
                            } else {
                                nameInput = $(nameInputSelector);
                            }
                            nameInput.val(ret.data.orgName);
                        }
                        qel.val(ret.data.url);
                    }
                }
                if (ret.msg) {
                    Yee.msg(ret.msg);
                }
            });
        } else if (qel.is('a')) {
            qel.on('click', function () {
                field.trigger('click');
                return false;
            });
        }
    }

    //上传图片
    upImage() {
        let field = this.field;
        let qel = this.qel;
        let btnWidth = qel.data('img-width') || 100;
        let btnHeight = qel.data('img-height') || 100;
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
            delBtn.hide();
        });
        let initValue = function () {
            let value = qel.val() || '';
            if (value != '') {
                let data = {
                    url: qel.val(),
                    btnWidth: btnWidth,
                    btnHeight: btnHeight
                };
                qel.emit('createImage', data);
                YeeUpload.createImage(data.url, data.btnWidth, data.btnHeight).then(function (img) {
                    button.empty().append(img);
                    button.addClass('img-bgnone');
                    delBtn.show();
                });
            } else {
                button.empty();
            }
        };
        initValue();
        qel.on('update', initValue);
        qel.on('uploadComplete', function (ev, ret) {
            if (!ret.status) {
                if (ret.msg !== '') {
                    Yee.alert(ret.msg);
                }
                return;
            }
            if (ret.data && ret.data.url) {
                qel.val(ret.data.url);
                initValue();
            }
            if (ret.msg) {
                Yee.msg(ret.msg);
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
        let field = this.field;
        let qel = this.qel;
        let btnWidth = qel.data('img-width') || 100;
        let btnHeight = qel.data('img-height') || 100;
        let size = qel.data('size') || 0;
        let disabled = qel.prop('disabled');
        qel.hide();
        let shower = $('<div class="yee-img-wrap"></div>').insertAfter(qel);
        let button = null;
        if (!disabled) {
            button = $('<a href="javascript:;" class="img-btn"></a>').appendTo(shower);
            button.width(btnWidth).height(btnHeight);
        }
        //跟新值
        let update = function () {
            if (disabled) {
                return;
            }
            let imgItems = [];
            shower.find('div.img-item').each(function (index, element) {
                let _this = $(element);
                let dat = _this.data('value');
                imgItems.push(dat);
            });
            if (imgItems.length === 0) {
                qel.val('');
            } else {
                let strValue = JSON.stringify(imgItems);
                qel.val(strValue);
            }
            if (size > 0) {
                if (imgItems.length >= size) {
                    button.hide();
                } else {
                    button.show();
                }
            }
        };
        let addImg = function (url) {
            if (size > 0 && shower.find('div.img-item').length >= size) {
                return;
            }
            let item = $('<div class="img-item"></div>').data('value', url);
            let delBtn = null;
            if (!disabled) {
                delBtn = $('<a href="javascript:;"></a>').addClass('img-del').appendTo(item);
                delBtn.hide();
                delBtn.on('click', function () {
                    $(this).parent('.img-item').remove();
                    update();
                });
            } else {
                item.addClass('disabled');
            }
            let data = {
                url: url,
                btnWidth: btnWidth,
                btnHeight: btnHeight
            };
            qel.emit('createImage', data);
            YeeUpload.createImage(data.url, data.btnWidth, data.btnHeight).then(function (img) {
                item.append(img);
                if (delBtn) {
                    delBtn.show();
                }
            });
            if (button) {
                item.insertBefore(button);
            } else {
                item.appendTo(shower);
            }
            update();
        };
        let initValue = function () {
            shower.find('div.img-item').remove();
            let strValue = qel.val() || '[]';
            let arrValue = [];
            if (strValue !== '' && strValue !== 'null') {
                try {
                    arrValue = JSON.parse(strValue);
                } catch (e) {
                    arrValue = [];
                }
            }
            for (let i = 0; i < arrValue.length; i++) {
                addImg(arrValue[i]);
            }
        };
        initValue();
        qel.on('update', initValue);
        if (!disabled) {
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
                        Yee.alert(ret.msg);
                    }
                    return;
                }
                if (ret.data) {
                    if (ret.data.files && ret.data.files.length > 1) {
                        for (let item of ret.data.files) {
                            if (item.url) {
                                addImg(item.url);
                            }
                        }
                    } else if (ret.data.url) {
                        addImg(ret.data.url);
                    }
                }
                if (ret.msg) {
                    Yee.msg(ret.msg);
                }
            });
        }
    }

    //上传文件组
    upFileGroup() {
        let field = this.field;
        let qel = this.qel;
        let size = qel.data('size') || 0;
        let disabled = qel.prop('disabled');
        qel.hide();
        let shower = $('<div class="yee-file-wrap"></div>').insertAfter(qel);
        let button = null;
        if (!disabled) {
            button = $('<a href="javascript:;" class="yee-btn file-btn">选择文件</a>').appendTo(shower);
        }
        //跟新值
        let update = function () {
            if (disabled) {
                return;
            }
            let imgItems = [];
            shower.find('div.file-item').each(function (index, element) {
                let _this = $(element);
                let dat = _this.data('value'); //值
                //console.log(dat);
                if (dat == null || typeof dat != 'object') {
                    return;
                }
                imgItems.push(dat);
            });
            if (imgItems.length === 0) {
                qel.val('');
            } else {
                let strValue = JSON.stringify(imgItems);
                qel.val(strValue);
            }
            if (size > 0) {
                if (imgItems.length >= size) {
                    if (button) {
                        button.hide();
                    }
                } else {
                    if (button) {
                        button.show();
                    }
                }
            }
        };
        //添加图片
        let addFile = function (url, name = '') {
            if (size > 0 && shower.find('div.file-item').length >= size) {
                return;
            }
            let item = $('<div class="file-item"></div>').data('value', {url: url, name: name});
            item.text(name);
            let ext = YeeUpload.getExtension(url);
            item.addClass(ext);
            if (!disabled) {
                let delBtn = $('<a href="javascript:;"></a>').addClass('file-del').appendTo(item);
                delBtn.on('click', function () {
                    $(this).parent('.file-item').remove();
                    update();
                });
                item.insertBefore(button);
            } else {
                item.addClass('disabled');
                item.appendTo(shower);
            }
            update();
        };
        let initValue = function () {
            shower.find('div.file-item').remove();
            let strValue = qel.val() || '[]';
            let arrValue = [];
            if (strValue !== '' && strValue !== 'null') {
                try {
                    arrValue = JSON.parse(strValue);
                } catch (e) {
                    arrValue = [];
                }
            }
            let temp = [];
            for (let item of arrValue) {
                if (typeof item == null || typeof item != 'object') {
                    continue;
                }
                temp.push(item);
                addFile(item.url, item.name);
            }
            if (temp.length == 0) {
                qel.val('[]');
            }
        };
        initValue();
        qel.on('update', initValue);
        if (!disabled) {
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
                        Yee.alert(ret.msg);
                    }
                    return;
                }
                if (ret.data) {
                    if (ret.data.files && ret.data.files.length > 1) {
                        for (let item of ret.data.files) {
                            if (item.url) {
                                addFile(item.url, item.orgName);
                            }
                        }
                    } else if (ret.data.url) {
                        addFile(ret.data.url, ret.data.orgName);
                    }
                }
                if (ret.msg) {
                    Yee.msg(ret.msg);
                }
            });
        }
    }

    // @ts-ignore
    upload() {

        let that = this;
        let qel = this.qel;
        let form = this.form;
        let allowExtensions = qel.data('extensions') || '';
        let files = this.field[0].files;
        let mode = qel.data('mode') || 'file';
        let bindData = {};
        let dataToken = qel.data('token');
        if (dataToken) {
            bindData.token = dataToken;
        }
        //携带参数
        let dataParam = qel.data('param');
        if (dataParam && Yee.isObject(dataParam)) {
            for (let key in dataParam) {
                let val = dataParam[key];
                bindData[key] = String(val);
            }
        }
        if (mode == 'image') {
            bindData.catSizes = qel.data('cat-sizes') || null;
            bindData.catType = qel.data('cat-type') || null;
            bindData.strictSize = qel.data('strict-size') || null;
        }
        let multiple = qel.data('multiple') || false;
        let fieldName = qel.data('field-name') || 'filedata';
        let url = qel.data('url') || '';
        //检查文件类型
        if (allowExtensions != '') {
            for (let i = 0; i < files.length; i++) {
                let info = YeeUpload.getFileInfo(files[i]);
                let re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
                if ((re.exec(allowExtensions) === null || info.extension === '')) {
                    Yee.alert('对不起，只能上传 ' + allowExtensions + ' 类型的文件。');
                    form.trigger('reset');
                    return;
                }
            }
        }
        let ret = qel.emit('uploadBefore', bindData, files);
        if (ret === false) {
            form.trigger('reset');
            return;
        }
        let sendFunc = function (bData) {
            let xhr = new XMLHttpRequest();
            let param = {};
            let fd = new FormData();
            for (let key in bData) {
                if (bData[key] !== null) {
                    param[key] = bData[key];
                    fd.append(key, bData[key]);
                }
            }
            if (multiple) {
                for (let i = 0; i < that.field[0].files.length; i++) {
                    fd.append(fieldName + '[]', that.field[0].files[i]);
                }
            } else {
                fd.append(fieldName, that.field[0].files[0]);
            }
            //监听进度
            xhr.upload.addEventListener("progress", function (evt) {
                let percent = Math.round(evt.loaded / evt.total * 100);
                that.qel.emit('uploadProgress', [{total: evt.total, loaded: evt.loaded, percent: percent}]);
            }, false);
            //监听完成
            xhr.addEventListener("load", function (evt) {
                if (that.qel.emit('uploadLoad', evt.target, param) === false) {
                    return false;
                }
                // @ts-ignore
                let jsonText = evt.target.responseText;
                if (jsonText != null && jsonText != '') {
                    try {
                        let data = JSON.parse(jsonText);
                        that.qel.emit('uploadComplete', data);
                    } catch (e) {
                        console.error(e);
                        Yee.alert('上传失败，服务器出现了些状况');
                    }
                }
            }, false);
            xhr.open("POST", url);
            xhr.send(fd);
        };
        if (ret !== null && ret instanceof Promise) {
            ret.then(function (bData) {
                sendFunc(bData);
            })
        } else {
            sendFunc(bindData);
        }
    }
}

export {YeeUpload}