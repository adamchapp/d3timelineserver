/**
 * Created with JetBrains WebStorm.
 * User: adamchapp
 * Date: 14/05/2013
 * Time: 18:04
 * To change this template use File | Settings | File Templates.
 */

st.timeline = function() {

    //CONSTANTS
    const MONTH_AXIS = '.month';
    const YEAR_AXIS = '.year';

    var margin = {top: 30, right: 3, bottom: 50, left: 2}
        , width = 1800
        , height = 600
        , min_event_width = 10
        , date_format = d3.time.format("%Y-%m-%d %X")
        , axis_buffer = 50
        , row_height = 25
        , h_buffer = 5
        , row_padding = 2
        , x_scale = d3.time.scale()

    var dispatch = d3.dispatch('customHover');

    function chart(selection) {

        selection.each(function(data) {

            var bottom_line = height - margin.bottom - margin.top - axis_buffer
            , lanes = []
            , padded_row_height = row_height + row_padding
            , x_pos = function(date) { return x_scale(date_format.parse(date))}
            , x_width = function(d) { return x_pos(d.enddate) - x_pos(d.startdate)}
            , y_pos = function(d) { return bottom_line - (padded_row_height * getLane(0, d)) };

            //sort data
            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            //if data is new, map it to new positions
            var sortData = ( chart.data !== data ) ? true : false;

            if ( sortData ) {

                console.log('sorting the data');

                x_scale
                    .domain(d3.extent(data, function(d) { return date_format.parse(d.startdate)}))
                    .range([0, width - margin.left - margin.right]);

                data.map(function(item) {
                    item.start_pos = x_pos(item.startdate)
                    item.end_pos = x_pos(item.enddate);
                    item.y_pos = y_pos(item);
                })
            }

            var zoom = d3.behavior.zoom().x(x_scale).scaleExtent([1, 1000]).on("zoom", zoom)
                ,   x_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat(d3.time.format('%b')).ticks(10, 1).tickSize(6, 6)
                ,   sub_axis = d3.svg.axis().scale(x_scale).orient("bottom").ticks(2).tickFormat(d3.time.format('%Y'))
                ,   grid_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat("").tickSize(-height, 0, 0);

            chart.update = function() { chart(selection) };
            chart.container = this;
            chart.data = data;

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart (background, axes and grid lines)
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").classed("month axis", true);
            gEnter.append("g").classed("year axis", true);
            gEnter.append("g").classed("grid", true);

            // Update the outer dimensions.
            svg.attr("width", width)
                .attr("height", height)
                .call(zoom);

            // Update the inner dimensions.
            var g = svg.select("g")
                .attr("class", "background")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width - margin.left - margin.right )
                .attr("height", height - margin.top - margin.bottom);

            // Update the x-axis.
            var axis = g.select(".month")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom - 20) + ")")
                .call(x_axis);

            //draw the grid lines
            var grid = g.select(".grid")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom - 20 ) + ")")
                .call(grid_axis);

            var axis2 = g.select(".year")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom ) + ")")
                .call(sub_axis);

            var nodes = g.selectAll(".node").data(data);

            var text = nodes.select(".event");

            text.attr("y", function(d) { return d.y_pos });

            //enter selection
            var nodeEnter = nodes.enter().append("g").attr("class", "node");

            //new events
            nodeEnter.append('foreignObject')
                .attr("x", function(d) { return x_pos(d.startdate) })
                .attr("y", function(d, i) { return d.y_pos })
                .attr('class', 'event')
                .attr("width", function(d) { return x_width(d) })
                .attr("height", row_height)
                .attr("pointer-events", "none")
                .append('xhtml:div')
                .on("mouseover", dispatch.customHover)
                .html(function(d) { return d.title });

            //exit selection
            nodes.exit().remove();

            function zoom(e) {

                svg.select(".month").call(x_axis);
                svg.select(".year").call(sub_axis);
                svg.select(".grid").call(grid_axis);

                nodes.select(".event")
                    .attr("x", function(d) {
                        d.end_pos = x_pos(d.enddate);
                        d.start_pos = ( x_pos(d.startdate) < 0 && d.end_pos > 0 ) ? "0" : x_pos(d.startdate);
                        return d.start_pos;
                    })
                    .attr("y", function(d) { return d.y_pos })
                    .attr("width", function(d) { return d.end_pos - d.start_pos; })
            }

            function getLane(currentLane, event) {

                var end_pos = lanes[currentLane];

                if ( !end_pos ) {
                    lanes[currentLane] = event.end_pos;
                    return currentLane;
                }

                if ( ( end_pos + h_buffer ) > x_pos(event.startdate)) {
                    return getLane(++currentLane, event);
                }

                lanes[currentLane] = event.end_pos;

                return currentLane;
            };
        })
    }

    chart.width = function(_x) {
        if (!arguments.length) return width;
        width = parseInt(_x);
        return this;
    };
    chart.height = function(_x) {
        if (!arguments.length) return height;
        height = parseInt(_x);
        return this;
    };
    chart.gap = function(_x) {
        if (!arguments.length) return row_padding;
        row_padding = parseInt(_x);
        return this;
    };

    d3.rebind(chart, dispatch, 'on');

    return chart;
}


