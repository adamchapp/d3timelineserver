/**
 * User: nucleus
 * Date: 30/05/2013
 *
 */
d3.custom.timeline = function module() {

    const h_buffer = 15;

    var margin = {top: 0, right: 2, bottom: 50, left: 2},
        containerWidth = 1200,
        containerHeight = 600,
        date_format = d3.time.format("%Y-%m-%d %X"),
        gap = 5,
        bar_height = 25,

        clickHandler = function(d) {},
        mouseOverHandler = function(d) {},
        mouseOutHandler = function(d) {}

    var svg;

    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function(data) {

            console.log('bar height is ' + bar_height);

            var width = containerWidth - margin.left - margin.right,
                height = containerHeight - margin.top - margin.bottom;

            //create container and position
            if ( !svg ) {

                svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);

                var gradient = svg.append("svg:defs")
                                  .append("svg:linearGradient")
                                  .attr({
                                      id: "gradient",
                                      x1: "0%",
                                      y1: "0%",
                                      x2: "100%",
                                      y2: "100%",
                                      spreadMethod: "pad"
                                  })

                gradient.append("svg:stop").attr({
                    offset: "0%",
                    "stop-color": "#FFF",
                    "stop-opacity": 1
                });
                gradient.append("svg:stop").attr({
                    offset : "100%",
                    "stop-color": "#666",
                    "stop-opacity": 1
                });

                svg.append("svg:rect")
                    .attr({
                        width: containerWidth,
                        height: height
                    })
                    .style("fill", "url(#gradient)");

                svg.append("svg:rect")
                    .attr({
                        width: containerWidth,
                        height: containerHeight,
                        transform: "translate(0," + height + ")"
                    })
                    .style("fill", "url(#gradient)");

                //set up sub groups
                var container = svg.append('g').classed('container-group', true);
                container.append("g").classed('grid', true);
                container.append('g').classed('month axis', true);
                container.append('g').classed('year axis', true);
                container.append('g').classed('chart-group', true);
            }

            var x_scale = d3.time.scale()
                                 .domain(d3.extent(data, function(d) { return date_format.parse(d.startdate)}))
                                 .range([0, width]);

            var layout = d3.layouts.fitToText({
                x_scale : x_scale,
                date_format : date_format,
                h_buffer : gap
            })

            //sort and map data
            var lanes = [];

            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            //create dataprovider (including x and y pos)
            data.map(function(d) {
                d.start_pos = layout.x_pos(d.startdate)
                d.end_pos = layout.x_end_pos(d);
                d.lane = layout.y_pos(0, d, lanes);
            })

            svg
               .transition()
               .attr({width: containerWidth, height: containerHeight});

            console.log('height is ' + height);

            var totalBarHeight = (bar_height + gap) * lanes.length;
            var allowedLanes = height/bar_height;

            //y-scale
            var y_scale = d3.scale.linear()
                                  .domain([0, allowedLanes])
                                  .range([height-bar_height, 0]);

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
                .data(data)

            //BARS ENTER SELECTION
            //---------------

            var barEnter = bars.enter().append('g').classed('bar', true);

            //event
            barEnter.append('rect')
                .classed('event', true)
                .on("mouseover", function(d) {
                    d3.select(this).classed("active", true)
                })
                .on("mouseout", function(d) {
                    d3.select(this).classed("active", false)
                })
                .transition().style({opacity: 1})
                .attr({
                   x: function(d) { return layout.x_pos(d.startdate) },
                   y: function(d) { return y_scale(d.lane) },
                   width: function(d) { return d.end_pos - d.start_pos; },
                   height: function(d) { return bar_height - gap }  //y_scale.rangeBand() }
                })

            //icon
            barEnter.append('rect')
                .classed('icon', true)
                .transition().style({opacity : 1})
                .attr({
                    dx: "1.2em",
                    x: function(d) { return layout.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) + ((bar_height/2)-gap) },
                    width: function(d) { return 5; },
                    height: function(d) { return 5 }  //y_scale.rangeBand() }
                })

            //foreign object label
            barEnter.append('foreignObject')
                .classed('label', true)
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) },
                    width: function(d) { return d.end_pos - d.start_pos; },
                    height: function(d) { return bar_height }, //y_scale.rangeBand() }
                    "pointer-events": "none"
                })
                .append('xhtml:div')
                .attr("pointer-events", "none")
                .html(function(d) { return d.title })

//            //svg text label
//            barEnter.append('text')
//                .classed('label', true)
//                .text(function(d) { return d.title })
//                .transition().style({opacity: 1})
//                .attr({
//                    x: function(d) { return layout.x_pos(d.startdate) },
//                    y: function(d) { return y_scale(d.lane) + (bar_height/2) },
//                    dy: '1.2em',
//                    dx: "1em",
//                    width: function(d) { return d.end_pos - d.start_pos; },
//                    height: function(d) { return bar_height }, //y_scale.rangeBand() }
//                    "pointer-events": "none"
//                })

            //BARS UPDATE SELECTION
            //----------------

            bars.selectAll('.event').transition()
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) },
                    width: function(d) { return d.end_pos - d.start_pos; },
                    height: function(d) { return bar_height - gap } //y_scale.rangeBand() }
                });

            bars.selectAll('.icon').transition()
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) + ((bar_height/2)-gap) },
                    width: function(d) { return 5; },
                    height: function(d) { return 5 }  //y_scale.rangeBand() }
                });

            bars.selectAll('.label').transition()
                .attr({
                    x: function(d) { return layout.x_pos(d.startdate) },
                    y: function(d) { return y_scale(d.lane) },
                    dy: '1.2em',
                    dx: "1em",
                    width: function(d) { return d.end_pos - d.start_pos; },
                    height: function(d) { return bar_height }, //y_scale.rangeBand() }
                    "pointer-events": "none"
                });

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
                        x : function(d) { return layout.x_pos(d.startdate); },
                        width : function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate) }
                    })


                bars.selectAll('.event')
                    .attr({
                        x: function(d) { return layout.x_pos(d.startdate); },
                        width : function(d) { return layout.x_end_pos(d) - layout.x_pos(d.startdate) }
                    })

                bars.selectAll('.icon')
                    .attr("x", function(d) { return layout.x_pos(d.startdate); })

            }
        })
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
        if (!arguments.length) return v_buffer;
        v_buffer = parseFloat(_x);
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