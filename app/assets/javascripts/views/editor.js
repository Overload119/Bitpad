var animation_stack = [];

$(document).ready(function() {
  var width = $('#editor').parent().width();
  var height = $('#editor').parent().height();
  $('#editor').attr('width', width);
  $('#editor').attr('height', height);

  $('#editor').bitpad({
    columns: 30,
    rows: 30
  });

  $('#new').click(function() {
    var uri = $('#editor').bitpad('save');
    animation_stack.push(uri);
    $('.main_editor .prev img').attr('src', uri);
    $('#editor').bitpad('clear');
  });

  $('#copy').click(function() {
    var uri = $('#editor').bitpad('save');
    animation_stack.push(uri);
    $('.main_editor .prev img').attr('src', uri);
  });

  $('.preview_button').click(function() {
    $('.overlay').show();

    var c = 0;
    var animator = setInterval(function() {
      $('.overlay img').attr('src', animation_stack[c]);
      c++;
      if(c >= animation_stack.length) {
        c = 0;
      }
    }, 90);

    // Exit lightbox code
    $('.overlay').on('click', function(event) {
      $('.overlay').hide();
      if(animator) clearInterval(animator);
      $('.overlay').off(event);
    });


  });
});

$(window).resize(function() {
  var width = $('#editor').parent().width();
  var height = $('#editor').parent().height();
  $('#editor').attr('width', width);
  $('#editor').attr('height', height);
  $('#editor').bitpad('resize');
});

