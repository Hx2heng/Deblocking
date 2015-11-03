(function($) {
    window.Deblocking = function(obj) {
        this.ele = obj.ele;
        this.height = obj.height;
        this.width = obj.width;
        this.baseN = 3;// 3*3
        this.handler = {};

        this.pass = 0;
        this.dots = 3;
    };

    Deblocking.prototype.nextPass=function(pass){ //下一关参数设置
        this.pass += 0.2;
        this.dots++;
        this.baseN = Math.floor(this.pass+3);
        this.rePass();
    }
    Deblocking.prototype.rePass = function(){
        this.firstFlash = true;
        this.lastPoint = [];
        this.createCircle();
        this.path = this.getPath();
        if (this.firstFlash) {
            this.flash(this.r, this.arr);
            this.firstFlash = false;
        }
        
    }
   
    Deblocking.prototype.getPath=function(){
        var _this = this;
        var path = new Array(this.dots);
        path[0] = rd(1,this.arr.length);
        this.arr[path[0]-1].selected = true;

        for(var i=1;i<this.dots;i++){
            path[i] = this.getNextPoint(_this.arr[path[i-1]-1]);
            this.arr[path[i-1]-1].selected = true;
        }
        
        return path;
    }
    Deblocking.prototype.getNextPoint=function(obj){
        var NextPointList = this.getNextPointList(obj,1);
        var NextPoint;
        for(var i=1;i<this.baseN;i++){
            if(NextPointList == false){
                NextPointList = this.getNextPointList(obj,i+1);
            }
        }
        NextPoint = NextPointList[rd(0,NextPointList.length-1)];
        //console.log(obj.index,NextPointList,NextPoint);
        return NextPoint;

    }
    Deblocking.prototype.getNextPointList=function(obj,p){//获取下一点集合
        var position = obj.position;
        var aroundPosition = []; //周围位置集合
        var nextArr = [];
        for(var i=-p;i<=p;i++){//获取周围位置集合算法
            for(var j=-p;j<=p;j++)
            {
                //if((i==0)&&(j==0)) continue;
                if((Math.abs(j)!=p)&&(Math.abs(i)!=p)) continue;
                if(
                    ((position[0]+i)>=0)
                    &&
                    ((position[0]+i)<(this.baseN))
                    &&
                    ((position[1]+j)>=0)
                    &&
                    ((position[1]+j)<(this.baseN))
                   )
                {
                    aroundPosition.push([position[0]+i,position[1]+j]);
                }
               
            }
        }

        for(var i=0;i<aroundPosition.length;i++){
            for(var j=0;j<this.arr.length;j++){
                if(aroundPosition[i].toString() == this.arr[j].position.toString())
                {
                    if(this.arr[j].selected){
                        continue;
                    }
                    nextArr.push(this.arr[j].index);
                }
            }
        }
        return nextArr;
    }
    Deblocking.prototype.on = function(type, fn) {//自定义事件(success事件...)
            if (typeof this.handler[type] == 'undefined') {
                this.handler[type] = [];
            }
            this.handler[type].push(fn);
        }
    Deblocking.prototype.fire = function(type, data) {//自定义事件(success事件...)
            if (this.handler[type] instanceof Array) {
                var handler = this.handler[type];
                for (var i = 0; i < handler.length; i++) {
                    handler[i](data);
                }
                this.handler[type] = undefined;
            }
        }
    
    Deblocking.prototype.drawCle = function(x, y) { // 初始化解锁密码面板
        this.ctx.strokeStyle = '#CFE6FF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    Deblocking.prototype.drawPoint = function() { // 初始化圆心
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = '#CFE6FF';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    Deblocking.prototype.drawStatusPoint = function(type) { // 初始化状态线条
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    Deblocking.prototype.drawLine = function(po, lastPoint) { // 解锁轨迹
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        if (this.lastPoint[0]) {
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        }
        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    }
    Deblocking.prototype.createCircle = function() { 
        var n = this.baseN;
        var count = 0;
        
        
        this.r = this.ctx.canvas.width / (3 * n); // 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        this.position = [];
        var r = this.r;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                count++;
                var obj = {
                    x: j * 3 * r + 1.5 * r,
                    y: i * 3 * r + 1.5 * r,
                    index: count,
                    position:[j,i],
                    selected: false
                };
                this.position.push(obj.position);
                this.arr.push(obj);
                this.restPoint.push(obj);

            }
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); 
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

    }
    Deblocking.prototype.getPosition = function(e) { 
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
        return po;
    }
    Deblocking.prototype.update = function(po) { 
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

        this.drawPoint(this.lastPoint); 
        this.drawLine(po, this.lastPoint); 

        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    }
    Deblocking.prototype.checkPass = function(psw1, psw2) { // 检测
        var p1 = '',
            p2 = '';
        for (var i = 0; i < psw1.length; i++) {
            p1 += psw1[i] + psw1[i];
        }
        for (var i = 0; i < psw2.length; i++) {
            p2 += psw2[i].index + psw2[i].index;
        }
        //console.log(this.lastPoint);
        return p1 === p2;
    }
    Deblocking.prototype.storePass = function(psw) { 
        var _this = this;
            if (this.checkPass(this.path, psw)) {
                document.getElementById('title').innerHTML = '解锁成功';
                this.drawStatusPoint('#2CFF26');
                $(_this.ele).addClass('fadeOutIn animated');
                _this.nextPass(_this.pass);
                setTimeout(function(){
                    _this.reset();
                },500);
                setTimeout(function(){$(_this.ele).removeClass('fadeOutIn animated')},1000);
                this.fire('success');

            } else { 
                document.getElementById('title').innerHTML = '解锁失败,重新设置';
                this.drawStatusPoint('red');
                $(_this.ele).addClass('shake animated');
                _this.rePass();
                setTimeout(function(){
                    _this.reset();
                    $(_this.ele).removeClass('shake animated');
                },500);
               
            }
    }
    Deblocking.prototype.makeState = function() {
            document.getElementById('pass').innerHTML = '第'+(this.dots-2)+'关';
        
    }
    
    Deblocking.prototype.initDom = function() {
        this.wrap = document.createElement('div');
        var str = '<h1 id="pass" class="title" style="position:absolute;width:100%;text-align: center;font-size:2.5em;top:-1.2em;">第1关</h1>' +
            '<p id="title" class="title" style="position:absolute;width:100%;text-align: center">请解锁</p>' +
            '<canvas id="canvas" width="' + this.width + '" height="' + this.height + '" style="display: inline-block;margin-top: 25px;"></canvas>';
        this.wrap.setAttribute('style', 'position: absolute;top:0;left:0;right:0;bottom:0;');
        this.wrap.innerHTML = str;
        this.ele.appendChild(this.wrap);
    }
    Deblocking.prototype.init = function() {
        // var _this = this;
        this.initDom();
        this.firstFlash = true;
        this.lastPoint = [];
        this.touchFlag = false;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.createCircle();
        this.path = this.getPath();
        this.bindEvent();
        if (this.firstFlash) {
            this.flash(this.r, this.arr);
            this.firstFlash = false;
        }
       
    }
    Deblocking.prototype.reset = function() {
        this.makeState();
        this.createCircle();
        
    }
    Deblocking.prototype.bindEvent = function() {
        var _this = this;
        this.canvas.addEventListener("touchstart", function(e) {
            e.preventDefault();
            var po = _this.getPosition(e);
            for (var i = 0; i < _this.arr.length; i++) {
                if (Math.abs(po.x - _this.arr[i].x) < _this.r && Math.abs(po.y - _this.arr[i].y) < _this.r) {
                    _this.touchFlag = true;
                    _this.drawPoint(_this.arr[i].x, _this.arr[i].y);
                    _this.lastPoint.push(_this.arr[i]);
                    _this.restPoint.splice(i, 1);
                    break;
                }
            }
        }, false);
        this.canvas.addEventListener("touchmove", function(e) {
            if (_this.touchFlag) {
                _this.update(_this.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function(e) {
            if (_this.touchFlag) {
                _this.touchFlag = false;
                _this.storePass(_this.lastPoint);
                setTimeout(function() {

                    _this.reset();
                }, 300);
            }


        }, false);
        document.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, false);
       
    }
    Deblocking.prototype.flash = function(r, arr) {
        var _this = this;
        var index = -2;
        $('.flash-ele').remove();
        this.flashEleDiv = $('<div class="flash-ele"></div>');
        this.flashEleUl = $('<ul class="flash-ul"></ul>');
        this.flashEleDiv.append(this.flashEleUl);
        this.flashNode = [];
        $(this.ele).append(this.flashEleDiv);
        for (var i = 0; i < arr.length; i++) {
            this.flashEleUl.append('<li class="flash-li"></li>');
        }
        this.flashEleDiv.css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0
        });
        this.flashEleUl.css({
            'position': 'relative',
            'width': $(_this.canvas).offset().width,
            'height': $(_this.canvas).offset().height,
            'display': 'inline-block',
            'margin-top': '25px'
        });
        this.flashEleUl.find('li.flash-li').each(function(i) {
            this.index = i;
            $(this).css({
                'position': 'absolute',
                'width': r * 2 + 'px',
                'height': r * 2 + 'px',
                'background': 'rgb(0, 211, 216)',
                'border-radius': '500px',
                'top': arr[i].y - r,
                'left': arr[i].x - r,
                'opacity': 0,
                'display': 'none'
            }).addClass('pulse animated');
        });
        for (var i = 0; i < this.path.length; i++) {
            this.flashNode.push(this.path[i]);
        }
        $('.flash-ul').on('touchmove',function(){
            $(this).find('li.flash-li').each(function(i) {
                $(this).css({'background': 'red'});
            })
        });
        $('.flash-ul').on('touchend',function(){
            $(this).find('li.flash-li').each(function(i) {
                $(this).css({'background': 'rgb(0, 211, 216)'});
            })
        });
        clearInterval(this.timer);
        this.timer = setInterval(function() {
            index++;
            if (index>=0 && index <=_this.flashNode.length) {
            document.getElementById('title').innerHTML = '设置中...';
            _this.flashEleUl.children().eq(_this.flashNode[index] - 1).fadeIn(500, function() {
                $(this).fadeOut(500);
            });
        };
            
            if(index>_this.flashNode.length){
                clearInterval(_this.timer);
                $('.flash-ele').fadeOut(200,function(){$(this).remove()});
                document.getElementById('title').innerHTML = '请解锁';
            }

        }, 520);
    }


    //范围随机函数

            function rd(n, m) {
                var c = m - n + 1;
                return Math.floor(Math.random() * c + n);
            }
})(Zepto);