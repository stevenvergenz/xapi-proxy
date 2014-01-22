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

app.post('/config', proxy.storeLRSInfo);
app.get('/config', proxy.verifyToken);
app.all('/xapi', proxy.forward);

// generic 404 handler
app.use(function(req,res){
	global.error('Nonexistent URL:', req.url);
	res.send(404);
});


http.createServer(app).listen(global.config.port);
global.log('Server listening on port', global.config.port);