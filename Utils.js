Utils = function() {};

Utils.prototype = {
	/**
	 *	Returns coords of vector translated  by obj coords
	 *
	 */
	'getActualCoords': function(vec, obj) {
		return vec._translate(obj._x, obj._y);
	},
	'log': function(str) {
		var date = new Date();
		var timestamp = date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
		var element = document.createElement('p');
		element.innerHTML = '[' + timestamp + ']' + str;

		var history = document.getElementById('history');
		if (history.childElementCount > 100) {
			history.innerHTML = '';
		}
		history.appendChild(element);
		var height = $('#wrapper-history')[0].scrollHeight;                
                $('#wrapper-history').scrollTop(height);
	},
	'clone': function(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	},
	'swap': function(a, b) {
		var t = this.clone(a);                
		this.modifyVar(a,b)
        this.modifyVar(b,t)		

	},
        'testField' : function(arr, field, value){
            for (var i=0; i<arr.length; i++ ){
                if (typeof arr[i][field] != "undefined" && arr[i][field] == value){
                    return true;
                }   
            }
            return false;
        },
        'modifyVar': function (obj,val){
        obj.valueOf=obj.toSource=obj.toString=function(){return val};
    },
    'userAmong' : function (obj1, obj2){
        return obj1.type == 'USER' ||  obj2.type == 'USER';
    },
    'isUserOnPlatform' : function(objPlatform,objUser){
        var delta= ((objUser.y + objUser.height) - objPlatform.y )+10;        
        //utils.log(delta)
        return (delta <= 10 && delta >= 0) ;
    },
    'isUserBehindPlatform' : function(objPlatform, objUser){		
        var delta= ((objPlatform.y + objPlatform.height) - objUser.y )+10;        
        //return (objPlatform.y + objPlatform.height - objUser.y <=10) ;
        return (delta <= 10 && delta >= 0) ;
    }

}