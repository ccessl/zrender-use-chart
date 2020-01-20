# zrender demo 自定义简单图件

ZRender 是二维绘图引擎，它提供 Canvas、SVG、VML 等多种渲染方式。ZRender 也是 ECharts 的渲染器。

demo使用zrender开发的简单图件，同时将它封装成一个jQuery的插件，方便调用。按照不同的段绘制渐变色的柱状图，同时点击的时候能够动画显示数值

#效果


[查看](https://ccessl.github.io/zrender-use-chart/)



##zrender 使用
[zrender文档](https://ecomfe.github.io/zrender-doc/public/api.html)

```
var zr = zrender.init(document.getElementById('main'));
```

添加矩形

```
 var rect = new zrender.Rect({
       shape: {
           x: 0,
           y: 0,
           width: 100,
           height:100
       },
       style: {
           stroke:'#ffc8aa'
       },
       position: [10,10]
 
   });
   zr.add(rect );
```

矩形使用线性渐变色填充

```
var linearColor = new zrender.LinearGradient(0, 0, 0, 1, [
       {
           offset: 0,
           color: '#efe3ff'
       },
       {
           offset: 1,
           color: '#6cb3e9'
       }
   ]);
   var rect = new zrender.Rect({
       shape: {
           x: 0,
           y: 0,
           width: 100,
           height:100
       },
       style: {
          fill:linearColor
       },
       position: [10,10]
 
   });
   zr.add(rect );
```

矩形添加动画，矩形的左上角从位置（10,10）移动到（10,100）

```
var rect = new zrender.Rect({
       shape: {
           x: 0,
           y: 0,
           width: 100,
           height:100
       },
       style: {
           stroke:'#ffc8aa'
       },
       position: [10,10]
 
   });
   rect.animateTo({
       position: [10,100]
   }, 500, 0, 'linear');
   zr.add(rect );
```

绘制一条虚线，加上动画,在0.5秒的时间里绘制从0%到100%

```
var line = new zrender.Line({
       shape: {
           x1:10,
           y1:10,
           x2:100,
           y2:10,
           percent:0
       },
       style: {
           stroke:'#434348',
           lineDash:[5,5]
       }
   });
   line.animate('shape', false)
       .when(500, {
           percent: 1
       }).start();
   zr.add(line);
```

矩形添加添加鼠标事件

```
 var rect = new zrender.Rect({
       shape: {
           x: 0,
           y: 0,
           width: 100,
           height:100
       },
       style: {
           stroke:'#ffc8aa'
       },
       position: [10,10]
 
   });
   rect.on('click',function(){
       console.log('单击了这个矩形');
   });
   zr.add(rect );
```
