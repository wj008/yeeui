class YeeTinymce {
    constructor(elem) {
        this.qel = null;
        let qel = this.qel = $(elem);
        let setting = qel.data();
        if (!elem.style.width) {
            elem.style.width = '100%';
        }
        if (!elem.style.height) {
            elem.style.height = '400px';
        }
        let basic = {
            language: 'zh_CN',
            plugins: [
                'advlist autolink lists link image charmap print preview anchor textcolor',
                'searchreplace visualblocks code fullscreen codesample hr pagebreak',
                'insertdatetime media table contextmenu paste code help wordcount'
            ],
            menubar: (function () {
                if (setting.typeMode == 'basic' || setting.typeMode == 'mini') {
                    return false;
                }
                return true;
            })(),
            toolbar: (function () {
                if (setting.typeMode == 'mini') {
                    return 'formatselect | bold italic forecolor backcolor | table link image codesample removeformat | help fullscreen';
                }
                return 'insert | undo redo |  formatselect | bold italic forecolor backcolor | table link image codesample | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help fullscreen';
            })(),
            image_advtab: true,
            images_upload_url: '/service/tiny_upload',
            images_upload_credentials: false,
            image_class_list: [
                {title: 'None', value: ''},
                {title: 'Some class', value: 'class-name'}
            ],
            importcss_append: true,
            templates: [
                {title: 'Some title 1', description: 'Some desc 1', content: 'My content'},
                {
                    title: 'Some title 2',
                    description: 'Some desc 2',
                    content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>'
                }
            ],
            init_instance_callback: function (editor) {
                editor.on('GetContent', function (e) {
                    let html = e.content;
                    let reg1 = new RegExp('<\\/?(\\!doctype|html|head|title|body)(\\s[^>]*)?>', 'gi');
                    html = $.trim(html.replace(reg1, ''));
                    let reg2 = new RegExp('<\\/?(p|span|div|br)(\\s[^>]*)?>', 'gi');
                    let text = $.trim(html.replace(reg2, ''));
                    if (text == '') {
                        e.content = '';
                    } else {
                        e.content = $.trim(html);
                    }
                });
            },
            template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',
            template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',
            elementpath: false,
            statusbar: false,
            relative_urls: false,
        };
        setting = $.extend(basic, setting);
        let that = this;
        Yee.use(['tinymce', 'tinymce-jquery', 'tinymce-lang']).then(function () {
            if (YeeTinymce.baseUrl == null) {
                YeeTinymce.baseUrl = (function () {
                    let scripts = document.getElementsByTagName('script');
                    for (let script of scripts) {
                        let src = script.hasAttribute ? script.src : script.getAttribute('src');
                        let m = src.match(/^(.*)tinymce(-\d+(\.\d+)*)?(\.min)?\.js/i);
                        if (m) {
                            return m[1];
                        }
                    }
                    return '';
                })();
            }
            setting.content_css = [
                //   '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                YeeTinymce.baseUrl + 'css/codepen.min.css'
            ];
            //@ts-ignore
            qel.tinymce(setting);
            that.initForm();
        });
    }

    initForm() {
        let qel = this.qel;
        let form = qel.parents('form:first');
        if (form.length) {
            let currentListener = form[0].onsubmit;
            if (currentListener) {
                form.on('submit', function (e) {
                    return currentListener.call(this, e.originalEvent);
                });
                form[0].onsubmit = null;
            }
            let submitFunc = function (ev) {
                let code = qel.val();
                //  console.log(code)
            };
            form.on('submit', submitFunc);
            // @ts-ignore
            let typeEvents = ($._data(form[0], "events") || form.data("events")).submit;
            typeEvents.unshift(typeEvents.pop());
        }
    }
}

YeeTinymce.baseUrl = null;

export {YeeTinymce}