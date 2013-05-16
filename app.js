var express = require('express')
  , routes = require('./routes/index')
  , user = require('./routes/user')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static('public', __dirname + 'public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/User/Login/:username/:password', user.login);
app.get('/Timeline/:id', routes.timeline);  //if this doesn't work try using OPTIONS instead of GET

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
