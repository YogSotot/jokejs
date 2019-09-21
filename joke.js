/*jslint es5: true */
//loop iterator
main_timer = null;
var g = 0, q = 0;
var verbose = false;
var utils = new Utils();

var collisionType = ['BOTTOM_EDGE', 'TOP_EDGE', 'LEFT_EDGE', 'RIGHT_EDGE', 'ANOTHER_OBJECT', 'NO_COLLISION'];
var directionKeys = ['KEY_LEFT', 'KEY_UP', 'KEY_RIGHT', 'KEY_DOWN', 'KEY_JUMP'];
var objectTypes   = ['PILLAR', 'PLATFORM', 'STONE', 'USER'];

var Root = function (el) {
    this.wrapper = el;
    Root.prototype = {
        get wrapper() {
            return this._wrapper;
        }, set wrapper(value) {
            this._wrapper = value;
        }
    };
};
var Util = function () {
};
Util.prototype = {
    deg2rad: function (deg) {
        return -1 * deg * Math.PI / 180;
    }
};


/**
 * @class sceneObject
 *
 */
var sceneObject = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.isIngame = true;

    /**
     * movement along x and y axis
     */
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    /**
     * User defined data.
     */
    this.data = [];
    /**
     * Determines is object platform
     * If true, then collision with lower quarter of this platform
     * causes setting to zero dy's
     */
    this.type = 'PLATFORM';
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.name = "";
    this.adhereWith = [];
    this.collideWith = [];
    this.colliders = [];
    this.Index = null;
    var behSpriteable = new spriteBehavior();
    behSpriteable.setOwner(this);

};
sceneObject.prototype = {
    get canvas() {
        return this._canvas;
    }, set canvas(value) {
        this._canvas = value;
    }, get ctx() {
        return this._canvas.getContext('2d');
    }, set ctx(value) {
    }, get x() {
        return this._x;
    }, set x(value) {
        this._x = value;
    }, get y() {
        return this._y;
    }, set y(value) {
        this._y = value;
    }, get color() {
        return this._color;
    }, set color(value) {
        this._color = value;
    }, get width() {
        return this._width;
    }, set width(value) {
        this._width = value;
    }, get height() {
        return this._height;
    }, set height(value) {
        this._height = value;
    }, set dx(value) {
        this.movementParam.dx = value;
    }, get dx() {
        return this.movementParam.dx;
    }, xmov: function (param) {
        if (param.externalDx == undefined) {
            this.x += param.dx * param.speedX;
        } else {
            this.x += param.externalDx;
        }
        while (this.x + this.width > this.canvas.width) {
            this.x -= this.width;
        }
        while (this.x < 0) {
            this.x += this.width;
        }
        return this;
    },
    ymov: function (param) {
        if (param.externalDy == undefined) {
            this.y += param.dy * param.speedY;
        } else {
            this.y += param.externalDy;
        }       
        return this;
    },
    zmov: function (param) {
    },
    // Default is linear movement
    movement: function () {
        this.xmov(this.movementParam).ymov(this.movementParam);
    },
    collision: function (collResult, context, callback) {
        if (collResult.length == 1 && collResult[0].collisionType == 'NO_COLLISION') {
            this.movementParam.externalDx = null;
            this.movementParam.externalDy = null;
            if (this.adhereWith.length > 0) {

                this.adhereWith = [];
            }

        }

        if (utils.testField(collResult, 'collisionType', 'RIGHT_EDGE')) {
            this.movementParam.dx = -1 * this.movementParam.dx;
        }
        if (utils.testField(collResult, 'collisionType', 'BOTTOM_EDGE')) {
            this.movementParam.dy = -1 * this.movementParam.dy;
        }
        if (utils.testField(collResult, 'collisionType', 'TOP_EDGE')) {
            this.movementParam.dy = -1 * this.movementParam.dy;
        }
        if (utils.testField(collResult, 'collisionType', 'LEFT_EDGE')) {
            this.movementParam.dx = -1 * this.movementParam.dx;
        }
        if (utils.testField(collResult, 'collisionType', 'ANOTHER_OBJECT')) {
            if (!context) {
                this.movementParam.dy = -1 * this.movementParam.dy;
            } else {
            }

        }

    },
    /**
     * instance object collisionHandler
     * @param sceneObject actor
     * @param sceneObject counterActor
     
     */
    onCollision: function (actor, counterActor) {
        //utils.log('ON COLLISION');
    },
    /**
     * move adhered objects
     * @returns {undefined}
     */
    adhere: function () {
        for (i = 0; i < this.adhereWith.length; i++) {

            this.scene.clearOld(this.adhereWith[i]);
            this.adhereWith[i].movementParam.externalDx = ~~this.dx;
            this.adhereWith[i].movementParam.externalDy = ~~this.dy;
            this.scene.move(this.adhereWith[i], true);
            this.scene.drawObject(this.adhereWith[i]);
            this.adhereWith[i].movementParam.externalDx = null;
            this.adhereWith[i].movementParam.externalDy = null;

        }
    }
};


/**
 * @class Scene
 *
 */
var Scene = function (RootObj) {
    this.rootObj = RootObj;   
    var mappable = new mapsBehaviour();
    mappable.setOwner(this);
    /*this.width = this.rootObj.wrapper.clientWidth;
    this.height = this.rootObj.wrapper.clientHeight;*/
   
    this.scrollX = 0;
    this.scrollY = 0;
    this.canvas = document.createElement('canvas');

    this.canvas.setAttribute('width', this.rootObj.wrapper.clientWidth + 'px');
    this.canvas.setAttribute('height', this.rootObj.wrapper.clientHeight + 'px');
    this.canvas.setAttribute('style', 'position: absolute; left:' + this.rootObj.wrapper.offsetLeft + '; top:' + this.rootObj.wrapper.offsetTop + '; z-index:' + this.rootObj.wrapper.children.length + ';');
    this.rootObj.wrapper.appendChild(this.canvas);
      debugger;
    var beh = new setImageBehavior();
    beh.setOwner(this);
    
   /* this.loadSprites('resources/sprites.png');
    this.loadSprites('resources/layout/winter_ground/ground2.png');
    this.loadSprites('resources/layout/winter_ground/ground3.png');
    this.loadSprites('resources/layout/accessories/ladder.png');*/

};
Scene.prototype = {
    objects: [],    
    onAfterLoadMap : function (){
        this.width  = this.mapWidth || 500;
        this.height = this.mapHeight || 500;
        
    },
    onInit: function()
    {        
        this.loadMap('level1.xml');
        this.onAfterLoadMap();
    },    
    mapLoaded : false,
    get rootObj() {
        return this._rootObj;
    },
    set rootObj(value) {
        this._rootObj = value;
    },
    getScObject: function (index) {
        return (index in this.objects) ? this.objects[index] : (function () {
            return new sceneObject();
        })(index);
    },
    drawLayout: function () {
        var ctx = this.canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.layout.image, 0, 0);
       
    },
    /**
     * Internal method
     * Delete old visual content
     * @param sceneObject obj
     * @returns nothing
     */
    clearOld: function (obj) {
        obj.ctx.save();
        obj.ctx.translate(-(obj.movementParam.dx * obj.movementParam.speedX), -(obj.movementParam.dy * obj.movementParam.speedY));
        obj.ctx.clearRect(-7, -7, obj.width + 14, obj.height + 14);
        obj.ctx.restore();
    },
    loadSprites: function (path, alias) {
        var spritesSheet = new image();
        spritesSheet.loadFromFile(path);
        alias = alias || this.images.length;
        this.images[alias] = spritesSheet;
    },
    clearFull: function (obj) {
        obj.ctx.clearRect(0, 0, 500, 500);
    },
    /**
     * Visualize scene
     * @returns {undefined}
     */
    render: function () {
        var i;
        for (i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            this.drawObject(obj);
            if (obj.rotationAngle > 0) {
                this.rotate(-obj.rotationAngle);
            }
        }
    },
    /**
     * Adds object to scheme
     * @param sceneObject obj
     * @returns nothing
     */
    putObj: function (obj) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', this.rootObj.wrapper.clientWidth + 'px');
        canvas.setAttribute('height', this.rootObj.wrapper.clientHeight + 'px');
        canvas.setAttribute('style', 'position: absolute; left:' + this.rootObj.wrapper.offsetLeft + '; top:' + this.rootObj.wrapper.offsetTop + '; z-index:' + this.rootObj.wrapper.children.length + ';');
        this.rootObj.wrapper.appendChild(canvas);
        obj.canvas = canvas;
        obj.scene = this;
        obj.ctx.setTransform(1, 0, 0, 1, obj.x, obj.y);
        this.objects.push(obj);
        obj.Index = this.objects.length;
    },
    /** Returns sceneObject by index
     *
     * @param int index
     * @returns sceneObject object
     */
    getObj: function (index) {
        //this.objects[index].ctx.restore();
        return this.objects[index];
    },
    /**
     * Returns sceneObject by name
     * 
     * @param string name
     * @returns sceneObject object
     */
    getObjByName:  function (name)
    {
        for (var i in this.objects)
        {
           var e = this.objects[i]; 
           if (e.name && e.name.toLowerCase() === name.toLowerCase()) 
           {
               return e;
               
           }
        }
        return false;
    },
    
    /**
     *  Performing movement of given object
     * @param sceneObject obj
     * @returns nothing
     */
    move: function (obj, dontCollide) {
        if (!obj.isIngame) {
            return;
        }
        obj.previousX = obj.x;
        obj.previousY = obj.y;
        if (!dontCollide) {
            var collisionResult = this.getCollision(obj);
            obj.collision(collisionResult, this.objects);
        }
        obj.movement();
        obj.ctx.translate(obj.x - obj.previousX, obj.y - obj.previousY);
    },
    /**
     * Directly moves object to the specified position
     */
    moveDirect: function (obj, x, y) {
        obj.isIngame = false;
        obj.previousX = obj.x;
        obj.previousY = obj.y;
        obj.x = x;
        obj.y = y;
        obj.ctx.translate(obj.x - obj.previousX, obj.y - obj.previousY);
        obj.isIngame = true;
    },
    /**
     *  Performs rotating of given object to given angle
     *
     * @param sceneObject object
     * @param float angle rotating angle in degrees
     * @returns nothing
     */
    rotate: function (obj, angle) {
        obj.ctx.save();
        obj.rotationAngle += angle;
        obj.rotationAngle = obj.rotationAngle % 360
        obj.ctx.translate(obj.width / 2, obj.height / 2);
        obj.ctx.rotate(angle * Math.PI / 180);
        obj.ctx.translate(-(obj.width / 2), -(obj.height / 2));
        this.drawObject(obj);
        obj.ctx.restore();
    },
    drawObject: function (obj) {
        //obj.ctx.save        
        if (!obj.image) {
            obj.ctx.fillStyle = "rgb(" + obj.color + ")";
            obj.ctx.fillRect(0, 0, obj.width, obj.height);
        } else {
            obj.drawSprite();
        }
    },
    drawLine: function (obj, x1, y1, x2, y2) {
        obj.ctx.clearRect(0, 0, 500, 500);
        obj.ctx.fillStyle = "rgb(129,10,120)";
        //obj.ctx.beginPath();
        obj.ctx.moveTo(x1, y1);
        obj.ctx.lineTo(x2, y2);
        obj.ctx.stroke();
    },
    getCollision: function (obj) {
        obj.collideWith.length = 0;
        var result = [{'collisionType': collisionType[5], 'collisionVector': null}];
        if (obj.x + obj.width >= this.width) {
            result.push({'collisionType': collisionType[3]});
        }
        if (obj.x <= 0) {
            result.push({'collisionType': collisionType[2], 'collisionVector': null});
        }
        if (obj.y + obj.height >= this.height) {
            result.push({'collisionType': collisionType[0], 'collisionVector': null});

        }
        if (obj.y <= 0) {
            result.push({'collisionType': collisionType[1], 'collisionVector': null});
        }
        var i = 0;
        for (i = 0; i < this.objects.length; i++) {
            var cand = this.objects[i];
            if (cand.name == obj.name) {
                continue;
            }
            if (Math.abs(cand.x - obj.x) > obj.width && Math.abs(cand.y - obj.y) > obj.height + 20) {
                continue;
            }

            var right = cand.x + cand.width,
                    left = cand.x,
                    top = cand.y,
                    bottom = cand.y + cand.height;
            var candCenter = new mPoint((cand.x + cand.width / 2), (cand.y + cand.height / 2));
            var objCenter = new mPoint((obj.x + obj.width / 2), (obj.y + obj.height / 2));
            var vectorBtwCenters = new mVector(candCenter, objCenter);

            var
                    XIntersectionSigned = (cand.width / 2 + obj.width / 2) - vectorBtwCenters.X,
                    YIntersectionSigned = (cand.height / 2 + obj.height / 2) - vectorBtwCenters.Y,
                    XIntersection = Math.abs(cand.width / 2 + obj.width / 2) - Math.abs(vectorBtwCenters.X),
                    isXCollision = XIntersection > -10,
                    YIntersection = Math.abs(cand.height / 2 + obj.height / 2) - Math.abs(vectorBtwCenters.Y),
                    isYCollision = YIntersection > -10;

            if (isXCollision && isYCollision) {
                
                document.getElementById('isCollided').style.backgroundColor = '#ff00ee';
                var collResult = {
                    collisionVector: vectorBtwCenters,
                    collisionType: collisionType[4],
                    collisionIntersection: {
                        'x': XIntersectionSigned,
                        'y': YIntersectionSigned,
                        'dirX': vectorBtwCenters.X >= 0 ? 1 : -1,
                        'dirY': vectorBtwCenters.Y > 0 ? 1 : -1,
                    },
                    'obj': cand
                };
                result.push(collResult);
                obj.collideWith.push(i);
            }
            else {
                document.getElementById('isCollided').style.backgroundColor = '#fff';
            }
        }
        return result;
    },
    moveObject: function (obj, noCollision) {
        this.clearOld(obj);
        this.move(obj, noCollision);
        this.drawObject(obj);
    }
};

function angularMovingSceneObject(x, y, w, h, angle) {
    this.movingAngle = new Util().deg2rad(angle);
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.canvas = null;
    this.collideWith = [];
    this.type = 'PLATFORM';
    return this;
}
angularMovingSceneObject.prototype = inherit(sceneObject.prototype);
angularMovingSceneObject.prototype.xmov = function (param) {
    this.x += param.dx * param.speedX * Math.cos(this.movingAngle).toPrecision(1);
    return this;
};
angularMovingSceneObject.prototype.ymov = function (param) {
    this.y += param.dy * param.speedY * Math.sin(this.movingAngle).toPrecision(3);
    return this;
};

function circularMovingSceneObject(x, y, w, h, r) {
    this.radius = r;
    // TODO Call parent constructor
    this.centerX = x;
    this.centerY = y;
    this.x = x;
    this.y = y;
    this.movingAngle = 0;
    this.width = w;
    this.height = h;
    this.movementParam = {
        dx: 1,
        dy: 1,
        speedX: 1,
        speedY: 1
    };
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.canvas = null;
    this.collideWith = [];
    return this;
    //circular.prototype.apply(x, y, w, h, 0);
}
circularMovingSceneObject.prototype = inherit(angularMovingSceneObject.prototype);
circularMovingSceneObject.prototype.xmov = function (param) {
    this.x = this.centerX + this.radius * Math.cos(this.movingAngle += 0.01 % 6.19 * this.movementParam.dx).toPrecision(
            3);
    return this;
};
circularMovingSceneObject.prototype.ymov = function (param) {
    this.y = this.centerY + this.radius * Math.sin(this.movingAngle += 0.01 % 6.19 * this.movementParam.dy).toPrecision(
            3);
    return this;
};
circularMovingSceneObject.prototype.collision = function (collResult, context, callback) {
    if (collResult.indexOf('ANOTHER_OBJECT') != -1) {
        if (context) {
            var i = 0;
            var obj = context[this.collideWith[0]];
            //obj.collideWith()
            obj.collideWith[0] = this;
            this.movementParam.dx = -1 * this.movementParam.dx;
            this.movementParam.dy = -1 * this.movementParam.dy;
            this.movingAngle += this.movementParam.dx * 0.1;
        }
    }
}



/**
 * @class Interface
 */
Interface = {
    scene: null,
    preInit : function (root)
    {
        this.scene = new Scene(root);        
        this.scene.onInit();
    },
    start: function (root) {
        this.scene.drawLayout();
        this.doStartNew();
        //this.onInit();
    },
    onInit: function () {
        var o1 = new sceneObject(160, 170, 80, 20);
        o1.name = 'Stairs';
        o1.type = 'PLATFORM';
        /*Setting up sprites and threading  for object 2*/
        var o2 = new spriteObject(120, 120, 28, 40);
        o2.name = 'Mario';

        o2.onTick = function (sender, param) {
            sender.setSprite(0, 0, sender.counter);
            Interface.scene.clearOld(o2);
            Interface.scene.move(o2);
            Interface.scene.drawObject(o2);
        };
        var o3 = new sceneObject(140, 210, 120, 30);
        o3.name = ' Long blue block';

        var o4 = new sceneObject(250, 128, 120, 30);
        o4.name = ' Purple block';
        var o5 = new sceneObject(50, 280, 460, 50);
        o5.name = ' Brown block';
        //var oLine = new sceneObject(5,5,5,5);
        //oLine.type = 'DISABLE_COLLISIONS';
        //oLine.name = "line";
        o1.color = '10,100,40';
        o2.color = '250,40,40';
        o3.color = '30,30,250';
        o4.color = '90,50,180';
        o5.color = '180,50,30';
        //oLine.color = '50,10,70';
        o2.movementParam.dx = 0;
        o2.movementParam.dy = 0;
        o4.movementParam.dx = 0;
        o4.movementParam.dy = 0;
        o3.movementParam.dx = 1;
        o3.movementParam.dy = 0;
        o5.movementParam.dx = 0;
        o5.movementParam.dy = 0;

        this.scene.putObj(o2);
        this.scene.putObj(o3);
        this.scene.putObj(o4);
        this.scene.putObj(o5);
        this.scene.putObj(o1);
        //this.scene.putObj(oLine);

        o2.setSprite(0, 0, 0);
        o3.setTile(1, 0, 0, 120, 120);
        o5.setTile(1, 0, 0, 120, 120);
        o4.setTile(2, 0, 0, 120, 120);
        o1.setTile(1, 0, 0, 120, 120);

        this.doStart();
    },
    doStartNew : function (){
        
        var objMario = Interface.scene.getObjByName('Mario');
        var objBlock = Interface.scene.getObjByName('Platform1');
      //  var gravity = new Force("gravity", Vector.create([0, 0.2, 0]));
     //   objMario.addForce(gravity);
        this.scene.objects.forEach(function(e){
            console.log('Drawing '+e.name);
            Interface.scene.drawObject(e);
        });
        
          document.addEventListener('keydown', function (event) {
            objMario.isIngame = true;
            var key = event.which;
            switch (key) {
                case 37:
                    key = 'KEY_LEFT';
                    objMario.moveLeft();
                    objMario.start();
                    break;
                case 38:
                    key = 'KEY_UP';
                    objMario.moveUp();
                    objMario.start();
                    break;
                case 39:
                    key = 'KEY_RIGHT';
                    objMario.moveRight();
                    objMario.start();
                    break;
                case 40:
                    key = 'KEY_DOWN';
                    objMario.moveDown();
                    objMario.start();
                    break;
                case 32:
                    key = 'KEY_JUMP';
                    objMario.moveJump();
                    objMario.start();
                    break;
                default:
                    console.log('Unknown key: ' + key);
            }
        });
    },
    doStart: function () {
        
        var obj2 = Interface.scene.getObj(0);
        var gravity = new Force("gravity", Vector.create([0, 0.2, 0]));
        obj2.addForce(gravity);
        document.addEventListener('keydown', function (event) {
            obj2.isIngame = true;
            var key = event.which;
            switch (key) {
                case 37:
                    key = 'KEY_LEFT';
                    obj2.moveLeft();
                    obj2.start();
                    break;
                case 38:
                    key = 'KEY_UP';
                    obj2.moveUp();
                    obj2.start();
                    break;
                case 39:
                    key = 'KEY_RIGHT';
                    obj2.moveRight();
                    obj2.start();
                    break;
                case 40:
                    key = 'KEY_DOWN';
                    obj2.moveDown();
                    obj2.start();
                    break;
                case 32:
                    key = 'KEY_JUMP';
                    obj2.moveJump();
                    obj2.start();
                    break;
                default:
                    console.log('Unknown key: ' + key);
            }
        });
        var j = 0;
        main_timer = setInterval(
                function () {
                    j = (g % 60 == 0) ? ++j : j;
                    var obj2 = Interface.scene.getObj(0);
                    var obj3 = Interface.scene.getObj(1);
                    var obj4 = Interface.scene.getObj(2);
                    var obj5 = Interface.scene.getObj(3);
                    var obj6 = Interface.scene.getObj(4);
                    Interface.scene.clearOld(obj3);
                    Interface.scene.move(obj3);
                    Interface.scene.drawObject(obj3);
                    Interface.scene.drawObject(obj4);

                    document.getElementById('isJumping').style.backgroundColor = obj2.isJumping ? 'red' : 'white'
                    document.getElementById('isSuspended').style.backgroundColor = obj2.suspended ? 'red' : 'white'
                    document.getElementById('isStaying').style.backgroundColor = obj2.isStaying ? 'yellow' : 'white';
                    if (!obj2.isJumping && obj2.isIngame) {
                        obj2.applyForces();
                        Interface.scene.moveObject(obj2, false);
                    }
                    //obj3.adhere();
                    document.getElementById('marioDx').innerHTML = obj2.movementParam.dx;
                    document.getElementById('marioDy').innerHTML = obj2.movementParam.dy;
                    Interface.scene.clearOld(obj5);
                    Interface.scene.move(obj5);
                    Interface.scene.drawObject(obj5);
                    Interface.scene.clearOld(obj6);
                    Interface.scene.drawObject(obj6);

                    //obj.ctx.restore();           */
                }, 25);
    }
};