/**
 * User: nucleus
 * Date: 30/05/2013
 *
 */

d3.utils = {};

d3.utils.ruler = function(attributes) {

    var date_format = attributes.date_format;
    var x_scale = attributes.x_scale;
    var h_buffer = attributes.h_buffer || 15;

    function x_pos(date) {
        return x_scale(date_format.parse(date));
    }

    function stringWidth(string, aclass) {

        var svg = d3.select("svg");

        var text = svg.append("text")
            .attr('class', aclass)
            .attr("x", 0)
            .attr("y", 0)
            .style("opacity", 0)
            .text(string);

        var length = text.node().getComputedTextLength();

        //nb make sure to remove the measured text item
        text.remove();

        return length;
    }

    function y_pos(currentLane, event, lanes) {

        var end_pos = lanes[currentLane];

        if ( !end_pos ) {
            lanes[currentLane] = event.end_pos;
            return currentLane;
        }

        if ( ( end_pos + h_buffer ) > x_pos(event.startdate)) {
            return y_pos(++currentLane, event, lanes);
        }

        lanes[currentLane] = event.end_pos;

        return currentLane;
    }

    return {
        x_pos : x_pos,
        y_pos : y_pos,
        stringWidth : stringWidth
    }
}