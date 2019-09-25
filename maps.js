//maps and sprites  
//
// part.of joke.js



Maps = function () {
    this.xmlMap = null;
    this.name = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.spriteSheets = [];
};

Maps.prototype = {
    'loadMap': function (url) {
        var xhr = new XMLHttpRequest(), xml, xpr, node;
        xhr.open('GET', url, false);
        xhr.send(null);
        var self = this;
        if (xhr.status === 200) {
            xml = xhr.responseXML;
            try {
                if (!xml)
                {
                    throw "Не удалось загрузить карту";
                }
                var object_node, sprite_node;
                
                this.xmlMap = xml;
                this.mapWidth = parseInt(xml.evaluate('map/width', xml, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
                this.mapHeight = parseInt(xml.evaluate('map/height', xml, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
                this.layout = new image();
                
               /* this.layout.width = this.mapWidth;
                this.layout.height = this.mapHeight;*/
                let layout = xml.evaluate('map/layout', xml, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
                this.layout.loadFromFile(layout);
                
                var sprites_nodes_expr = xml.evaluate('map/spritesheets/sheet', xml, null, XPathResult.ANY_TYPE, null);
                
                while (null !== (object_node = sprites_nodes_expr.iterateNext()))
                {                    
                    var spriteSheet  = 
                    {
                        src : object_node.getElementsByTagName('src')[0].textContent,
                        offsetX : object_node.getElementsByTagName('offsetx')[0].textContent,
                        offsetY : object_node.getElementsByTagName('offsety')[0].textContent,
                        width : object_node.getElementsByTagName('width')[0].textContent,
                        height : object_node.getElementsByTagName('height')[0].textContent,
                        gapX : object_node.getElementsByTagName('gapx')[0].textContent,
                        gapY : object_node.getElementsByTagName('gapy')[0].textContent,
                        name : object_node.getAttribute('name')
                    };
                    this.spriteSheets[spriteSheet.name] = spriteSheet;
                }
                
                
                var objects_nodes_expr = xml.evaluate('map/objects/object', xml, null, XPathResult.ANY_TYPE, null);
                while (null !== (object_node = objects_nodes_expr.iterateNext()))
                {
//                    console.log(object_node);
                    var 
                    object_type     = object_node.getElementsByTagName('type')[0].textContent,
                    object_name     = object_node.getElementsByTagName('name')[0].textContent,
                    object_width    = parseInt(object_node.getElementsByTagName('width')[0].textContent),
                    object_height   = parseInt(object_node.getElementsByTagName('height')[0].textContent),
                    object_x        = parseInt(object_node.getElementsByTagName('x')[0].textContent),
                    object_y        = parseInt(object_node.getElementsByTagName('y')[0].textContent),
                    object_color    = object_node.getElementsByTagName('color').length > 0 
                        ? object_node.getElementsByTagName('color')[0].textContent : null,
                    object_sprite       = object_node.getElementsByTagName('sprite').length > 0  
                        ? object_node.getElementsByTagName('sprite')[0].textContent : null,
                    object_movement_obj  = object_node.getElementsByTagName('movement'),
                    object_spritesheet = object_node.getElementsByTagName('spriteSheet').length > 0  ? 
                         object_node.getElementsByTagName('spriteSheet')[0].textContent : null;
                                        
                   /* if (object_sprite)
                    {
                        this.loadSprites(object_sprite, object_name);
                    }*/
                    
                    var o  = new spriteObject(object_x, object_y, object_width, object_height);
                        o.name   = object_name;
                        o.color = object_color;
                        
                    if (o && object_spritesheet)
                    {
                        this.loadSprites(this.spriteSheets[object_spritesheet].src, object_name);
                        o.gapX = parseInt(this.spriteSheets[object_spritesheet].gapX);
                        o.gapY = parseInt(this.spriteSheets[object_spritesheet].gapY);
                        o.offsetX = parseInt(this.spriteSheets[object_spritesheet].offsetX);
                        o.offsetY = parseInt(this.spriteSheets[object_spritesheet].offsetY);
                       /* o.width =     this.spriteSheets[object_spritesheet].width;
                        o.height =     this.spriteSheets[object_spritesheet].height;*/
                    }
                    
                    switch (object_type){
                    case 'user':                            
                        o.onTick = function (sender, param, scene) {
                            sender.setSprite(sender.name, 0, sender.counter);
                            self.clearOld(sender);
                            self.move(sender);
                            self.drawObject(sender);
                        };                                                       
                        break;
                    case "default":
                        break;
                    }
                    this.putObj(o);
                    if (object_sprite)
                    {
                        o.setSprite(o.name, 0, 0);
                    }
                }
            }
            catch (e)
            {
                console.log('Ошибка при загрузке карты:', e);
            }
            console.log(this.mapWidth, this.mapHeight);
        }
    }
};
