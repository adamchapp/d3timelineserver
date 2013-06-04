/**
 * User: nucleus
 * Date: 30/05/2013
 *
 */

d3.layouts.fixedWidth = function(attributes) {
    var date_format = attributes.date_format;
    var x_scale = attributes.x_scale;
    var h_buffer = attributes.h_buffer || 15;

    var layout = {};
    layout.__proto__ = d3.layouts.baseLayout(attributes);

    layout.x_end_pos = function x_end_pos(d) {
        return layout.x_pos(d.startdate) + 100;
    }

    return layout;
}