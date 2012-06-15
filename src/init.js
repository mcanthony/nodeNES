// Filter the files opened with the compiler
var files_opened = [];

function ide_open_file(file){
    files_opened.push(file);
    return compiler.default_open_file(file);
}

compiler.set_open_file_handle(ide_open_file);

//combo behavior on change;
$("#source_files").change(function() {
      var value = $(this).val();
      open_file(value);
});

var loader = new ui.SpriteLoader();

function open_file(file){
    $.get(file, function(data) {
        var regex = /([a-z\/]+\/)([a-z\d]+\.asm)/;
        var m  = regex.exec(file);
        if (m) {
            files_opened = [];
            compiler.path = m[1];
            asmEditor.setValue(data);
            update();
            for (var f in files_opened){
                if (files_opened[f].match(/\.chr$/)){
                    loader.load(compiler.path + files_opened[f]);
                    break;
                }
            };
        }
    });
}


function update(){
    clearTimeout(_idleTimer);
    console.log('compilling');
    var data;
    try {
        data = compiler.nes_compiler(asmEditor.getValue());
        _nes.loadRom(data);
        _nes.start();
    } catch (e){
        console.log(e);
    }
}

var _idleTimer = null;

function scheduleUpdate(){
    if (_idleTimer !== null){
        clearTimeout(_idleTimer);
    }
    _idleTimer = setTimeout(update, 3000);
}

$(function() {
    asmEditor = CodeMirror.fromTextArea($("#asm")[0], {
        lineNumbers: true,
        matchBrackets: true,
        useCPP: true,
        mode: "text/x-asm",
        onChange: scheduleUpdate
        });
});

var _nes;

function emulatorUI () {
    var parent = this;
    var UI = function(nes) {
        this.nes = nes;
        _nes = nes;
        this.screen = $('#nes-screen')[0];
        this.zoomed = false;

        this.canvasContext = this.screen.getContext('2d');
        this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
        this.resetCanvas();
        $(document).
            bind('keydown', function(evt) {
                _nes.keyboard.keyDown(evt); 
            }).
            bind('keyup', function(evt) {
                _nes.keyboard.keyUp(evt); 
            }).
            bind('keypress', function(evt) {
                _nes.keyboard.keyPress(evt);
            });
        this.dynamicaudio = new DynamicAudio({
            swf: nes.opts.swfPath+'dynamicaudio.swf'
        });
    };

    UI.prototype = {    
        resetCanvas: function() {
            this.canvasContext.fillStyle = 'black';
            this.canvasContext.fillRect(0, 0, 256, 240);
            for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                this.canvasImageData.data[i] = 0xFF;
            }
        },
        enable: function() {
        },
        updateStatus: function(s) {
        },
        writeAudio: function(samples) {
            return this.dynamicaudio.writeInt(samples);
        },
        writeFrame: function(buffer, prevBuffer) {
            var imageData = this.canvasImageData.data;
            var pixel, i, j;

            for (i=0; i<256*240; i++) {
                pixel = buffer[i];

                if (pixel != prevBuffer[i]) {
                    j = i*4;
                    imageData[j] = pixel & 0xFF;
                    imageData[j+1] = (pixel >> 8) & 0xFF;
                    imageData[j+2] = (pixel >> 16) & 0xFF;
                    prevBuffer[i] = pixel;
                }
            }
            this.canvasContext.putImageData(this.canvasImageData, 0, 0);
        }
    };
    return UI;
}

$(function() {
    new JSNES({
        'swfPath': '',
        'ui': emulatorUI()
    });
});

//sprite editor

var sprites = sprite.load_sprites('example/scrolling/mario.chr');
var options = {
    sprites: sprites,
    palette: [0x22,0x16,0x27,0x18],
    sprite_x: 8,
    sprite_y: 16
};

var spr_editor = $('#sprite-editor')[0];
var pixel_editor = new ui.PixelEditor(spr_editor, 165, 0, options);
var selector = new ui.SpriteSelector(spr_editor, 440, 0, options);
var palette = new ui.Palette(spr_editor, 0 , 325, options);
var color_picker = new ui.ColorPicker(spr_editor, 165,270,20, options);
var preview = new ui.Preview(spr_editor, 0, 0, options);

pixel_editor.addColorChangeListener(palette);
palette.addColorChangeListener(selector);
palette.addColorChangeListener(preview);
palette.addColorChangeListener(pixel_editor);
color_picker.addColorChangeListener(palette);
selector.addPreviousPageButton("fast_backward.png", 440, 315);
selector.addNextPageButton("fast_forward.png", 475, 315);

//TODO selector sprite one by one
//TODO selector sprite 8 by 8

selector.addSpriteChangedListener(preview);
preview.addSpriteChangedListener(pixel_editor);
pixel_editor.addRedrawListener(preview);
pixel_editor.addRedrawListener(selector);

loader.addRedrawListener(selector);
loader.addRedrawListener(preview);
loader.addRedrawListener(pixel_editor);

function getCursorPosition(canvas, event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    var element = canvas;

    do {
        totalOffsetX += element.offsetLeft;
        totalOffsetY += element.offsetTop;
        element = element.offsetParent;
    }
    while (element !== null);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    canvasX = Math.round( canvasX * (canvas.width / canvas.offsetWidth) );
    canvasY = Math.round( canvasY * (canvas.height / canvas.offsetHeight) );

    return {x:canvasX, y:canvasY};
}

$('#sprite-editor').click(
    function(e) {
        var canvas = $(this)[0];
        var pos = getCursorPosition(canvas, e);
        var widgets = [pixel_editor, palette, preview, color_picker, selector];
        for (var w in widgets){
            if (widgets[w].was_clicked(pos.x, pos.y)){
                widgets[w].click(pos.x, pos.y);
                break;
            }
        }
    }
);


//
$('#tabs li:eq(0) a').tab('show');

Path.map("#source").to(function(){
    $('#tabs li:eq(0) a').tab('show');
});

Path.map("#sprites").to(function(){
    $('#tabs li:eq(1) a').tab('show');
});

Path.map("#about").to(function(){
    $('#tabs li:eq(2) a').tab('show');
});

Path.listen();

