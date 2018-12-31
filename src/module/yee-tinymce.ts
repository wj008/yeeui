import {Yee} from "../yee";

export class YeeTinymce {

    public static baseUrl = null;

    public constructor(elem, setting) {
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
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table contextmenu paste code help wordcount'
            ],
            menubar: (function () {
                if (setting.typeMode == 'basic') {
                    return false;
                }
                return true;
            })(),
            toolbar: 'insert | undo redo |  formatselect | bold italic forecolor backcolor | table link image codesample | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
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
            relative_urls : false,
        };
        setting = $.extend(basic, setting);
        Yee.seq(['tinymce', 'tinymce-jquery', 'tinymce-lang']).then(function () {
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
                '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                YeeTinymce.baseUrl + 'css/codepen.min.css'
            ];
            //@ts-ignore
            $(elem).tinymce(setting);
        });
    }
}
