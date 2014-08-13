// jQuery plugin to load templates
$.fn.loadWidget = function(template, context) {
    var target = this;
    var getData = {
        template: template,
        context: context
    }
    $.get("/load_widget", {data: JSON.stringify(getData)}, function(data) {
        target.empty().append(data);
    });
}
