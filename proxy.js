/**
 * Created by svergenz on 1/21/14.
 */
var crypto = require('crypto'),
	liburl = require('url'),
	async = require('async'),
	request = require('request'),
	global = require('./global.js');

var sessionInfo = {};

// garbage collect expired info every hour
setInterval(function(){
	for(var i in sessionInfo){
		if( sessionInfo[i].expires < Date.now() ){
			global.log('Expiring token', i);
			delete sessionInfo[i];
		}
	}
}, 3600000);

// store LRS info in session, and return session token
exports.storeLRSInfo = function(req,res,next)
{
	// verify/sanitize LRS information
	var info = req.body;
	if( req.header('content-type') != 'application/json' ||
		!(info && info.endpoint && info.user && info.password && info.actor) ){
		global.info('400 Sparse info block');
		res.send(400, "Info block must contain the keys 'endpoint', 'user', 'password', and 'actor'.");
		return;
	}
	else {
		info = {
			'endpoint': liburl.parse(info.endpoint),
			'user': info.user,
			'password': info.password,
			'actor': info.actor,
			'expires': Date.now() + 24*60*60*1000
		};
		if( !info.endpoint.protocol || !info.endpoint.host ){
			global.info('400 Invalid endpoint');
			res.send(400, 'LRS endpoint is not a URL.');
			return;
		}
	}

	// generate random key
	var newKey = '';
	async.doUntil(
		// generate a new key
		function(cb){
			crypto.pseudoRandomBytes(12, function(err,buf){
				newKey = buf.toString('base64');
				cb(err);
			});
		},

		// make sure there are no collisions before setting data
		function(){ return !sessionInfo[newKey]; },

		function(err){
			if(err){
				global.info('500 Could not generate new random key');
				res.send(500,'Could not generate new random key');
				return;
			}

			sessionInfo[newKey] = info;
			global.info('Saving credentials for new key', newKey);

			// return info token
			res.send(200, newKey);
		}
	);
};

// return whether or not the token is valid, and if it is, also return its expiration date
exports.verifyToken = function(req,res,next)
{
	// token is valid iff "lpt" query arg present and that value in the lookup table
	var url = liburl.parse(req.url, true);
	if( url.query.lpt && sessionInfo[url.query.lpt] )
	{
		var info = sessionInfo[url.query.lpt];
		global.info('Serving data for token', url.query.lpt);
		res.json({
			'actor': info.actor,
			'expires': (new Date(info.expires)).toISOString()
		});
	}
	else {
		global.info('404 Token does not exist');
		res.send(404, 'Token does not exist or was not specified.');
	}
};

// look up LRS info and pass request there
exports.proxy = function(req,res,next)
{
	var url = liburl.parse(req.url, true);
	if( !url.query.lpt || !sessionInfo[url.query.lpt] ){
		global.info('401 No Token, No Auth, No Proxy');
		res.send(401, 'Token Required');
		return;
	}

	// build new endpoint
	var apis = /(statements|activities|activities\/state|activities\/profile|agents|agents\/profile|about)$/;
	var info = sessionInfo[url.query.lpt];
	var api = url.pathname.match(apis)[0];
	var lrs = liburl.parse(info.endpoint.href+api, true);
	lrs.query = url.query;
	delete lrs.query.lpt;

	// build request
	var options = {
		url: liburl.format(lrs),
		auth: {
			user: info.user,
			pass: info.password,
			sendImmediately: true
		},
		headers: req.headers,
		method: req.method,
		body: JSON.stringify(req.body),
		strictSSL: false
	};

	// make request
	global.info('Forwarding request to',options.url);
	request(options, function(err,response,body){
		if(err){
			global.error(err);
			res.send(500, err);
			return;
		}
		var shortBody = body.length > 50 ? body.substr(0,50)+'...' : body;
		global.info('LRS response:',response.statusCode, shortBody);
		res.set(response.headers);
		res.send(response.statusCode, body);
	});
};