/**
 * User: nucleus
 * Date: 30/05/2013
 *
 */

d3.custom = {};

d3.custom.timeline = function module() {

    const h_buffer = 15;

    var margin = {top: 0, right: 2, bottom: 50, left: 2},
        containerWidth = 1200,
        containerHeight = 600,
        date_format = d3.time.format("%Y-%m-%d %X"),
        gap = .1,

        clickHandler = function(d) {},
        mouseOverHandler = function(d) {},
        mouseOutHandler = function(d) {}

    var svg;

    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function(data) {

            //create container and position
            if ( !svg ) {

                svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);

                var container = svg.append('g').classed('container-group', true);
                container.append('g').classed('chart-group', true);
                container.append("g").classed('grid', true);
                container.append('g').classed('month axis', true);
                container.append('g').classed('year axis', true);

            }

            var width = containerWidth - margin.left - margin.right,
                height = containerHeight - margin.top - margin.bottom;

            var x_scale = d3.time.scale()
                                 .domain(d3.extent(data, function(d) { return date_format.parse(d.startdate)}))
                                 .range([0, width]);

            var ruler = d3.utils.ruler({
                x_scale : x_scale,
                date_format : date_format,
                h_buffer : gap
            })

            //sort and map data
            var lanes = [];

            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            //create dataprovider (including x and y pos)
            data.map(function(d) {
                d.start_pos = ruler.x_pos(d.startdate)
                d.end_pos = ruler.x_pos(d.startdate) + ruler.stringWidth(d.title, ".event-text");
                d.lane = ruler.y_pos(0, d, lanes);
            })

            svg
               .transition()
               .attr({width: containerWidth, height: containerHeight});

            //y-scale
            var y_scale = d3.scale.ordinal()
                                  .domain(d3.range(lanes.length))
                                  .rangeRoundBands([height, 0], gap);

            var zoom = d3.behavior.zoom().x(x_scale).scaleExtent([1, 1000]).on("zoom", zoom)
                ,   x_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat(d3.time.format('%b')).ticks(10, 1).tickSize(9, 6, 0).tickSubdivide(9)
                ,   sub_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(2).tickFormat(d3.time.format('%Y'))
                ,   grid_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat("").tickSize(-height, 0, 0);

            svg.select('.container-group')
                .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')',
                    width: width,
                    height: height})

            svg.select('.month.axis')
                .transition()
                .attr({transform: 'translate(0,' + height + ')'})
                .call(x_axis);

            svg.call(zoom);

            var bars = svg.select('.chart-group')
                .selectAll('.bar')
                .data(data);

            //enter selection
            bars.enter().append('rect')
                .classed('bar', true)
                .on('mouseover', dispatch.customHover)
                .transition().style({opacity: 1})
                .attr({
                   x: function(d) { return ruler.x_pos(d.startdate) },
                   y: function(d) { return y_scale(d.lane) },
                   width: function(d) { return d.end_pos - d.start_pos; },
                   height: function(d) { return y_scale.rangeBand() }
                })

            //update selection
            bars.transition()
                .attr({
                    x: function(d) { return ruler.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) },
                    width: function(d) { return d.end_pos - d.start_pos; },
                    height: function(d) { return y_scale.rangeBand() }
                });

            //exit selection
            bars.exit().remove();

            function zoom(e) {

                svg.select(".month").call(x_axis);
                svg.select(".year").call(sub_axis);
                svg.select(".grid").call(grid_axis);

                bars
                    .attr("x", function(d) { return ruler.x_pos(d.startdate); })
                    .attr("width", function(d) { return d.end_pos - d.start_pos })

                nodes.select(".event-text")
                    .attr("x", function(d) { return x_pos(d.startdate); })
            }
        })
    }

    exports.width = function(_x) {
        if (!arguments.length) return containerWidth;
        containerWidth = parseInt(_x);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) return containerHeight;
        containerHeight = parseInt(_x);
        return this;
    };
    exports.gap = function(_x) {
        if (!arguments.length) return v_buffer;
        v_buffer = _x;
        return this;
    };
    exports.click = function(_x) {
        if (!arguments.length) return clickHandler;
        clickHandler = _x;
        return this;
    }
    exports.mouseover = function(_x) {
        if (!arguments.length) return mouseOverHandler;
        mouseOverHandler = _x;
        return this;
    }
    exports.mouseout = function(_x) {
        if (!arguments.length) return mouseOutHandler;
        mouseOutHandler = _x;
        return this;
    }

    return exports;
}