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

    var margin = {top: 0, right: 2, bottom: 50, left: 2}
        , clickHandler = function(d) { console.log('replace this with your own custom click handler') }
        , mouseOverHandler = function(d) {
            div.transition().duration(200).style("opacity", .9);
            div.html(d.title + "<br/>"  + d.startdate).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        }
        , mouseOutHandler = function(d) { div.transition().duration(500).style("opacity", 0); }
        , containerWidth = 1800
        , containerHeight = 600
        , date_format = d3.time.format("%Y-%m-%d %X")
        , v_buffer = .1
        , h_buffer = 5
        , x_scale = d3.time.scale()
        , y_scale = d3.scale.ordinal()

    var dispatch = d3.dispatch('customHover');

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function chart(selection) {

        selection.each(function(data) {

            var width = containerWidth - margin.left - margin.right;
            var height = containerHeight - margin.top - margin.bottom;

            var lanes = []
            , x_pos = function(date) { return x_scale(date_format.parse(date))}
            , x_width = function(d) { return x_pos(d.enddate) - x_pos(d.startdate)}

            //sort data
            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            //if data is new, map it to new positions
            var sortData = ( chart.data !== data ) ? true : false;

            if ( sortData ) {

                x_scale
                    .domain(d3.extent(data, function(d) { return date_format.parse(d.startdate)}))
                    .range([0, width]);

                data.map(function(item) {
                    item.start_pos = x_pos(item.startdate)
                    item.end_pos = x_pos(item.enddate);
                    item.lane = getLane(0, item);
                })

            }

            // y-scale (inverted domain)
            // NB this should come after the data is mapped otherwise we don't know
            // the scale extents
            y_scale
                .domain(d3.range(lanes.length))
                .rangeRoundBands([height, 0], v_buffer);

            var zoom = d3.behavior.zoom().x(x_scale).scaleExtent([1, 1000]).on("zoom", zoom)
                ,   x_axis = d3.svg.axis().scale(x_scale).orient("bottom").tickFormat(d3.time.format('%b')).ticks(10, 1).tickSize(9, 6, 0).tickSubdivide(9)
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
            gEnter.append("g").classed("nodes", true);

            // Update the outer dimensions.
            svg.attr("width", containerWidth)
                .attr("height", containerHeight)
                .call(zoom);

            // Update the inner dimensions.
            var g = svg.select("g")
                .classed("background", true)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width)
                .attr("height", height);

            // Update the x-axis.
            var axis = g.select(".month")
                .attr("transform", "translate(0," + height + ")")
                .call(x_axis);

            //draw the grid lines
            var grid = g.select(".grid")
                .attr("transform", "translate(0," + height + ")")
                .call(grid_axis);

            var axis2 = g.select(".year")
                .attr("transform", "translate(0," + (height + 20) + ")")
                .call(sub_axis);

            //create selections
            var nodes = g.select(".nodes").selectAll(".node").data(data);
            var nodeEnter = nodes.enter().append("g").attr("class", "node");

            //exit selection
            nodes.exit().remove();

            //enter selection - long events
            nodeEnter
                .filter(function(d) { return d.enddate > d.startdate; })
                .append('rect')
                .attr("x", function(d) { return x_pos(d.startdate) })
                .attr("y", function(d) { return y_scale(d.lane) })
                .attr("width", function(d) { return x_width(d) })
                .attr("height", function(d) { return y_scale.rangeBand() })
                .classed('long-event', true)

//                .attr("pointer-events", "none");

            //enter selection - short events
            nodeEnter
                .filter(function(d) { return d.enddate === d.startdate; })
                .append("circle")
                .attr("cx", function(d) { return x_pos(d.startdate) })
                .attr("cy", function(d) { return y_scale(d.lane) })
                .attr("r", function(d) { return y_scale.rangeBand() / 2 })
                .classed('short-event', true);

            nodeEnter.on("click", clickHandler)
                     .on("mouseover", mouseOverHandler)
                     .on("mouseout", mouseOutHandler);

            function zoom(e) {

                svg.select(".month").call(x_axis);
                svg.select(".year").call(sub_axis);
                svg.select(".grid").call(grid_axis);

                nodes.select(".long-event")
                    .attr("x", function(d) { return x_pos(d.startdate); })
                    .attr("width", function(d) { return x_width(d); })

                nodes.select(".short-event")
                    .attr("cx", function(d) { return x_pos(d.startdate); })
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
        if (!arguments.length) return containerWidth;
        containerWidth = parseInt(_x);
        return this;
    };
    chart.height = function(_x) {
        if (!arguments.length) return containerHeight;
        containerHeight = parseInt(_x);
        return this;
    };
    chart.gap = function(_x) {
        if (!arguments.length) return v_buffer;
        v_buffer = _x;
        return this;
    };
    chart.click = function(_x) {
        if (!arguments.length) return clickHandler;
        clickHandler = _x;
        return this;
    }
    chart.mouseover = function(_x) {
        if (!arguments.length) return mouseOverHandler;
        mouseOverHandler = _x;
        return this;
    }
    chart.mouseout = function(_x) {
        if (!arguments.length) return mouseOutHandler;
        mouseOutHandler = _x;
        return this;
    }

    d3.rebind(chart, dispatch, 'on');

    return chart;
}


