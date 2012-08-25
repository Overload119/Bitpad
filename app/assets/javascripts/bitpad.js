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

(function($, undefined) {
  var NUMPIXELS = 12;

  $.widget('ui.bitpad', {

    options: {
      rows: NUMPIXELS,
      columns: NUMPIXELS
    },

    _data: {
      drawType: 0,
      mouseX: 0,
      mouseY: 0,
      grid: undefined,
      pixelSize: 0
    },

    _getGridCell: function(x, y) {
      var gridX = Math.floor(x / this._data.pixelSize);
      var gridY = Math.floor(y / this._data.pixelSize);

      if( gridX >= this._data.grid.length || gridY >= this._data.grid[0].length) {
        return false;
      }

      return {
        x: gridX,
        y: gridY
      };
    },

    _bindEvents: function() {
      var canvas = this.element;
      var that = this;

      canvas.mousemove(function(event) {
        var x = event.pageX - canvas.offset().left;
        var y = event.pageY - canvas.offset().top;
        that._data.mouseX = x;
        that._data.mouseY = y;
      });

      canvas.mousedown(function(event) {
        var mouseType = event.which;          
        if(mouseType === 3) {
          that._data.drawType = 'erase';
        } else {
          that._data.drawType = 'draw';
        }
      });

      canvas.mouseup(function(event) {
        that._data.drawType = 'none';
      });

      canvas.mouseleave(function(event) {
        that._data.drawType = 'none';
      });
  
    },

    _start: function() {
      var canvas = this.element;
      var context = canvas[0].getContext('2d');
      var grid = this._data.grid;

      var frameWidth  = this._data.frameWidth,
          frameHeight = this._data.frameHeight,
          columns     = this.options.columns,
          rows        = this.options.rows,
          pixelSize   = this._data.pixelSize,
          data        = this._data,
          that        = this;


      var render = function() {
        // Blank canvas
        context.fillStyle = "#fff";
        context.fillRect(0, 0, frameWidth, frameHeight);
        context.fillStyle = "#222";
        context.strokeStyle = "#777";

        // Paint the grid
        for(var i = 0; i < columns; i++) {
          for(var k = 0; k < rows; k++) {
            if(grid[i][k] === 1) {
              context.fillRect(i*pixelSize, k*pixelSize, pixelSize, pixelSize);
            }
          }
        }

        // Draw grid outline and paint
        var cell = that._getGridCell(data.mouseX, data.mouseY);
        if(cell) {
          context.strokeRect(pixelSize * cell.x, pixelSize * cell.y, pixelSize, pixelSize);

          if(data.drawType === 'draw') {
            grid[cell.x][cell.y] = 1;
          }
          else if(data.drawType === 'erase') {
            grid[cell.x][cell.y] = 0;
          }
        }
      }

      var that = this;
      this._data.start = function() {
        that._data.animHandle = requestAnimationFrame(that._data.start);
        render();
      }
      this._data.start();

    },

    clear: function() {
      this._data.grid = [];
      for(var i = 0; i<options.columns; i++) {
        this._data.grid[i] = [];
        for(var k = 0; k<options.rows; k++) {
          this._data.grid[i][k] = 0;
        }
      }
    },

    resize: function() {
      var canvas = this.element;
      var options = this.options;
      var context = canvas[0].getContext('2d');
      var frameWidth = canvas.attr('width'),
          frameHeight = canvas.attr('height');

      // Adjust the size of the canvas to fit all pixels
      if(frameWidth < frameHeight) {
        var pixelSize = this._data.pixelSize = Math.floor(frameWidth / options.columns);
      } else {
        var pixelSize = this._data.pixelSize = Math.floor(frameHeight / options.rows);
      }

      this._data.frameWidth = frameWidth = pixelSize * options.columns;
      this._data.frameHeight = frameHeight = pixelSize * options.rows;
      canvas.attr('width', frameWidth);
      canvas.attr('height', frameHeight);

      // Restart rendering
      cancelAnimationFrame(this._data.animHandle);
      this._start();
    },

    _create: function() {
      var canvas = this.element;
      var options = this.options;
      var context = canvas[0].getContext('2d');

      canvas.attr('oncontextmenu', 'return false');

      // Sets up the pixel grid
      this._data.grid = [];
      for(var i = 0; i<options.columns; i++) {
        this._data.grid[i] = [];
        for(var k = 0; k<options.rows; k++) {
          this._data.grid[i][k] = 0;
        }
      }

      this.resize();
      this._bindEvents();
      this._start();
    },

    save: function() {
      return this.element[0].toDataURL("image/png");
    }
  });
})(jQuery);