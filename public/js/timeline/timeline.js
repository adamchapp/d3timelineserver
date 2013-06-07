/**
 * User: nucleus
 * Date: 07/06/2013
 *
 */
sp.timeline = function(div, data) {

    this.data = data;
    this.div = div;

    var timeline = d3.custom.timeline()

    draw();

    function filter(string) {

        var string_array = string.split(",");

        timeline.filter(function(d) {

            var returnValue = false;

            string_array.forEach(function(item) {
                if (d.title.toLocaleLowerCase().indexOf(item.toLowerCase()) !== -1 ) {
                    returnValue = true;
                }
            })

            return returnValue;
        })

        draw();
    }

    function color_filter(string) {
        timeline.filter(function(d) { return d.color.toLowerCase() === string.toLowerCase() })
        draw();
    }

    function setRowHeight(height) {
        timeline.row_height(height);
        draw();
    }

    function draw() {
        d3.select(div)
            .datum(data)
            .call(timeline);
    }

    return {
        filter : filter,
        color_filter : color_filter,
        setRowHeight : setRowHeight
    };
}