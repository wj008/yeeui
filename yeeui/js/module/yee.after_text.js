Yee.extend(':input', 'after_text', function (elem, setting) {
    $('<span></span>').html(setting.text).insertAfter(elem);
});