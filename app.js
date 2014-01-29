var http = require('http'),
	https = require('https'),
    express = require('express'),
    global = require('./global.js'),
	proxy = require('./proxy.js');

global.parseConfig();

var app = express();
app.use(express.json());
app.use(express.cookieParser());
app.use(global.log_request);

// add CORS support
app.use(function(req,res,next){
	res.set({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
		'Access-Control-Allow-Headers': 'Content-Type'
	});
	next();
});

app.post('/config', proxy.storeLRSInfo);
app.get('/config', proxy.verifyToken);

app.all('/xapi/*', proxy.proxy);

// generic 404 handler
app.use(function(req,res){
	global.error('Nonexistent resource:', req.url);
	res.send(404);
});


http.createServer(app).listen(global.config.port);
global.log('Server listening on port', global.config.port);