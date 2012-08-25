$(document).ready(function() {
  var width = $('#editor').parent().width();
  var height = $('#editor').parent().height();
  $('#editor').attr('width', width);
  $('#editor').attr('height', height);

  $('#editor').bitpad({
    columns: 12,
    rows: 4
  });
});