Yee.config({
    version: (function () {
        return '1.0.1';
        //return new Date().getTime();
    }()),
    modules: {
        //定义模块路径
        'json': window.JSON ? '' : '../third/json2.js',
        'cookie': '../third/jquery.cookie.js',
    },
    depends: {

    }
});
