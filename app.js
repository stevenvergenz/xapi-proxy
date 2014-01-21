var http = require('http'),
	https = require('https'),
    express = require('express'),
    global = require('./global.js'),
	proxy = require('./proxy.js');

var app = express();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret:global.config.cookie_secret}));
app.use(global.log_request);

app.post('/config', proxy.storeLRSInfo);
app.get('/config', proxy.verifyToken);
app.all('/xapi', proxy.forward);

// generic 404 handler
app.use(function(req,res){
	global.error('File not found:', req.url);
	res.send(404);
});

http.createServer(app).listen(global.config.port);
global.log('Server listening on port', global.config.port);