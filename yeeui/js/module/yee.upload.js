(function ($, Yee) {

    function getFileInfo(file) {
        var path = file.name.toString();
        var extension = path.lastIndexOf('.') === -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
        return {path: path, extension: extension};
    }

    function createImage(url, width, height) {
        var def = $.Deferred();
        var imgtemp = new Image();
        imgtemp.onload = function () {
            var w = imgtemp.width;
            var h = imgtemp.height;
            if (w > width) {
                var pt = width / w;//高比宽
                w = width;
                h = h * pt;
            }
            if (h > height) {
                var pt = height / h;//宽比高
                h = height;
                w = w * pt;
            }
            var img = $('<img/>');
            img.height(Math.round(h));
            img.width(Math.round(w));
            img.attr('src', url);
            var table = $('<table  border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0px; vertical-align:middle; text-align:center; overflow: hidden; line-height:0px;"></td></tr></table>');
            table.width(width);
            table.height(height);
            table.find('td').append(img);
            def.resolve(table);
        };
        imgtemp.src = url;
        return def;
    }

    function Upload(elem, setting) {
        var qem = $(elem);
        var self = this;
        var multiple = setting('multiple', false);
        var allowExtensions = setting('extensions', '');
        var fieldName = setting('fieldName', 'filedata');
        var url = setting('url', '');
        var type = setting('type', 'file');
        if (type == 'image') {
            multiple = false;
        }
        var bindData = {};
        if (type == 'image') {
            bindData.catSizes = setting('catSizes', null);
            bindData.catType = setting('catType', null);
            bindData.strictSize = setting('strictSize', null);
        }
        var form = $('<form></form>').hide().appendTo(document.body);
        var field = $('<input type="file"/>').attr('name', fieldName).appendTo(form);
        if (multiple) {
            field.attr('multiple', 'multiple');
        }
        this.upload = function () {
            var files = field[0].files;
            //检查文件类型
            if (allowExtensions != '') {
                for (var i = 0; i < files.length; i++) {
                    var info = getFileInfo(files[i]);
                    var re = new RegExp("(^|\\s|,)" + info.extension + "($|\\s|,)", "ig");
                    if ((re.exec(allowExtensions) === null || info.extension === '')) {
                        Yee.alert('对不起，只能上传 ' + allowExtensions + ' 类型的文件。');
                        form.trigger('reset');
                        return;
                    }
                }
            }
            if (qem.emit('uploadBefore', bindData, files) === false) {
                form.trigger('reset');
                return;
            }
            var xhr = new XMLHttpRequest();
            //监听进度
            xhr.upload.addEventListener("progress", function (evt) {
                var percent = Math.round(evt.loaded / evt.total * 100);
                qem.emit('uploadProgress', [{total: evt.total, loaded: evt.loaded, percent: percent}]);
            }, false);
            //监听完成
            xhr.addEventListener("load", function (evt) {
                var jsonText = evt.target.responseText;
                try {
                    var data = JSON.parse(jsonText);
                    qem.emit('uploadComplete', data);
                } catch (e) {
                    Yee.alert('上传失败，服务器出现了些状况');
                }
            }, false);
            var fd = new FormData();
            for (var key in bindData) {
                if (bindData[key] !== null) {
                    fd.append(key, bindData[key]);
                }
            }
            if (multiple) {
                for (var i = 0; i < field[0].files.length; i++) {
                    fd.append(fieldName + '[]', field[0].files[i]);
                }
            } else {
                fd.append(fieldName, field[0].files[0]);
            }
            xhr.open("POST", url);
            xhr.send(fd);
        }
        field.on('change', function () {
            self.upload();
            setTimeout(function () {
                form.trigger('reset');
            }, 100);
            return false;
        });
        //文件上传
        if (type == 'file') {
            if (qem.is('input')) {
                var button = $('<a  href="javascript:;" class="yee-upluoad-btn">选择文件</a>');
                button.insertAfter(qem);
                button.on('click', function () {
                    field.trigger('click');
                    if (typeof(qem.setDefault) == 'function') {
                        qem.setDefault();
                    }
                    return false;
                });
                qem.on('uploadComplete', function (ev, ret) {
                    if (!ret.status) {
                        if (ret.error !== '') {
                            Yee.alert(ret.error);
                        }
                        return;
                    }
                    if (ret.data) {
                        if ($.isArray(ret.data)) {
                            var urls = [];
                            for (var i = 0; i < ret.data.length; i++) {
                                if (ret.data[i].url) {
                                    urls.push(ret.data[i].url);
                                }
                            }
                            qem.val(JSON.stringify(urls));
                        } else if (ret.data.url) {
                            qem.val(ret.data.url);
                        }
                    }
                    if (ret.message) {
                        Yee.msg(ret.message);
                    }
                });
            }
            else if (qem.is('a')) {
                qem.on('click', function () {
                    field.trigger('click');
                    return false;
                });
            }
        }
        //单图片上传
        else if (type == 'image') {
            var btnWidth = setting('btnWidth', 100);
            var btnHeight = setting('btnHeight', 100);
            qem.hide();
            var btnLayout = $('<div class="yee-upload-image-layout"></div>');
            btnLayout.insertBefore(qem);
            var button = $('<a class="yee-upload-image-btn" href="javascript:;"></a>').appendTo(btnLayout);
            button.width(btnWidth).height(btnHeight);
            var delBtn = $('<a href="javascript:;"></a>').addClass('yee-upload-image-delpic').hide().appendTo(btnLayout);
            delBtn.click(function () {
                qem.val('');
                button.empty();
                button.removeClass('yee-upload-eimg');
            });
            if (qem.val()) {
                createImage(qem.val(), btnWidth, btnHeight).then(function (img) {
                    button.empty().append(img);
                    button.addClass('yee-upload-eimg');
                    delBtn.show();
                });
            }
            qem.on('uploadComplete', function (ev, ret) {
                if (!ret.status) {
                    if (ret.error !== '') {
                        Yee.alert(ret.error);
                    }
                    return;
                }
                if (ret.data && ret.data.url) {
                    qem.val(ret.data.url);
                    createImage(ret.data.url, btnWidth, btnHeight).then(function (img) {
                        button.empty().append(img);
                        button.addClass('yee-upload-eimg');
                        delBtn.show();
                    });
                }
                if (ret.message) {
                    Yee.msg(ret.message);
                }
            });

            button.on('click', function () {
                field.trigger('click');
                if (typeof(qem.setDefault) == 'function') {
                    qem.setDefault();
                }
                return false;
            });
        }
        //多图上传
        else if (type == 'imggroup') {
            var btnWidth = setting('btnWidth', 100);
            var btnHeight = setting('btnHeight', 100);
            var size = setting('size', 0);
            qem.hide();
            var shower = $('<div class="yee-upload-image-layout"></div>').insertBefore(qem);
            var button = $('<a href="javascript:;" class="yee-upload-image-btn"></a>').appendTo(shower);
            button.width(btnWidth).height(btnHeight);
            //跟新值
            var update = function () {
                var imgs = [];
                shower.find('div.yee-upload-item').each(function (index, element) {
                    var _this = $(element);
                    var dat = _this.data('value');
                    imgs.push(dat);
                });

                if (imgs.length === 0) {
                    qem.val('');
                }
                else {
                    var valstr = JSON.stringify(imgs);
                    qem.val(valstr);
                }
                if (size > 0) {
                    if (imgs.length >= size) {
                        button.hide();
                    } else {
                        button.show();
                    }
                }
            };
            var addImg = function (url) {
                var oitem = $('<div class="yee-upload-item"></div>').data('value', url);
                var delBtn = $('<a href="javascript:;"></a>').addClass('yee-upload-image-delpic').appendTo(oitem);
                delBtn.click(function () {
                    $(this).parent('.yee-upload-item').remove();
                    update();
                });
                createImage(url, btnWidth, btnHeight).then(function (img) {
                    oitem.append(img);
                });
                oitem.insertBefore(button);
                update();
            }
            var valText = qem.val() || '[]';
            var vals = [];
            if (valText !== '' && valText !== 'null') {
                try {
                    vals = JSON.parse(valText);
                } catch (e) {
                    vals = [];
                }
            }
            for (var i = 0; i < vals.length; i++) {
                addImg(vals[i]);
            }
            button.on('click', function () {
                field.trigger('click');
                if (typeof(qem.setDefault) == 'function') {
                    qem.setDefault();
                }
                return false;
            });
            //监听上传完成
            qem.on('uploadComplete', function (ev, ret) {
                if (!ret.status) {
                    if (ret.error !== '') {
                        Yee.alert(ret.error);
                    }
                    return;
                }
                if (ret.data) {
                    if ($.isArray(ret.data)) {
                        for (var i = 0; i < ret.data.length; i++) {
                            if (ret.data[i].url) {
                                addImg(ret.data[i].url);
                            }
                        }
                    } else if (ret.data.url) {
                        addImg(ret.data.url);
                    }
                }
                if (ret.message) {
                    Yee.msg(ret.message);
                }
            });
        }
    }

    Yee.extend('input,a', 'upload', Upload);
})(jQuery, Yee);