/*
  BitPad

  A BitPad is a canvas element that is setup for drawing pixelated images, where each row contains NUMPIXELS (can be changed) pixels. 
  The images created can be loaded and saved via strings with a custom encoding.
  BitPads can also load any number of these images then loop through them, which creates an animation.

*/

// animationFrame polyfill Erik Möller @http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

(function($) {
  var NUMPIXELS = 12;
  var KEYMAP = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM~*"; // 6

  $.fn.bitpad = function(options) {
    var settings = {
      columns: NUMPIXELS,
      rows: NUMPIXELS
    };

    if(options) {
      $.extend(settings, options);
    }
    
    BitPad(this, settings);
    return this;
  }

  var BitPad = function(canvas, settings) {
    var mouseX = -1, 
        mouseY = -1,
        frameWidth = canvas.attr('width'),
        frameHeight = canvas.attr('height'),
        context = canvas[0].getContext('2d');

    // Adjust the size of the canvas to fit our needs
    var pixelSize = Math.floor(frameWidth / NUMPIXELS);
    frameWidth = pixelSize * settings.columns;
    frameHeight = pixelSize * settings.rows;
    canvas.attr('width', frameWidth);
    canvas.attr('height', frameWidth);

    // Sets up the pixel grid
    var grid = [];
    for(var i = 0; i<settings.columns; i++) {
      grid[i] = [];
      for(var k = 0; k<settings.rows; k++) {
        grid[i][k] = 0;
      }
    }

    function getGridCell(x, y) {
      if(x < 0 ) x = 0;
      else if(x > frameWidth) x = frameWidth;

      if(y < 0) y = 0;
      else if(y > frameHeight) y = frameHeight;
      
      return {
        x: Math.floor(x / pixelSize),
        y: Math.floor(y / pixelSize)
      };
    }

    canvas.mousemove(function(event) {
      var x = event.pageX - canvas.offset().left;
      var y = event.pageY - canvas.offset().top;
      mouseX = x;
      mouseY = y;
    });

    var draw_type = 'none';
    canvas.mousedown(function(event) {
      var mouseType = event.which;
      
      if(mouseType === 3) {
        draw_type = 'erase';
      } else {
        draw_type = 'draw';
      }
    });
    canvas.mouseup(function(event) {
      draw_type = 'none';
    });    
    canvas.attr('oncontextmenu', 'return false');

    function render() {
      // Blank canvas
      context.clearRect(0, 0, frameWidth, frameHeight);
      context.strokeStyle = "#777";

      // Paint the grid
      for(var i = 0; i<settings.columns; i++) {
        for(var k = 0; k<settings.rows; k++) {
          if(grid[i][k] === 1) {
            context.fillRect(i*pixelSize, k*pixelSize, pixelSize, pixelSize);
          }
        }
      }

      // Draw outline
      var cell = getGridCell(mouseX, mouseY);
      context.strokeRect(pixelSize * cell.x, pixelSize * cell.y, pixelSize, pixelSize);

      if(draw_type === 'draw') {
        grid[cell.x][cell.y] = 1;
      }
      else if(draw_type === 'erase') {
        grid[cell.x][cell.y] = 0;
      }

    }

    function start() {
      requestAnimationFrame(start);
      render();
    }

    start();

  }

})(jQuery);