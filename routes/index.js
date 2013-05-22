var fs = require('fs');
var static = require('node-static');
var fileServer = new static.Server('./public')

exports.index = function(req, res) {
    fileServer.serveFile('/index.html', 200, {}, req, res);
}

//TODO
exports.timeline = function(req, res) {

    fs.readFile( 'public/data/timeline.json', function (err, data) {
        if (err) { throw err; }
        res.json(JSON.parse(data));
    });
}