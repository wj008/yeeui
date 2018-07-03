Yee.config({
    version: (function () {
        return '1.0.1';
        //return new Date().getTime();
    }()),
    modules: {
        //定义模块路径
        'json': window.JSON ? '' : '../third/json3.min.js',
        'jquery-cookie': '../third/jquery.cookie.js',
        'jquery-mousewheel': '../third/jquery.mousewheel.min.js',
        'yee-number': 'module/yee.number.js',
        'yee-integer': 'module/yee.number.js',
    },
    depends: {
        'yee-picker': 'css!../css/picker.css',
        'yee-popup': function () {
            if (window.top === window) {
                var isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
                return isMobile ? '../layer/mobile/layer.js' : '../layer/layer.js';
            }
            return null;
        },
        'yee-confirm': 'yee-popup',
        'yee-ajax': 'yee-popup',
        'yee-validate': 'yee-popup'
    },
    dataFormat: null
});