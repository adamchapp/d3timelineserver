st.timeline = function() {

    var margin = {top: 0, right: 2, bottom: 50, left: 2}
        , containerWidth = 1800
        , containerHeight = 600
        , date_format = d3.time.format("%Y-%m-%d %X")

        //the spacing between events
        , v_buffer = .1
        , h_buffer = 5

        //scales
        , x_scale = d3.time.scale()
        , y_scale = d3.scale.ordinal()

        //event handlers
        , clickHandler = function(d) { console.log('replace this with your own custom click handler') }
        , mouseOverHandler = function(d) { console.log('replace this with your own mouse over handler') }
        , mouseOutHandler = function(d)  { console.log('replace this with your own mouse out handler') }

    var dispatch = d3.dispatch('customHover');

    function chart(selection) {

        selection.each(function(data) {

            //sort by date order
            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            // Select the svg element, if it exists.
            var svg = d3.select(this)
                        .selectAll("svg")
                        .data([data])
                        .attr("width", containerWidth)
                        .attr("height", containerHeight)
                        .enter()
                        .append("svg");

            var width = containerWidth - margin.left - margin.right;
            var height = containerHeight - margin.top - margin.bottom;

            // Otherwise, create the skeletal chart (background, axes and grid lines)
            // nb the measure group is for invisible text and should be removed
            var gEnter = svg.append("g");
            gEnter.append("g").classed("measure", true)
            gEnter.append("g").classed("month axis", true);
            gEnter.append("g").classed("year axis", true);
            gEnter.append("g").classed("grid", true);
            gEnter.append("g").classed("nodes", true);

            var lanes = []
            , x_pos = function(date) { return x_scale(date_format.parse(date))}
            , x_width = function(d) { return x_pos(d.enddate) - x_pos(d.startdate)}

            //if data is new, map it to new positions
            var sortData = ( chart.data !== data ) ? true : false;

            if ( sortData ) {

                x_scale
                    .domain(d3.extent(data, function(d) { return date_format.parse(d.startdate)}))
                    .range([0, width]);

                data.map(function(d) {
                    d3.stringWidth(d.title, ".event-text");
                    d.start_pos = x_pos(d.startdate)
                    d.end_pos = x_pos(d.startdate) + d3.stringWidth(d.title, ".event-text");
                    d.lane = getLane(0, d);
                })

            }

            gEnter.select("measure").remove();

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

            svg.call(zoom);

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

            //enter selection - event background
            nodeEnter
                .append('rect')
                .attr("x", function(d) { return x_pos(d.startdate) })
                .attr("y", function(d) { return y_scale(d.lane) })
                .attr("width", function(d) { return d.end_pos - d.start_pos })
                .attr("height", function(d) { return y_scale.rangeBand() })
                .classed('event', true)

            //enter selection - event text
            nodeEnter
                .append('text')
                .attr("x", function(d) { return x_pos(d.startdate) })
                .attr("y", function(d) { return y_scale(d.lane) })
                .classed('event-text', true)
                .text(function(d) { return d.title });

            //add listeners
            nodeEnter.on("click", clickHandler)
                     .on("mouseover", mouseOverHandler)
                     .on("mouseout", mouseOutHandler);

            function zoom(e) {

                svg.select(".month").call(x_axis);
                svg.select(".year").call(sub_axis);
                svg.select(".grid").call(grid_axis);

                nodes.select(".event")
                    .attr("x", function(d) { return x_pos(d.startdate); })
                    .attr("width", function(d) { return d.end_pos - d.start_pos })

                nodes.select(".event-text")
                    .attr("x", function(d) { return x_pos(d.startdate); })
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

d3.stringWidth = function(string, aclass) {

    var svg = d3.select("svg");

    var text = svg.append("text")
        .attr('class', aclass)
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .text(string);

    return text.node().getComputedTextLength();
}


