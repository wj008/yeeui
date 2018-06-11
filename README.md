# YeeUI核心框架

#### 1.YeeUI 是什么

- YeeUI 是一款基于 jQuery 开发的用于WEB前端开发的JavaScript 框架。
- YeeUI 提供一种高效便捷的输入框控件初始化的一种方式，提供自动加载模块，自动渲染控件，并且自带提供了一些在WEB开发中常用的输入方式的插件实现。
    
#### 2.YeeUI 的使用者

- YeeUI 的使用者可能不是前台美工，更多使用它的应该是WEB系统后台排版编写js的苦主们，在后台开发中，我们可能会有很多输入插件需要编写，比如 输入验证脚本，上传控件脚本，图片上传，多图上传，引入编辑器，关联菜单，数值大小判断，Ajax表单提交，Ajax交互操作，动态增删控件，以及 打开对话框，选择对话框 等相应的脚本实现，在这里可以得到很简便的方式实现。  YeeUI 的出现 主要是为了更便捷的解决在后台或者WEB项目中一般常用的交互问题，节约宝贵的js脚本编写时间。    
  
- YeeUI 是基于 jQuery 实现的，并且整个框架中都是以事件和触发事件的方式交互数据，且数据会以 $('#id').data() 方式绑定到节点之上，YeeUI 会对html节点进行文档操作，所以 类似 vue.js 这种数据渲染的框架会与 YeeUI 冲突。当然如果你已知道这个事实，并且可以合理规避冲突本作者并不会反对联合它们使用。

#### 3.YeeUI 的渲染流程  
  
- 1 当页面打开时还未完成加载，YeeUI 会先隐藏  `<html>` 标记，并且等到页面加载完成。  
_ 2 页面加载完成后  YeeUI 会扫描 所有 具有  yee-module 属性的html节点，并且 为渲染这些节点加载依赖的 js 脚本文件。  
- 3 所有依赖文件加载完成 后开始渲染 具有  yee-module 属性的节点，节点上的设置 以  $('#id').data() 的方式提供。
- 4 渲染完成后 显示 `<html>` 标记 并执行 jQuery 的 $(function(){}); ready 方法。   此处使用 jQuery 的 ready 方法会被延后到 所有节点渲染完成。    
    
  ` 注：为啥要先隐藏 html 标记？ 主要是考虑到可能还没有渲染完成的时候，界面内容出现不和谐的显示，或在未渲染之前误点击操作 如果有更好的办法可以提建议给我`
      
*用一个例子来描述一下 *    
例如实现一个在 输入框后面更随文本的插件

一般的jQuery 插件 的写法
```html
<html>  
<script src="jquery.js"></script>
<body>
<div>
    <input id="test" type="text"/>
</div>
    <script>  
     //定义插件
    $.fn.afterText = function (setting) {
        $('<span></span>').html(setting.text).insertAfter(this[0]);
    }
    //调用插件
    $('#test').afterText({text: 'hello'});
    </script>  
</body>
<html>
```
Yee插件 的写法    

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test</title>
    <script src="jquery.js"></script>
    <script src="yee.js"></script>
</head>
<body>
<div>
    <div><input id="test" type="text"/></div>
    <!--可以使用标签调用 不需要指定id  渲染参数由 data 设置 -->
    <div><input yee-module="after_text" data-text="这里是标签调用" type="text"/></div>
    <!--这里的渲染会等到整个页面加载后 在渲染-->
</div>
<script>
    //定义插件
    Yee.extend(':input', 'after_text', function (elem, setting) {
        $('<span></span>').html(setting.text).insertAfter(elem);
    });
    //也可以使用 jQuery 调用，jQuery 时须加 yee_ 前缀
    $('#test').yee_after_text({text: '这里是jq调用的'});
</script>
</body>
</html>
```

- 从上面的例子 可以看到  标签在前，插件在后，而插件的写法 和 jquery 的极为相似，只是 渲染的时候可以使用标签进行渲染，方便代码排版布局，完全去脚本化。
  
#### 4.YeeUI 自动引入  
  
_ 从上面的代码，我们可以吧 插件部分的代码 放入 js 文件，如 module 的文件夹，命名为  yee.after_text.js  或者更高级的 配置 yee.config.js 指定模块路径。
  配置好以后的代码 就成了这样  
    
```html  
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="jquery-3.3.1.min.js"></script>
    <script src="../yeeui/js/yee.js"></script>
</head>
<body>
<div>
    <!--可以使用标签调用 不需要指定id  渲染参数由 data 设置 -->
    <div><input yee-module="after_text" data-text="这里是标签调用" type="text"/></div>
</div>
</body>
</html>
```
