/**
 * Created with JetBrains WebStorm.
 * User: adamchapp
 * Date: 16/05/2013
 * Time: 19:55
 * To change this template use File | Settings | File Templates.
 */

var static = require('node-static');
var fileServer = new static.Server('./public');

exports.index = function(req, res) {
    var html =
}