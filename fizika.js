/**
 * 
 * returns reversed vector
 * @returns Reversed vector
 */
Vector.prototype.Rev = function() {
	this.x(-1);
};

Force = function(name, vector) {
	this.name = name; 
        this.vector = vector;
};
Force.prototype = {

};

BasePhysics = function() {
	this.Forces = [];
};
//@todo mix to sceneObject
BasePhysics.prototype = {
	"addForce": function(force) {
		this.Forces.push(force);
	},

	"applyForces": function() {
		//find vector sum				
            if (!this.isIngame) {
                return false;
            }
            if (this.isJumping){
                return false;
            }
            
            var vec = Vector.create([this.movementParam.dx, this.movementParam.dy, 0]);
            var i = 0;            
            for (i = 0; i < this.Forces.length; i++) {
                if (undefined !== this.Forces[i].vector){
                   vec = vec.add(this.Forces[i].vector);
                }
            }        
            this.movementParam.dx = vec.elements[0];        
            this.movementParam.dy = vec.elements[1];            
	}
};