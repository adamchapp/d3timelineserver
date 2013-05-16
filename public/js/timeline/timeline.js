/**
 * Created with JetBrains WebStorm.
 * User: adamchapp
 * Date: 14/05/2013
 * Time: 18:04
 * To change this template use File | Settings | File Templates.
 */

st.timeline = function() {

    var margin = {top: 30, right: 20, bottom: 50, left: 20}
        , width = 1800
        , height = 600
        , date_format = d3.time.format("%Y-%m-%d %X")
        , axis_buffer = 30
        , row_height = 25
        , h_buffer = 5
        , row_padding = 10

    function chart(selection) {

        selection.each(function(data) {

            //sort data
            data = data.sort(function(a, b){ return d3.ascending(a.startdate, b.startdate); })

            var minDate = date_format.parse(data[0].startdate);
            var maxDate = date_format.parse(data[data.length-1].startdate);

            //set up scale
            var x_scale = d3.time.scale()
                                 .domain([minDate,maxDate])
                                 .range([0, width-margin.left-margin.right]);

            var lanes = []
            ,   x_pos = function(date) { return x_scale(date_format.parse(date))}
            ,   x_width = function(d) { return x_pos(d.enddate) - x_pos(d.startdate)}
            ,   y_pos = function(d) { return height - margin.top - margin.bottom - axis_buffer - (( row_height + row_padding ) * getLane(0, d)) }
            ,   xAxis = d3.svg.axis().scale(x_scale).orient("bottom");//.tickSize(6, 0);


            //create dataprovider containing item positions
            //the lane property is used to get the y position
            data.map(function(item) {
                item.start_pos = x_pos(item.startdate)
                item.end_pos = x_pos(item.enddate);
                item.y_pos = y_pos(item);
            })

            chart.update = function() { chart(selection) };
            chart.container = this;

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "x axis");

            // Update the outer dimensions.
            svg.attr("width", width)
               .attr("height", height);

            // Update the inner dimensions.
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Update the x-axis.
            var axis = g.select(".x.axis")
                        .attr("transform", "translate(0," + (height-margin.bottom-margin.top) + ")")

            axis.call(xAxis);

            var nodes = g.selectAll(".node").data(data);

            //update selection
            nodes.transition()
                .duration(1400)
                .attr("x", function(d) { return x_pos(d.startdate) })
                .attr("y", function(d, i) { return d.y_pos })
                .attr("width", function(d) { return x_width(d) })

            //enter selection
            var nodeEnter = nodes.enter().append("g").attr("class", "node");

            nodeEnter.append("rect")
                     .attr("x", function(d) { return x_pos(d.startdate) })
                     .attr("y", function(d, i) { return d.y_pos })
                     .attr("width", function(d) { return x_width(d) })
                     .attr("height", 10);

            nodeEnter.append("text")
                     .attr("x", function(d) { return x_pos(d.startdate) })
                     .attr("y", function(d, i) { return d.y_pos })
                     .text(function(d) { return d.title });



            //exit selection
            nodes.exit().remove();

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

    return chart;
}


