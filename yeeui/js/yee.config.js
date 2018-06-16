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
        'number': 'module/yee.number.js',
        'integer': 'module/yee.number.js',
    },
    depends: {
        'yee-picker': 'css!../css/picker.css',
    },
    dataFormat: null
})
;
