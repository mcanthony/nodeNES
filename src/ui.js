(function(exports){

function fillCanvas(sprt, imageData, palette, size, padding){
    if (padding === undefined){
        padding = 0;
    }
    var a = 0;
    for (var y=0; y < 8*size; y++){
        for (var x=0; x < 8*size; x++) {
            var px = (x/size) >> 0;
            var py = (y/size) >> 0;
            var color_index = palette[sprt[py][px]];
            var color = sprite.get_color(color_index);
            imageData[a] = (color >> 16) & 0xff;
            imageData[a+1] = (color >> 8) & 0xff;
            imageData[a+2] = color & 0xff;
            imageData[a+3] = 0xff;
            a += 4;
        }
    }
}

exports.Widget = function(){
    this.colorListeners=[];
    this.spriteListeners=[];
};

exports.Widget.prototype.was_clicked = function(x, y){
    if (x >= this.position_x && x <= this.position_x + this.width &&
        y >= this.position_y && y <= this.position_y + this.height){
        return true;
    }
    return false;
};

exports.Widget.prototype.addSpriteChangedListener = function (widget){
    this.spriteListeners.push(widget);
};

exports.Widget.prototype.onSpriteChanged = function(widget){
};

exports.Widget.prototype.notifySpriteChangeListener = function() {
    for (var l in this.spriteListeners){
         this.spriteListeners[l].onSpriteChanged(this);
    }
};

exports.Widget.prototype.addColorChangeListener = function (widget){
    this.colorListeners.push(widget);
};

exports.Widget.prototype.onColorChanged = function (widget){
};

exports.Widget.prototype.notifyColorChanged = function() {
    for (var l in this.colorListeners){
         this.colorListeners[l].onColorChanged(this);
    }
};

exports.PixelEditor = function (canvas, position_x, position_y, opts) {
    this.canvas = canvas;
    this.position_x = position_x;
    this.position_y = position_y;

    this.sprites = opts.sprites;
    this.palette = opts.palette;

    this.pixelPadding = 1;
    this.pixelSize = 24;
    this.spriteSize = this.pixelSize * 8;
    this.render();
};

exports.PixelEditor.prototype = new exports.Widget();
exports.PixelEditor.prototype.constructor = exports.PixelEditor;

exports.PixelEditor.prototype.render = function() {
    var canvasContext = this.canvas.getContext('2d');
    var canvasImageData = canvasContext.getImageData(this.position_x, this.position_y, this.spriteSize, this.spriteSize);
    var spr = sprite.get_sprite(0, this.sprites);
    var imageData = canvasImageData.data;
    fillCanvas(spr, imageData, this.palette, this.pixelSize, this.pixelPadding);
    canvasContext.putImageData(canvasImageData, this.position_x, this.position_y);
};

exports.Preview = function (canvas, position_x, position_y, opts) {
    this.canvas = canvas;
    this.position_x = position_x;
    this.position_y = position_y;

    this.pixelPadding = 1;

    this.panels = [0,1,2,3,4,5,6,7];
    this.panel_id = 0;

    this.pixelSize = 10;
    this.spriteSize = this.pixelSize * 8;
    if (opts !== undefined) {
        this.sprites = opts.sprites;
        this.palette = opts.palette;
        this.render();
    }
};

exports.Preview.prototype = new exports.Widget();
exports.Preview.prototype.constructor = exports.Preview;

exports.Preview.prototype.change_panel = function (sprite_id, panel_id){
    if (panel_id !== undefined){
        this.panel_id = panel_id;
    }
    this.panels[this.panel_id] = sprite_id;
    this.panel_id++;
    this.panel_id = this.panel_id % 8;
    this.render();
};

exports.Preview.prototype.render = function(panel_id){
    var x = 0;
    var y = 0;
    var canvasContext = this.canvas.getContext('2d');
    for (var p in this.panels){
        var px = (x * this.spriteSize + (this.pixelPadding * x)) + this.position_x;
        var py = (y * this.spriteSize + (this.pixelPadding * y)) + this.position_y;
        var canvasImageData = canvasContext.getImageData(px, py, this.spriteSize, this.spriteSize);
        var spr = sprite.get_sprite(this.panels[p], this.sprites);
        var imageData = canvasImageData.data;
        fillCanvas(spr, imageData, this.palette, this.pixelSize);
        canvasContext.putImageData(canvasImageData, px, py);
        x++;
        if (x % 2 === 0){
            x = 0;
            y++;
        }
    }
};

exports.Preview.prototype.onColorChanged = function(widget){
    this.palette = widget.palette;
    this.render();
};

exports.SpriteSelector = function(canvas, position_x, position_y, opts){
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    
    this.canvas = canvas;
    this.pixelSize = 2;
    this.pixelPadding = 3;

    this.spriteSize= this.pixelSize * 8;
    this.page = 0;

    if (opts !== undefined) {
        this.sprites = opts.sprites;
        this.sprite_total = this.sprites.length / 16 >> 0;
        if (opts.sprite_x !== undefined){
            this.sprite_x = opts.sprite_x;
        } else {
            this.width = this.canvas.width - this.position_x;
            this.sprite_x = (this.width / (this.spriteSize + this.pixelPadding)) >> 0;
        }
        if (opts.sprite_y !== undefined){
            this.sprite_y = opts.sprite_y;
        } else {
            this.sprite_y = (this.sprite_total / this.sprite_x) >> 0;
            this.sprite_y += (this.sprite_total % this.sprite_x !== 0)?1:0;
        }
        this.palette = opts.palette;
        this.width = this.sprite_x * (this.spriteSize + this.pixelPadding) - this.pixelPadding;
        this.height = this.sprite_y * (this.spriteSize + this.pixelPadding) - this.pixelPadding;
        this.render();
    }

};

exports.SpriteSelector.prototype = new exports.Widget();
exports.SpriteSelector.prototype.constructor = exports.SpriteSelector;

exports.SpriteSelector.prototype.nextPage = function(){
    this.page++;

};

exports.SpriteSelector.prototype.previousPage = function(){
    this.page--;

};

exports.SpriteSelector.prototype.click = function (x, y){
    var line = Math.abs((this.position_y - y) / (this.spriteSize + this.pixelPadding) >> 0);
    var col = Math.abs((this.position_x - x) / (this.spriteSize + this.pixelPadding) >> 0);
    var sprite_id = line * this.sprite_x + col;
    //editor.change_panel(sprite_id);
};


exports.SpriteSelector.prototype.render = function(){
    var sprite_id = this.page + (this.sprite_x + this.sprite_y);
    var canvasContext = this.canvas.getContext('2d');
    for (var y=0; y < this.sprite_y; y++){
        for (var x=0; x < this.sprite_x; x++){
            var px =  x * this.spriteSize + (this.pixelPadding * x);
            var py =  y * this.spriteSize + (this.pixelPadding * y);
            var canvasImageData = canvasContext.getImageData(px + this.position_x, py + this.position_y, this.spriteSize, this.spriteSize);
            var imageData = canvasImageData.data;
            var spr = sprite.get_sprite(sprite_id, sprites);
            fillCanvas(spr, imageData, this.palette, this.spriteSize/8);
            canvasContext.putImageData(canvasImageData, px + this.position_x, py + this.position_y);
            sprite_id++;
            if (sprite_id == this.sprite_total){
                break;
            }
        }
    }
};

exports.SpriteSelector.prototype.onColorChanged = function(widget){
    this.palette = widget.palette;
    this.render();
};

exports.Palette = function (canvas, position_x, position_y, opts){
    this.canvas = canvas;
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.width = this.picker_size * 4;
    this.height = this.picker_size;
    if (opts !== undefined) {
        //this.picker_size = opt.picker_size;
        this.palette = opts.palette;
    }
    this.picker_size = 20;
    this.palette_id = 0;
    this.render();
};

exports.Palette.prototype = new exports.Widget();
exports.Palette.prototype.constructor = exports.Palette;

exports.Palette.prototype.render = function(){
    var context = this.canvas.getContext('2d');
    for (var x=0; x < 4; x++) {
        context.beginPath();
        context.rect(
            x * this.picker_size + this.position_x, 
            this.position_y, 
            this.picker_size, 
            this.picker_size
        );
        var color = sprite.get_color(this.palette[x]).toString(16);
        hex = "#000000".substr(0, 7 - color.length) + color;
        context.fillStyle = hex;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#ffffff';
        context.stroke();
    }
};

exports.Palette.prototype.click = function(x, y) {
    var line = Math.abs((this.position_y - y) / this.picker_size >> 0);
    var col = Math.abs((this.position_x - x) / this.picker_size >> 0);
    this.palette_id = line * this.picker_size + col;
    this.notifyColorChanged();
};

exports.Palette.prototype.onColorChanged = function(widget){
    this.palette[this.palette_id] = widget.color_id;
    this.palette_id++;
    this.palette_id = this.palette_id % 4;
    this.render();
    this.notifyColorChanged();
};

exports.ColorPicker = function(canvas, position_x, position_y, options){
    this.canvas = canvas;
    this.position_x = (position_x === null)?0:position_x;
    this.position_y = (position_y === null)?0:position_y;
    this.picker_size = 17;
    this.width = this.picker_size * 16;
    this.height = this.picker_size * 4;
    this.render();
};

exports.ColorPicker.prototype = new exports.Widget();
exports.ColorPicker.prototype.constructor = exports.ColorPicker;

exports.ColorPicker.prototype.render = function(){
    var context = this.canvas.getContext('2d');
    var color_index = 0;
    for (var y=0; y < 4; y++){
        for (var x=0; x < 16; x++) {
            context.beginPath();
            context.rect(
                x * this.picker_size + this.position_x, 
                y * this.picker_size + this.position_y, 
                this.picker_size, 
                this.picker_size
            );
            var color = sprite.get_color(color_index).toString(16);
            hex = "#000000".substr(0, 7 - color.length) + color;
            context.fillStyle = hex;
            context.fill();
            context.lineWidth = 3;
            context.strokeStyle = '#ffffff';
            context.stroke();
            color_index++;
        }
    }
};

exports.ColorPicker.prototype.click = function(x, y) {
    var line = Math.abs((this.position_y - y) / this.picker_size >> 0);
    var col = Math.abs((this.position_x - x) / this.picker_size >> 0);
    this.color_id = line * 16 + col;
    this.notifyColorChanged();
};

})(typeof exports === 'undefined'? this['ui']={}: exports);