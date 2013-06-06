/**
 * User: nucleus
 * Date: 04/06/2013
 *
 */

d3.layouts.baseLayout = function(attributes) {

    const h_buffer = 25;

    var date_format = attributes.date_format;
    var x_scale = attributes.x_scale;

    function x_pos(date) {
        return x_scale(date_format.parse(date));
    }

    function stringWidth(string, aclass) {

        var svg = d3.select("svg");

        var text = svg.append("text")
                .classed(aclass,true)
                .attr("x", 0)
                .attr("y", 0)
                .style('font-size', 18)
                .style("opacity", 0)
                .text(string);

        var length = text.node().getComputedTextLength();

        //nb make sure to remove the measured text item
        text.remove();

        return length;
    }

    return {
        stringWidth : stringWidth,
        x_pos : x_pos
    }
}