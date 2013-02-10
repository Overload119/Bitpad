/*
  BitPad

  A BitPad is a canvas element that is setup for drawing pixelated images, where each row contains NUMPIXELS (can be changed) pixels.
  The images created can be loaded and saved via strings with a custom encoding.
  BitPads can also load any number of these images then loop through them, which creates an animation.

*/

// animationFrame polyfill Erik Möller @http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
var ZERO_KEY = 'abcdefghjiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function minifyZeroes(num) {
  if(typeof(num) !== 'number') return;
  var token = '';
  while( num !== 0 ) {
    remainder = num % ZERO_KEY.length;
    num = Math.floor(num / ZERO_KEY.length);
    token += ZERO_KEY.charAt(remainder);
  }
  return token;
}

function expandZeroes(token) {
  if(typeof(token) !== 'string') return;
  var count = 0;
  for(var i = 0; i < token.length; i++) {
    var k = token[i];
    var v = ZERO_KEY.indexOf(k);
    count += Math.pow(ZERO_KEY.length, i) * v;
  }
  return count;
}

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
  $.widget('ui.bitpad', {

    options: {
      rows: 12,
      columns: 12
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

        // Render on mouse move
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
        that._data.mouseX = -1;
        that._data.mouseY = -1;
      });

    },

    _init: function() {
      var canvas = this.element;
      var options = this.options;
      var context = canvas[0].getContext('2d');

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
      for(var i = 0; i<this.options.columns; i++) {
        this._data.grid[i] = [];
        for(var k = 0; k<this.options.rows; k++) {
          this._data.grid[i][k] = 0;
        }
      }
      // Restart rendering
      cancelAnimationFrame(this._data.animHandle);
      this._start();
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
    },

    save: function() {
      return this.element[0].toDataURL("image/png");
    },

    saveCode: function() {
      // The basic algorithm is as follows:
      //   Width and height in first 2 parts
      //   Numbers represent blocks of 1s
      //   Letters represent blocks of 0s
      var uncompressedData = JSON.stringify( this._data.grid );
      // console.log(uncompressedData);
      var compressedData = '';

      // Get the width and length
      var width = this._data.grid.length;
      var height = this._data.grid[0].length;

      compressedData = width + '=' + height + '=';

      var cleanData = uncompressedData.replace( /[^0-1]/g, '' );
      var scanIndex = 0;
      var scanLimit = cleanData.length;
      var scanCounter = 1;

      // console.log(cleanData);
      // Endless loop here since Javascript strings don't have the END character
      while(1) {
        var c = cleanData[ scanIndex ];
        if( scanIndex > 0 ) {
          var lc = cleanData[ scanIndex - 1 ];
          if( lc === c ) {
            // Continue block searching
            scanCounter++;
            if(scanIndex+1 === scanLimit) {
              if( c === '0' ) {
                compressedData += minifyZeroes(scanCounter);
                // console.log('Found ' + scanCounter + ' 0s');
              } else if( c === '1' ) {
                compressedData += scanCounter.toString();
                // console.log('Found ' + scanCounter + ' 1s');
              }
            }
          } else {
            if( lc === '0' ) {
              compressedData += minifyZeroes(scanCounter);
              // console.log('Found ' + scanCounter + ' 0s');
            } else if( lc === '1' ) {
              compressedData += scanCounter.toString();
              // console.log('Found ' + scanCounter + ' 1s');
            }
            // Reset the block counter

            scanCounter = 1;
          }
        }
        scanIndex++;
        if(scanIndex >= scanLimit) {
          break;
        }
      }

      // console.log(compressedData);
      return compressedData;
    },

    loadCode: function(loadCode) {
      this.clear();

      // Load the width and height
      var width, height;
      var dimensions = loadCode.match(/[0-9]+=[0-9]+=/);
      if(dimensions[0]) {
        try {
          dimensions = dimensions[0].split('=');
          width = parseInt( dimensions[0], 10 );
          height = parseInt( dimensions[1], 10 );
          // Remove dimensions from the code
          loadCode = loadCode.replace(/[0-9]+=[0-9]+=/g, '');
        } catch (e) {
          throw Error('BitPad: Could not find dimensions in load code');
        }
      } else {
        throw Error('BitPad: Could not find dimensions in load code');
      }

      // console.log('loadCode: ' + loadCode);
      // console.log('Width: ' + width);
      // console.log('Height: ' + height);

      // Read tokens
      var uncompressedData = '';
      // Endless loop here since Javascript strings don't have the END character
      while(loadCode) {
        var index = 0;
        var token = '';
        var c = loadCode[index];
        if(/[a-zA-Z]/.test(c)) {
          while(/[a-zA-Z]/.test(c)) {
            token += c;
            index++;
            if(loadCode[index]) {
              c = loadCode[index];
            } else {
              c = '';
            }
          }
          // console.log('Reading a 0 token: [' + token + ']');
          // Read the token now compute
          var zeroCount = expandZeroes(token);
          // console.log('Zero Count: ' + zeroCount);
          var expandedZeroes = '';
          for(var i = 0; i < zeroCount; i++) {
            expandedZeroes += '0';
          }
          uncompressedData += expandedZeroes;
          // console.log('adding' + expandedZeroes);
          loadCode = loadCode.substring(index);
        } else {
          while(/[0-9]/.test(c)) {
            token += c;
            index++;
            if(loadCode[index]) {
              c = loadCode[index];
            } else {
              c = '';
            }
          }
          // console.log('Reading a 1 token: [' + token + ']');
          // Read the token now compute
          var oneCount = parseInt(token, 10);
          var expandedOnes = '';
          for(var i = 0; i < oneCount; i++) {
            expandedOnes += '1';
          }
          uncompressedData += expandedOnes;
          loadCode = loadCode.substring(index);
        }
      }

      // console.log('Uncompressed Data, Size ' + uncompressedData.length);
      // console.log(uncompressedData);

      // Convert the 0-1 block into valid JSON
      var allRows = [];
      for(var i = 0; i < width; i++) {
        var row = uncompressedData.substring(0, height);
        // console.log(row);
        // Add the commas
        var jsonRow = '';
        for(var j = 0, m = row.length; j < m; j++) {
          if (j !== 0 && j !== m) {
            jsonRow += ',';
            jsonRow += row[j];
          } else {
            jsonRow += row[j];
          }
        }

        row = ['[', jsonRow, ']'].join('');
        // console.log(row);

        uncompressedData = uncompressedData.substring(height);
        allRows.push(row);
      }

      grid = JSON.parse('[' + allRows.join(',') + ']');
      // console.log(grid);

      this._data.grid = grid;
      this._start();


    }
  });
})(jQuery);