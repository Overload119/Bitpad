var DEFAULTSIZE = 245;
var lastRows = 10, lastColumns = 12;

$(document).ready(function() {

  var width = $('#bitpad').parent().width(DEFAULTSIZE+'px');
  var height = $('#bitpad').parent().height(DEFAULTSIZE+'px');
  $('#bitpad').attr('width', DEFAULTSIZE);
  $('#bitpad').attr('height', DEFAULTSIZE);

  $('#bitpad').bitpad({
    columns: 12,
    rows: 10
  });

  // Check for load
  if(window.location.search) {
    var s = window.location.search.replace('?', '');
    s = s.split('=');
    if(s[0] === 'load') {
      $('#bitpad').bitpad('loadCode', s[1]);
    }
  }

  $('#scale, #col, #row').keypress(function(evt) {
    if(evt.keyCode === 13) {
      $('#update').click();
    }
  });

  $('#save').click(function() {
    var code = $('#bitpad').bitpad('saveCode');
    var otherCode = $('#bitpad').bitpad('save');

    var percent = code.length/otherCode.length*100;

    var t = 'Your BitPad save code:\n\n';
    t += code;
    t += '\n\n';
    t += 'BitPad size: ' + code.length + '\n';
    t += 'Image file size: ' + otherCode.length;
    t += '\n\nBitPad saved ' + (otherCode.length - code.length) + ' bytes, a compression of ' + parseFloat(100-percent, 2) + '%.';

    $('.save_code').val(t);
    $('.save_code').hide().fadeIn(500);
  });

  $('#load').click(function() {
    var loadCode = prompt('Enter a load code');
    $('#bitpad').bitpad('loadCode', loadCode);
  });

  $('#update').click(function() {
    var scale = $('#scale').val();
    var columns = $('#col').val();
    var rows = $('#row').val();

    try {
      scale = parseFloat(scale, 10);
      if(scale > 3 || scale < 0.1) {
        scale = 1;
        $('#scale').val('1');
      }
    }
    catch(e) {
      scale = 1.0
      $('#scale').val('1.0');
    }

    var width = parseInt(DEFAULTSIZE*scale, 10);
    var height = parseInt(DEFAULTSIZE*scale, 10);

    try {
      rows = parseInt(rows, 10);
      columns = parseInt(columns, 10);
      if(rows>100 || columns>100) {
        rows = 10;
        columns = 10;
        $('#rows').val('10');
        $('#col').val('12');
      }
    }
    catch(e) {
      rows = 10;
      columns = 10;
      $('#rows').val('10');
      $('#col').val('12');
    }

    if(rows != lastRows || columns != lastColumns) {
      // Only call this if rows or columns changed
      $('#bitpad').bitpad({
        rows: rows,
        columns: columns
      });
    }

    $('#bitpad').attr('width', width);
    $('#bitpad').attr('height', height);
    $('#bitpad').bitpad('resize');

    lastRows = rows;
    lastColumns = columns;
  });

});

$(window).resize(function() {
  var width = $('#bitpad').parent().width();
  var height = $('#bitpad').parent().height();
  $('#bitpad').attr('width', width);
  $('#bitpad').attr('height', height);
  $('#bitpad').bitpad('resize');
});