/**
 * User: nucleus
 * Date: 30/05/2013
 *
 */
d3.custom.timeline = function module() {

    const icon_buffer = 20
    ,     icon_width = 19
    ,     icon_height = 58
    ,     icon_path = 'img/pngs/icons_timeline/';

    var margin = {top: 0, right: 2, bottom: 50, left: 2},
        containerWidth = 1200,
        containerHeight = 600,
        date_format = d3.time.format("%Y-%m-%d %X"),
        gap = 15,
        bar_height = 35,

        filter_function = function(d) { return true; },
        clickHandler = function(d) {},
        mouseOverHandler = function(d) {},
        mouseOutHandler = function(d) {}

    var svg;

    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function(data) {

            var width = containerWidth - margin.left - margin.right,
                height = containerHeight - margin.top - margin.bottom;

            //create container and position
            if ( !svg ) {

                svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);

                svg.append("svg:rect")
                    .attr({
                        width: containerWidth,
                        height: containerHeight,
                        transform: "translate(0," + height + ")"
                    })
                    .classed("axisbackground", true);

                //set up sub groups
                var container = svg.append('g').classed('container-group', true);
                container.append("g").classed('grid', true);
                container.append('g').classed('month axis', true);
                container.append('g').classed('year axis', true);
                container.append('g').classed('chart-group', true);
            }

            var min = date_format.parse(data[0].startdate);
            var max = date_format.parse(data[data.length-1].enddate);

            var x_scale = d3.time.scale()
                                 .domain([min, max])
                                 .range([0, width]);

            var layout = d3.layouts.fitToText({
                x_scale : x_scale,
                date_format : date_format,
                h_buffer : gap
            })

            //sort and map data
            var lanes = [];

            if ( !data ) { data = exports.data; }

            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            exports.data = data;

            data = data.filter(filter_function);

            if ( exports.data !== data ) {

                //create dataprovider (including x and y pos)
                data.map(function(d) {
                    d.start_pos = layout.x_pos(d.startdate)
                    d.end_pos = layout.x_end_pos(d);
                    d.lane = layout.y_pos(0, d, lanes);
                })

            }

            svg
               .transition()
               .attr({width: containerWidth, height: containerHeight});

            var totalBarHeight = (bar_height + gap) * lanes.length;
            var allowedLanes = height/(bar_height + gap);

            //y-scale
            var y_scale = d3.scale.linear()
                                  .domain([0, allowedLanes])
                                  .range([height-(bar_height+gap), 0]);

            var zoom = d3.behavior.zoom().x(x_scale).scaleExtent([1, 1000]).on("zoom", zoom)
            ,   x_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat(d3.time.format('%b')).ticks(10, 1).tickSize(9, 6, 0).tickSubdivide(9)
            ,   sub_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(2).tickFormat(d3.time.format('%Y'))
            ,   grid_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat("").tickSize(-height, 0, 0);

            //AXES
            //----------

            svg.select('.month.axis')
                .transition()
                .attr({transform: 'translate(0,' + height + ')'})
                .call(x_axis);

            //draw the grid lines
            svg.select(".grid")
                .attr("transform", "translate(0," + height + ")")
                .call(grid_axis);

            svg.select(".year")
                .attr("transform", "translate(0," + (height + 20) + ")")
                .call(sub_axis);

            svg.select('.container-group')
                .attr({
                    transform: 'translate(' + margin.left + ',' + margin.top + ')',
                    width: width,
                    height: height
                })

            var bars = svg.select('.chart-group')
                .selectAll('.bar')
                .data(data);

            //BARS ENTER SELECTION
            //---------------

            var barEnter = bars.enter().append('g').classed('bar', true);

            //event
            barEnter.append('rect')
                .classed('event', true)
                .on("mouseover", function(d) { d3.select(this).classed("active", true) })
                .on("mouseout", function(d) { d3.select(this).classed("active", false) })

            //icon
            barEnter.append('image')
                    .classed('icon', true)

            //foreign object label
            barEnter.append('text')
                    .classed('label', true)

            //BARS UPDATE SELECTION
            //----------------

            bars.select('.event').transition()
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) + (icon_buffer/2) },
                    y: function(d) { return y_scale(d.lane) },
                    fill : function(d) { return d.color },
                    width: function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate); },
                    height: function(d) { return bar_height } //y_scale.rangeBand() }
                });

            bars.select('.icon').transition()
                .attr({
                    "xlink:href": function(d) { return icon_path + d.icon },
                    x: function(d) { return layout.x_pos(d.startdate) - (icon_buffer/2) },
                    y: function(d) { return y_scale(d.lane) },
                    width: function(d) { return icon_width; },
                    height: function(d) { return icon_height }  //y_scale.rangeBand() }
                });

            bars.select('.label').transition()
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) + (icon_buffer/2) },
                    y: function(d) { return y_scale(d.lane) },
                    dy: '1.2em',
                    dx: ".2em",
                    width: function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate); },
                    height: function(d) { return bar_height }, //y_scale.rangeBand() }
                    "pointer-events": "none"

                })
                .text(function(d) { return d.title });

            //BARS EXIT SELECTION
            //----------------

            bars.exit().remove();

            svg.call(zoom);

            function zoom(e) {

                svg.select(".month").call(x_axis);
                svg.select(".year").call(sub_axis);
                svg.select(".grid").call(grid_axis);

                bars.selectAll('.label')
                    .attr({
                        x : function(d) { return layout.x_pos(d.startdate) + (icon_buffer/2); },
                        width : function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate) }
                    })


                bars.selectAll('.event')
                    .attr({
                        x: function(d) { return layout.x_pos(d.startdate) + (icon_buffer/2); },
                        width : function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate) }
                    })

                bars.selectAll('.icon')
                    .attr("x", function(d) { return layout.x_pos(d.startdate) - (icon_buffer/2) })

            }
        })
    }

    exports.filter = function(_x) {
        if (!arguments.length) return filter_function;
        filter_function = _x;
        return this;
    }

    exports.row_height = function(_x) {
        if (!arguments.length) return bar_height;
        bar_height = parseFloat(_x);
        return this;
    }

    exports.width = function(_x ) {
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
        if (!arguments.length) return gap;
        gap = parseFloat(_x);
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