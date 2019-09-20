//images
// part.of joke.js
image = function() {
    this.spriteWidth = 0;
    this.spriteHeight= 0;
};

image.prototype = {
    "_image": null,
    "url": "",
    "spriteWidth": 0,
    "spriteHeight": 0,
    "name": 0,
    'loadFromFile': function(url) {
        this.url = url;
        this._image = new Image();
        var self = this;
        this._image.onload = function(){
            self.spriteWidth = this.width;
            self.spriteHeight =  this.height;        
        };
        this._image.src = url;           
    },
    get image() {
        return this._image;
    }
};
imageList = function() {
};
imageList.prototype = {
    'images': [],
    'getImage': function(index) {
        return this.images[index];
    }
};


Sprite = function(image, sw, sh, rop) {
    if (image) {
        if (typeof(image) == "HTMLImageElement" || typeof(image) == "Image") {
            this.image = image;
        }
        else {
            throw "Unsupported image format";
        }
    }
    if (rop) {
        this.rasterOperation = rop;
        this.context.globalCompositeOperation = this.rasterOperation;
    }
};


Sprite.prototype = {
    "type" : 'SPRITE',
    "repeat" : 0,    
    "offsetX": 0, //X offset for accurate positioning on a sprite sheet
    "offsetY": 0, // Y offset for accurate positioning on a sprite sheet
    
    "gapX" : 0, // Interim between sprite frames on X axis
    "gapY" : 0, // Interim between sprite frames on Y axis
    
    "image": null,
    
    "srcX": 0, // start clipping x on spritesheet
    "srcY": 0, // start clipping y on spritesheet
    
    "row": 0,
    "col": 0,
    "srcWidth": 0, //sprite width
    "srcHeight": 0, //sprite height
    "destWidth" : 0,
    "destHeight" : 0,    
    "rasterOperation": "source-over",    
};


Sprite.prototype.setSprite = function(imageAlias, row, col) {
    if (this.scene && this.scene.getImage) {
        this.image = this.scene.getImage(imageAlias);
    }
    this.row = row;
    this.col = col;
    if (this.width && this.height) {
        this.srcWidth = this.width;
        this.srcHeight = this.height;
    } else
    {
        console.log("Properties width and/or height are not assigned. ");
    }
    this.srcY = this.srcHeight * row; //TODO + gapX
    this.srcX = (this.srcWidth + 2) * col; //TODO + gapY
};


Sprite.prototype.setTile = function(imageIndex, row, col, tileW,tileH) {
    
    
    if (this.scene && this.scene.getImage) {
        this.image = this.scene.getImage(imageIndex);
    } else {
        return false;
    }
    this.repeat =  Math.ceil(this.owner.width/tileW);    
    this.row = row;
    this.col = col;    
    this.type = 'TILE';
    this.srcWidth = this.width;
    this.srcHeight = this.height;
    this.destWidth = this.width > this.repeat * tileW ? this.width : tileW ;
    this.destHeight = this.owner.height;  
    this.srcY = this.srcHeight * row;
    this.srcX = this.srcWidth * col;    
};

Sprite.prototype.drawSprite = function() {
    if (this.rasterOperation) {
        if (!this.context) {
            this.context = this._canvas.getContext('2d');
        }
        this.context.globalCompositeOperation = this.rasterOperation;
    }
    try {
        //TODO draw if and only if the sprite fits scene's viewport
        if (this.image ){
           
            if (this.type === 'SPRITE'){
                this.context.drawImage(
                    this.image.image,
                    this.srcX,
                    this.srcY,
                    this.srcWidth,
                    this.srcHeight,
                    0,
                    0,
                    this.width,
                    this.height
                    );
                }
            else {
                for (var i = 0; i < this.repeat;i++){
                    this.context.drawImage(
                            this.image.image,
                            this.srcX,
                            this.srcY,
                            this.srcWidth,
                            this.srcHeight,
                            i*this.destWidth,
                            0,
                            this.srcWidth,
                            this.srcHeight
                     );
                }
            }
        }
    }
    catch (e) {
        console.error('error occured : ' + e);
    }
};