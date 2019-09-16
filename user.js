var utils = new Utils();

/**
 * @class spriteObject
 */
function spriteObject(x, y, w, h) {
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
    this.type = 'USER';
    this.rotationAngle = 0.0;
    this.scene = null;
    this.previousX = 0;
    this.previousY = 0;
    this.collideWith = [];
    this.colliders = [];
    this.transformArray = [1, 0, 0, 1, 0, 0];
    this.isIngame = false;
    this.isJumping = false;
    this.isStaying = false;
    this.adheredWith = null;
    var behSpriteable = new spriteBehavior();
    behSpriteable.setOwner(this);
    var behThreadable = new threadBehavior();
    behThreadable.setOwner(this);
    var behPhysicable = new physicalBehavior();
    behPhysicable.setOwner(this);

    this.onEndTicking = function () {
        /*if (!this.isJumping){                
         
         this.movementParam.dy =1;
         this.scene.moveObject(this, true);                
         
         }*/
        this.movementParam.dx = 0;
        this.movementParam.dy = 0;

    };
    this.onEndJumping = function () {
        this.isJumping = false;
        this.scene.clearOld(this);
        this.scene.move(this, false);
        this.scene.drawObject(this);
        
    };

}

spriteObject.prototype = inherit(sceneObject.prototype);
spriteObject.prototype.moveLeft = function () {
    //counter must be 4
    this.movementParam.externalDx = null;
    this.movementParam.dy = 0;
    this.movementParam.dx = -2;
    this.suspended = false;
    this.onTick = function (sender, param) {

        sender.setSprite(0, 3, sender.counter);
        this.scene.clearOld(sender);
        this.scene.move(sender);
        this.scene.drawObject(sender);
    };

};

spriteObject.prototype.moveRight = function () {
    //counter must be 4
    this.movementParam.externalDx = null;
    this.movementParam.dy = 0;
    this.movementParam.dx = 2;
    this.suspended = false;
    this.onTick = function (sender, param) {
        sender.setSprite(0, 0, sender.counter);
        if (sender.counter == 0) {
            sender.setSprite(0, 0, 2);
        }
        this.scene.clearOld(sender);
        this.scene.move(sender);
        this.scene.drawObject(sender);

    };
}

spriteObject.prototype.moveUp = function () {
    this.movementParam.dx = 0;
    this.movementParam.dy = -2;
    this.suspended = false;
    this.onTick = function (sender, param) {
        sender.setSprite(0, 2, sender.counter);
        this.scene.clearOld(sender);
        this.scene.move(sender);
        this.scene.drawObject(sender);
    };
};

spriteObject.prototype.moveDown = function () {
    //counter must be 4
    this.movementParam.externalDx = null;
    this.movementParam.dx = 0;
    this.movementParam.dy = 2;
    this.suspended = false;
    this.onTick = function (sender, param) {
        sender.setSprite(0, 1, sender.counter);
        this.scene.clearOld(sender);
        this.scene.move(sender);
        this.scene.drawObject(sender);
    };
};

spriteObject.prototype.collision = function (collResult, context, callback) {
    if (collResult.length == 1 && collResult[0].collisionType == 'NO_COLLISION') {
        this.movementParam.externalDx = null;
        this.movementParam.externalDy = null;
        document.getElementById('isStaying').style.backgroundColor = 'white';
    }    
    if (utils.testField(collResult, 'collisionType', 'RIGHT_EDGE')) {
        this.movementParam.dx = -1 * this.movementParam.dx;
    }
    if (utils.testField(collResult, 'collisionType', 'BOTTOM_EDGE')) {
        this.movementParam.dy = 0;
        this.isStaying = true;
        document.getElementById('isStaying').style.backgroundColor = 'yellow';
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
            if (0 < this.collideWith.length) {
                document.getElementById('isCollided').style.backgroundColor = '#ff00ee';
                //for (var i = 0; i < this.collideWith.length; i++) {
                //   this.onCollision(this.scene.objects[this.collideWith[i]], collResult);
                //}
                this.onCollision(this.collideWith, collResult);
            } else {
                document.getElementById('isCollided').style.backgroundColor = '#ffffff';
                this.movementParam.dx = 0;
                this.movementParam.dy = 0;
            }
        }

    }
},
spriteObject.prototype.stay = function (withObj) {
    var adhered_w_object = withObj || -1;
    this.movementParam.dy = 0;
    this.isStaying = true;
    this.adheredWith = adhered_w_object;
    document.getElementById('isStaying').style.backgroundColor = 'yellow';
};

spriteObject.prototype.onCollision = function (collisionWithArray, context) {
    var utils = new Utils();

    if (!this.isIngame) {
        return false;
    }
    
    for (var i = 1; i < context.length; i++) {
        
        //this.movementParam.dy = 0;
        var collisionWith = Interface.scene.getObj(context[i].obj.Index-1);
        if (collisionWith.type == 'DISABLE_COLLISIONS'){
            continue;
        }
        var quarter = Geometry.getCollisionQuarters(collisionWith, this);
        //utils.log(quarter);
        var currentContext =  context[i];                
        var isOnTop = utils.isUserOnPlatform(collisionWith, this);       
        if (isOnTop) {
            {
                
                this.movementParam.externalDx = null;
                this.movementParam.externalDy = null;
                this.stay(collisionWith);
                if (collisionWith.adhereWith.indexOf(this) == -1) {
                    collisionWith.adhereWith.push(this);
                }
                return true;
            }

        } else {

            this.isStaying = false;
            this.adhereWith = null;
            collisionWith.adhereWith = [];
            this.adhereWith = [];
            this.movementParam.externalDx = null;
            this.movementParam.externalDy = null;


            if (typeof currentContext != "undefined" && typeof currentContext.collisionIntersection
                    != "undefined" && !isOnTop) {                
                this.movementParam.externalDx = null;
                this.movementParam.externalDy = null;
            }
        }

        
        /*if (this.adheredWith && collisionWith.Index != this.adheredWith.Index) */{
            var newVec = currentContext.collisionVector.RotAroundEnd180();
            //var oldVec = currentContext.collisionVector;
            //var line = Interface.scene.getObj(5);            
            //Interface.scene.drawLine(line, oldVec.start.x, oldVec.start.y, oldVec.end.x, oldVec.end.y);                                   
            this.isIngame = false;
            var old_dx = this.movementParam.dx;                        
            this.scene.clearOld(this);
            
            this.movementParam.dx = newVec.end.x - this.x > 0 ? 2 : -2; //(newVec.end.x - this.x)/10;
            this.x = this.x + this.movementParam.dx;
            this.scene.moveObject(this, true);
            this.movementParam.dx =old_dx;            
            this.isIngame = true;
          }
    
    }
};

spriteObject.prototype.moveJump = function () {
    if (this.isJumping || !this.isStaying) {
        return;
    }

    this.suspended = false;

    this.movementParam.externalDx = null;
    this.movementParam.externalDy = null;
    var obj = Interface.scene.getObj(0);
    this.movementParam.dx = 0;
    this.movementParam.dy = -10;
    this.scene.clearOld(obj);
    this.scene.move(obj, true);
    this.scene.drawObject(obj);
    this.terminated = false;
    this.isStayng = false;
    this.isJumping = true;
    var self = this;
    this.reflectJump = false;
    var jumpTick = function (pt, sender) {

        var obj = sender;
        // obj.isStaying = false;
        var context = Interface.scene.getCollision(obj);
        var obj_movement_param_dy = pt.y - obj.y;
        if (2 == context.length && context[1].collisionType == 'ANOTHER_OBJECT')
        {
            //obj.collision(context, this.objects);            
            var obj_coll = Interface.scene.getObj(obj.collideWith[0]);
            var quarter = Geometry.getCollisionQuarters(obj, obj_coll);

            //var signX = context[1].collisionIntersection.x > 0 ? 1 : -1;            
            var isOnTop = utils.isUserOnPlatform(obj_coll, obj);
            if ((quarter == 3 || quarter == 4) && isOnTop) {
                utils.log('Above platform');
                return false;
            } else {
                if ((quarter == 1 || quarter == 2) && utils.isUserBehindPlatform(obj_coll, obj)) {
                    utils.log('Behind platform');
                    obj.reflectJump = true;
                    obj_movement_param_dy -= context[1].collisionIntersection.y;
                } else {
                    ////obj.reflectJump = true;
                }
            }
            if (obj.reflectJump) {
                obj.movementParam.dy = obj_movement_param_dy < 0 ? 4 : -4;
                obj.movementParam.dx = -1 * obj.movementParam.dx;
            } else {
                obj.movementParam.dy = obj_movement_param_dy;
            }

        } else {
            if (!obj.reflectJump) {
                obj.movementParam.dy = obj_movement_param_dy;
            }
            else {
                obj.movementParam.dy = obj_movement_param_dy < 0 ? 1 : obj_movement_param_dy;
            }
        }
        document.getElementById('isStaying').style.backgroundColor = obj.isStaying ? 'yellow' : 'white';

        Interface.scene.clearOld(obj);
        Interface.scene.move(obj, true);
        Interface.scene.drawObject(obj);

        return true;
    };
    Geometry.getJumpCurve(jumpTick, obj);
    // obj.dx = 0;
    // obj.dy = 0;

    this.onTick = function (sender, param) {

    };

};