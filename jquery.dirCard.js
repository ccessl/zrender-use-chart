/**
 * Created by ChenCen on 2017/12/10
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('viewer', ['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery,zrender);
    }
})(function ($,zrender) {

    'use strict';

    var $window = $(window);
    var $document = $(document);

    // Constants
    var NAMESPACE = 'dircard';
    var ELEMENT_VIEWER = document.createElement(NAMESPACE);

    function isUndefined(u) {
        return typeof u === 'undefined';
    }
    function isNumber(n) {
        return typeof n === 'number' && !isNaN(n);
    }
    function isString(s) {
        return typeof s === 'string';
    }
    function toArray(obj, offset) {
        var args = [];
        if (isNumber(offset)) { // It's necessary for IE8
            args.push(offset);
        }
        return args.slice.apply(obj, args);
    }

    //globle no change
    var unChoosenStroke='#ccc';

    var $myTip=$('#dialogTip');

    var $myTip12=$myTip.find('#tip12');

    var $myTip22=$myTip.find('#tip22');
    //选中值1
    var $myTip31=$myTip.find('#tip3');
    var $myTip32=$myTip.find('#tip32');
    //选中值2
    var $addTip=$myTip.find('#addTip');
    var $myTip41=$myTip.find('#tip4');
    var $myTip42=$myTip.find('#tip42');


    //background use for hover change for instance
    var activeCol=[];
    var preCheck='';

    function DirCard(element, options) {
        this.element=element;
        this.$element = $(element);
        var options=this.options =$.extend({}, DirCard.DEFAULTS, options);
        if(options.relaCol.length==0)
        {
            options.relaCol.push(this.options.showCol);
        }
        if(options.relaName.length==0)
        {
            options.relaName=this.options.relaCol.concat();
        }

        this.zr = zrender.init(this.element);
        this.w= this.zr.getWidth();
        this.h = this.zr.getHeight();

        this.disLeft=0.15*this.w;
        this.disTop=0.1*this.h;
        this.disBottom=0.1*this.h;
        this.disRight=0.07*this.w;

        this.zrBGGroup=new zrender.Group();
        this.zrBGGroup.position=[0,0];
        this.zr.add(this.zrBGGroup);

        this.zrColGroup=new zrender.Group();
        this.zrColGroup.position=[0,0];
        this.zr.add(this.zrColGroup);

        this.bgEleGroup=new zrender.Group();
        this.bgEleGroup.position=[this.disLeft,this.disTop];
        this.zr.add(this.bgEleGroup);

        this.zrAxisGroup=new zrender.Group();
        this.zrAxisGroup.position=[0,0];
        this.zr.add(this.zrAxisGroup);

        this.firEleGroup=new zrender.Group();
        this.firEleGroup.position=[this.disLeft,this.disTop];
        this.zr.add(this.firEleGroup);

        this.secEleGroup=new zrender.Group();
        this.secEleGroup.position=[this.disLeft,this.disTop];
        this.zr.add(this.secEleGroup);

        this.init();
    }

    DirCard.DEFAULTS={
        //数据
        data:[],
        //字段
        wellSec:'段',
        //展示的列
        showCol:'',
        //柱颜色
        barColor:['#48c15e','#dff0d8'],
        //选中颜色
        checkColor:'#ff5454',
        //背景色
        backgroundColor:'#fff',
        //用于显示的相关列
        relaCol:[],
        //用于显示的相关列名称
        relaName:[],
        //用于显示列的单位
        relaUnit:[''],
        //字段
        wellCW:'层位',
        //绘制完成后的回调函数
        rowAfter:false
    };

    DirCard.prototype = {
        constructor: DirCard,
        //初始化
        init: function () {
            var options = this.options;
            var beginSec, endSec, length;
            var sec = options.wellSec;
            var data = options.data;
            var showCol = options.showCol;

            this.length = length = data.length;
            if (!length || length == 0 || (!data[0][sec]))
                return;
            if (!data[0][showCol]) {
                console.log('provide the wrong clunmn name!');
                return
            }
            if ((data[0][sec]).split('-').length == 2) {
                this.split = "-";
                beginSec = (data[0][sec]).split('-')[0];
                endSec = (data[length - 1][sec]).split('-')[1];

            }
            else if ((data[0][sec]).split('~').length == 2) {
                this.split = "~";
                beginSec = (data[0][sec]).split('~')[0];
                endSec = (data[length - 1][sec]).split('~')[1];
            }
            if (beginSec && Number(beginSec) < Number(endSec)) {
                this.beginSec = Number(beginSec);
                this.endSec = Number(endSec);

                this.drawBG();
                this.drawCol();
                this.drawBgEle();
                this.drawAxis();

                var i=options.relaCol.indexOf(showCol);
                activeCol.push(i);
                this.drawFirEle(showCol);

                //tip
                this.bindMouseMoveAndTip();

                // callBack after draw
                if (options.rowAfter) {
                    options.rowAfter();
                }
            }
            else {
                console.log('there must be something wrong！');
            }
        },

        //draw background
        drawBG: function () {
            var zrBGGroup = this.zrBGGroup;
            var w = this.w;
            var h = this.h;
            var options=this.options;
            var backgroundColor=options.backgroundColor;

            var disLeft=this.disLeft;
            var disRight=this.disRight;
            var disTop=this.disTop;
            var disBottom=this.disBottom;

            var i;
            var xMin=Math.ceil((this.endSec-this.beginSec)/4);
            var wRadio=(w-disLeft-disRight)/(4*xMin);
            this.xLenValue=4*xMin;

            zrBGGroup.add(new zrender.Rect({
                shape: {
                    width: w,
                    height: h
                },
                style: {fill: backgroundColor}
            }));
            var roundRect = new zrender.Rect({
                shape: {
                    width: 0.98*w,
                    height:0.99*h
                },
                style: {
                    stroke:"#C0D0E0",
                    fill:'#fff'
                },
                position: [0.01*w,0.005*h]
            });
            zrBGGroup.add(roundRect);


            //title
            zrBGGroup.add(new zrender.Text({
                style: {
                    text:this.options.title,
                    fontSize: '18',
                    fontWeight: 'bold',
                    textAlign:'left'
                },
                position: [0.04*h, 0.01*h]
            }));
            //x axis
            var xline =new zrender.Line({
                shape: {
                    x1:0,
                    y1:0,
                    x2:wRadio*(4*xMin),
                    y2:0
                },
                style: {stroke:'#000'},
                position: [disLeft,h-disBottom]
            });
            var jdText = new zrender.Text({
                style: {
                    stroke: '#000',
                    text:'井段',
                    fontSize: '12',
                    textAlign:'center'
                },
                position: [0.5*w,h-disBottom+0.07*h]
            });
            zrBGGroup.add(xline);
            zrBGGroup.add(jdText);
            for(i=0;i<5;i++)
            {
                var smline =new zrender.Line({
                    shape: {
                        x1:0,
                        y1:0,
                        x2:0,
                        y2:0.02*h
                    },
                    style: {
                        stroke:'#000'
                    },
                    position: [disLeft+wRadio*(i*xMin), h-disBottom]
                });
                var smText = new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text:this.beginSec+(i*xMin),
                        fontSize: '11',
                        textAlign:'center'
                    },
                    position: [disLeft+wRadio*(i*xMin), h-disBottom+0.03*h]
                });
                zrBGGroup.add(smline);
                zrBGGroup.add(smText);
            }
            zrBGGroup.add(new zrender.Line({
                shape: {
                    y2:h-disTop-disBottom
                },
                style: {stroke:'#000'},
                position: [disLeft, disTop]
            }));
            zrBGGroup.add(new zrender.Line({
                shape: {
                    y2:h-disTop-disBottom
                },
                style: {stroke:'#000'},
                position: [w-disRight, disTop]
            }));
        },

        //draw relaCol
        drawCol:function(){
            var zrColGroup = this.zrColGroup;
            var options=this.options;
            var self=this;
            var w = this.w;

            var relaCol=options.relaCol;
            var relaName=options.relaName;
            var i;

            var colTop=this.disTop;
            var colLeft=0.02*w;

            for(i=0;i<relaCol.length;i++)
            {
                var colRect= new zrender.Rect({
                    shape: {
                        r:[5],
                        width:25,
                        height:15
                    },
                    style: {
                        fill:unChoosenStroke
                    },
                    position: [colLeft,colTop+50*i],
                    name:'colRect'+i
                });
                var colText = new zrender.Text({
                    style: {
                        textFill: unChoosenStroke,
                        text:relaName[i],
                        fontSize: '11',
                        textAlign:'left'
                    },
                    position: [colLeft, colTop+50*i+20],
                    name:'colText'+i
                });
                zrColGroup.add(colRect);
                zrColGroup.add(colText);

                colRect.on('click',function(){
                    var j=(this.name).substring(this.name.length-1);
                    var colText=zrColGroup.childOfName('colText'+j);
                    var HandleRect,HandleText;
                    //顺序
                    if(activeCol.length==0)
                    {
                        activeCol.push(j);
                        self.drawFirEle(relaCol[j]);

                    }
                    else if(activeCol.length==1)
                    {
                        if(activeCol[0]==j)
                        {
                            HandleRect=zrColGroup.childOfName('colRect'+activeCol[0]);
                            HandleText=zrColGroup.childOfName('colText'+activeCol[0]);
                            HandleRect.attr({
                                style: {
                                    fill:unChoosenStroke
                                }});
                            HandleText.attr({
                                style: {
                                    textFill:unChoosenStroke
                                }
                            });
                            self.firEleGroup.removeAll();
                            activeCol.splice(0,1);
                        }
                        else {
                            activeCol.push(j);
                            self.drawSecEle(relaCol[j]);
                        }
                    }
                    else if(activeCol.length==2)
                    {
                        if(activeCol[0]==j)
                        {
                            HandleRect=zrColGroup.childOfName('colRect'+activeCol[0]);
                            HandleText=zrColGroup.childOfName('colText'+activeCol[0]);
                            HandleRect.attr({
                                style: {
                                    fill:unChoosenStroke
                                }});
                            HandleText.attr({
                                style: {
                                    textFill:unChoosenStroke
                                }
                            });
                            self.firEleGroup.removeAll();
                            self.secEleGroup.removeAll();
                            activeCol.splice(0,1);
                            self.drawFirEle(relaCol[activeCol[0]]);
                        }
                        else if(activeCol[1]==j)
                        {
                            HandleRect=zrColGroup.childOfName('colRect'+activeCol[1]);
                            HandleText=zrColGroup.childOfName('colText'+activeCol[1]);
                            HandleRect.attr({
                                style: {
                                    fill:unChoosenStroke
                                }});
                            HandleText.attr({
                                style: {
                                    textFill:unChoosenStroke
                                }
                            });
                            self.secEleGroup.removeAll();
                            activeCol.splice(1,1);
                        }
                        else
                        {
                            HandleRect=zrColGroup.childOfName('colRect'+activeCol[0]);
                            HandleText=zrColGroup.childOfName('colText'+activeCol[0]);
                            HandleRect.attr({
                                style: {
                                    fill:unChoosenStroke
                                }});
                            HandleText.attr({
                                style: {
                                    textFill:unChoosenStroke
                                }
                            });
                            activeCol.splice(0,1);
                            activeCol.push(j);
                            self.drawFirEle(relaCol[activeCol[0]]);
                            self.drawSecEle(relaCol[activeCol[1]]);

                        }
                    }
                    // console.log(activeCol);

                },colRect)
            }
        },
        //draw x axis
        drawAxis:function(){
            var zrAxisGroup = this.zrAxisGroup;
            var h=this.h;
            var w=this.w;

            var disLeft=this.disLeft;
            var disRight=this.disRight;
            var disTop=this.disTop;
            var disBottom=this.disBottom;
            var i;

            //4 axis
            var yMin=(h-disTop-disBottom)/4;
            for(i=0;i<4;i++)
            {
                var yline=new zrender.Line({
                    shape: {
                        x2:w-disLeft-disRight
                    },
                    style: {
                        stroke:'#ccc'
                    },
                    position: [disLeft, disTop+yMin*i]
                });
                zrAxisGroup.add(yline);
            }
        },

        //draw all ele
        drawBgEle:function(){
            var bgEleGroup=this.bgEleGroup;
            var options=this.options;
            var wellSec=options.wellSec;
            var i;
            var chartW=this.w-this.disLeft-this.disRight;
            var chartH=this.h-this.disTop-this.disBottom;
            var wRadio=chartW/this.xLenValue;

            for(i=0;i<options.data.length;i++)
            {
                var bg = (options.data[i][wellSec]).split(this.split)[0];
                bg = Number(bg);
                var ed = (options.data[i][wellSec]).split(this.split)[1];
                ed = Number(ed);

                bgEleGroup.add(new zrender.Rect({
                    shape: {
                        width: wRadio * (ed - bg),
                        height: chartH
                    },
                    style: {
                        fill: '#fff'
                    },
                    position: [wRadio * (bg - this.beginSec), 0]
                }));
            }
        },

        drawFirEle: function (showCol) {
            var firEleGroup=this.firEleGroup;
            firEleGroup.removeAll();

            var zrColGroup = this.zrColGroup;
            var options=this.options;
            var wellSec=options.wellSec;
            var i,minData,maxData;
            var data=options.data;
            var chartW=this.w-this.disLeft-this.disRight;
            var chartH=this.h-this.disTop-this.disBottom;
            var wRadio=chartW/this.xLenValue;

            var index=options.relaCol.indexOf(showCol);
            var barColor=options.barColor;
            //change col
            var colRect=zrColGroup.childOfName('colRect'+index);
            var colText=zrColGroup.childOfName('colText'+index);

            colRect.attr({
                style: {
                    fill:barColor[index][0]
                }});
            colText.attr({
                style: {
                    textFill:'#434348'
                }
            });

            firEleGroup.add(new zrender.Text({
                style: {
                    stroke: '#434348',
                    text: showCol + options.relaUnit[index],
                    fontSize: '11',
                    textAlign: 'center'
                },
                position: [-0.1 * this.h, chartH / 2],
                rotation: Math.PI / 2
            }));

            minData = Number(data[0][showCol])||0;
            maxData = Number(data[0][showCol])||0;
            for (i = 1; i < data.length; i++) {
                if (minData > (Number(data[i][showCol])||0))
                    minData = Number(data[i][showCol])||0;
                if (maxData < (Number(data[i][showCol])||0))
                    maxData = Number(data[i][showCol])||0;
            }
            this.maxData0 = maxData;
            this.minData0 = minData;
            //console.log("min:"+minData+" max:"+maxData);

            if(minData==0&&maxData==0)
            {
                this.yLenValue0 =0;
                //handle all zero
                firEleGroup.add(new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text: 0,
                        fontSize: '12',
                        textAlign: 'right'
                    },
                    position: [-0.03 * this.h, - 5]
                }));
                firEleGroup.add(new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text: 0,
                        fontSize: '12',
                        textAlign: 'right'
                    },
                    position: [-0.03 * this.h, chartH - 5]
                }));


            }
            else
            {
                var yMin0 = Math.ceil(100 * (this.maxData0 - this.minData0) / 4);
                yMin0 = (yMin0 / 100).toFixed(2);
                var yRadio0 = (chartH) / (4 * yMin0);
                this.yLenValue0 = 4 * yMin0;

                //yaxis0
                for (i = 0; i < 5; i++) {
                    firEleGroup.add(new zrender.Line({
                        shape: {x2: 0.02 * this.h},
                        style: {stroke: '#000'},
                        position: [-0.02 * this.h, yRadio0 * yMin0 * i]
                    }));
                    firEleGroup.add(new zrender.Text({
                        style: {
                            stroke: '#434348',
                            text: (this.minData0 + (4 - i) * yMin0).toFixed(2),
                            fontSize: '12',
                            textAlign: 'right'
                        },
                        position: [-0.03 * this.h, yRadio0 * yMin0 * i - 5]
                    }));
                }

                //firEle
                for (i = 0; i < data.length; i++) {
                    var barValue = Number(data[i][showCol]);
                    var bg = (data[i][wellSec]).split(this.split)[0];
                    bg = Number(bg);
                    var ed = (data[i][wellSec]).split(this.split)[1];
                    ed = Number(ed);

                    var zrEle = new zrender.Rect({
                        shape: {
                            width: wRadio * (ed - bg),
                            height: 0
                        },
                        style: {
                            fill: barColor[index][0]
                        },
                        position: [wRadio * (bg - this.beginSec), chartH]
                    });
                    zrEle.animateTo({
                        shape: {
                            height: yRadio0 * (barValue - this.minData0)
                        },
                        position: [wRadio * (bg - this.beginSec), chartH - yRadio0 * (barValue - this.minData0)]
                    }, 500, i * 10, 'linear');
                    firEleGroup.add(zrEle);
                }
            }

        },

        drawSecEle: function (showCol) {
            var secEleGroup=this.secEleGroup;
            secEleGroup.removeAll();

            var zrColGroup = this.zrColGroup;
            var options=this.options;
            var wellSec=options.wellSec;
            var i,minData,maxData;
            var data=options.data;
            var chartW=this.w-this.disLeft-this.disRight;
            var chartH=this.h-this.disTop-this.disBottom;
            var wRadio=chartW/this.xLenValue;

            var index=options.relaCol.indexOf(showCol);
            var barColor=options.barColor;
            //change col
            var colRect=zrColGroup.childOfName('colRect'+index);
            var colText=zrColGroup.childOfName('colText'+index);

            colRect.attr({
                style: {
                    fill:barColor[index][0]
                }});
            colText.attr({
                style: {
                    textFill:'#434348'
                }
            });

            secEleGroup.add(new zrender.Text({
                style: {
                    stroke: '#434348',
                    text: showCol + options.relaUnit[index],
                    fontSize: '12',
                    textAlign: 'center'
                },
                position: [0.08 * this.h + chartW, chartH / 2],
                rotation: Math.PI / 2
            }));

            minData = Number(data[0][showCol])||0;
            maxData = Number(data[0][showCol])||0;
            for (i = 1; i < data.length; i++) {
                if (minData > (Number(data[i][showCol])||0))
                    minData = Number(data[i][showCol])||0;
                if (maxData < (Number(data[i][showCol])||0))
                    maxData = Number(data[i][showCol])||0;
            }

            this.maxData1 = maxData;
            this.minData1 = minData;
            //console.log("min:"+minData+" max:"+maxData);
            if(minData==0&&maxData==0)
            {
                this.yLenValue1=0;
                //handle all zero
                secEleGroup.add(new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text: 0,
                        fontSize: '12',
                        textAlign: 'left'
                    },
                    position: [0.03 * this.h + chartW, - 5]
                }));
                secEleGroup.add(new zrender.Text({
                    style: {
                        stroke: '#434348',
                        text: 0,
                        fontSize: '12',
                        textAlign: 'left'
                    },
                    position: [0.03 * this.h + chartW, chartH - 5]
                }));
            }
            else
            {
                var yMin1 = Math.ceil(100 * (this.maxData1 - this.minData1) / 4);
                yMin1 = (yMin1 / 100).toFixed(2);
                var yRadio1 = (chartH) / (4 * yMin1);
                this.yLenValue1 = 4 * yMin1;

                //yaxis1
                for (i = 0; i < 5; i++) {
                    secEleGroup.add(new zrender.Line({
                        shape: {x2: 0.02 * this.h},
                        style: {stroke: '#000'},
                        position: [chartW, yRadio1 * yMin1 * i]
                    }));
                    secEleGroup.add(new zrender.Text({
                        style: {
                            stroke: '#434348',
                            text: (this.minData1 + (4 - i) * yMin1).toFixed(2),
                            fontSize: '11',
                            textAlign: 'left'
                        },
                        position: [0.03 * this.h + chartW, yRadio1 * yMin1 * i - 5]
                    }));
                }

                //secEle
                for (i = 0; i < data.length; i++) {
                    var barValue = Number(data[i][showCol]);
                    var bg = (data[i][wellSec]).split(this.split)[0];
                    bg = Number(bg);
                    var ed = (data[i][wellSec]).split(this.split)[1];
                    ed = Number(ed);

                    var zrEle = new zrender.Rect({
                        shape: {
                            width: wRadio * (ed - bg),
                            height: 0
                        },
                        style: {
                            fill: barColor[index][0],
                            opacity: '0.7'
                        },
                        position: [wRadio * (bg - this.beginSec), chartH]
                    });
                    zrEle.animateTo({
                        shape: {
                            height: yRadio1 * (barValue - this.minData1)
                        },
                        position: [wRadio * (bg - this.beginSec), chartH - yRadio1 * (barValue - this.minData1)]
                    }, 500, i * 10, 'linear');
                    secEleGroup.add(zrEle);
                }
            }

        },

        bindMouseMoveAndTip:function(){
            var zr=this.zr;
            var self=this;
            var w = this.w;
            var h = this.h;

            var disLeft=this.disLeft;
            var disTop=this.disTop;
            var disRight=this.disRight;
            var disBottom=this.disBottom;

            var chartH=this.h-this.disTop-this.disBottom;

            zr.on('mousemove',function(event) {
                var x=event.offsetX;
                var y=event.offsetY;
                var value0=0,value1=0;
                var yText0,yText1,yRect0,yRect1,yLine;
                var options=self.options;
                var data=options.data;
                var relaCol=options.relaCol;
                var relaName=options.relaName;
                var wellSec=options.wellSec;
                var wellCW=options.wellCW;


                if(self.yLine)
                    zr.remove(self.yLine);
                if(self.yText0)
                {
                    zr.remove(self.yText0);
                    zr.remove(self.yRect0);
                }
                if(self.yText1)
                {
                    zr.remove(self.yText1);
                    zr.remove(self.yRect1);
                }
                //在范围内
                if(x>disLeft&&x<w-disRight&&y>disTop&&y<h-disBottom)
                {
                    yLine = new zrender.Line({
                        shape: {
                            x1:disLeft,
                            y1:y,
                            x2:w-disRight,
                            y2:y
                        },
                        style: {
                            stroke:'#434348',
                            lineDash:[5,5]
                        }
                    });
                    zr.add(yLine);
                    self.yLine=yLine;

                    if(activeCol.length==1)
                    {
                        value0=self.minData0+(self.yLenValue0/chartH)*(h-y-disBottom);
                        value0=value0.toFixed(2);
                        yRect0 = new zrender.Rect({
                            shape: {
                                width:40,
                                height:18
                            },
                            style: {fill:'#434348'},
                            position: [disLeft-45, y-9]
                        });
                        yText0 = new zrender.Text({
                            style: {
                                textFill: '#fff',
                                text:value0,
                                fontSize: '11',
                                textAlign:'right'
                            },
                            position: [disLeft-0.03*h, y-5]
                        });
                        zr.add(yRect0);
                        zr.add(yText0);
                        self.yRect0=yRect0;
                        self.yText0=yText0;
                    }
                    else if(activeCol.length==2)
                    {
                        value0=self.minData0+(self.yLenValue0/chartH)*(h-y-disBottom);
                        value0=value0.toFixed(2);
                        yRect0 = new zrender.Rect({
                            shape: {
                                width:40,
                                height:18
                            },
                            style: {fill:'#434348'},
                            position: [disLeft-45, y-9]
                        });
                        yText0 = new zrender.Text({
                            style: {
                                textFill: '#fff',
                                text:value0,
                                fontSize: '11',
                                textAlign:'right'
                            },
                            position: [disLeft-0.03*h, y-5]
                        });
                        zr.add(yRect0);
                        zr.add(yText0);
                        self.yRect0=yRect0;
                        self.yText0=yText0;

                        value1=self.minData1+(self.yLenValue1/chartH)*(h-y-disBottom);
                        value1=value1.toFixed(2);
                        yRect1 = new zrender.Rect({
                            shape: {
                                width:40,
                                height:18
                            },
                            style: {fill:'#434348'},
                            position: [w-disRight+5, y-9]
                        });
                        yText1 = new zrender.Text({
                            style: {
                                textFill: '#fff',
                                text:value1,
                                fontSize: '11',
                                textAlign:'left'
                            },
                            position: [w-disRight+0.02*h, y-5]
                        });
                        zr.add(yRect1);
                        zr.add(yText1);
                        self.yRect1=yRect1;
                        self.yText1=yText1;
                    }
                    self.bgEleGroup.eachChild(function(item,index){
                        if(item.contain(x,y))
                        {
                            if(preCheck)
                            {
                                preCheck.attr({
                                    style: {
                                        fill:'#fff',
                                        stroke:'#fff',
                                        lineWidth:0
                                    }});
                            }
                            item.attr({
                                style: {
                                    fill:unChoosenStroke,
                                    stroke:self.options.checkColor,
                                    lineWidth:1
                                }});
                            preCheck=item;

                            //myTip
                            $myTip.css({
                                'top':y+10,
                                'left':x+10
                            });
                            $myTip12.text(data[index][wellSec]);
                            $myTip22.text(data[index][wellCW]);

                            var ii,jj;
                            if(activeCol.length==1)
                            {
                                ii=activeCol[0];
                                $myTip31.text(relaName[ii]+':');
                                $myTip32.text((data[index][relaCol[ii]])||0);
                                $myTip.show();
                            }
                            if(activeCol.length==2)
                            {
                                ii=activeCol[0];
                                jj=activeCol[1];
                                $myTip31.text(relaName[ii]+':');
                                $myTip32.text((data[index][relaCol[ii]])||0);
                                $myTip41.text(relaName[jj]+':');
                                $myTip42.text((data[index][relaCol[jj]])||0);
                                $addTip.show();
                                $myTip.show();
                            }
                        }
                    });
                }//在范围内结束
                else
                {
                    $addTip.hide();
                    $myTip.hide();
                }
            });

        },
        //销毁实例
        dispose:function(){
            activeCol.length=0;
            preCheck='';

            this.zrBGGroup.removeAll();
            this.zrColGroup.removeAll();
            this.bgEleGroup.removeAll();
            this.zrAxisGroup.removeAll();
            this.firEleGroup.removeAll();
            this.secEleGroup.removeAll();

            var zr = this.zr;
            zrender.dispose(zr);
            //移除反向绑定
            this.$element.removeData(NAMESPACE);
        }
    };


    // Register as jQuery plugin
    $.fn.dirCard = function (options) {
        var args = toArray(arguments, 1);
        var result;

        this.each(function () {
            var $this = $(this);
            var data = $this.data(NAMESPACE);
            var fn;

            if (!data) {
                $this.data(NAMESPACE, (data = new DirCard(this, options)));
            }
            if (isString(options) && $.isFunction(fn = data[options])) {
                result = fn.apply(data, args);
            }
        });
        return isUndefined(result) ? this : result;
    };

});
