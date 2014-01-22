/**
 * Created by svergenz on 1/21/14.
 */
var http = require('http'),
	https = require('https'),
	crypto = require('crypto'),
	liburl = require('url'),
	global = require('./global.js');

var sessionInfo = {};

// store LRS info in session, and return session token
exports.storeLRSInfo = function(req,res,next)
{
	// verify/sanitize LRS information
	var info = req.body;
	if( !(info && info.endpoint && info.user && info.password && info.actor) ){
		res.send(400);
		return;
	}
	else {
		info = {
			'endpoint': info.endpoint,
			'user': info.user,
			'password': info.password,
			'actor': info.actor,
			'expires': Date.now() + 24*60*60*1000
		};
	}

	// generate random key
	crypto.pseudoRandomBytes(12, function(err,buf){

		// store session info under that key
		var key = buf.toString('base64');
		sessionInfo[key] = info;
		global.log('Saving credentials for new key', key);

		// return info token
		res.send(200, key);
	});
};

// return whether or not the token is valid, and if it is, also return its expiration date
exports.verifyToken = function(req,res,next)
{
	var url = liburl.parse(req.url, true);
	if( url.query.xapi && sessionInfo[url.query.xapi] ){
		var info = sessionInfo[url.query.xapi];
		res.send(200, {
			'actor': info.actor,
			'expires': (new Date(info.expires)).toISOString()
		});
	}
	else {
		res.send(404);
	}
};

// look up LRS info and pass request there
exports.forward = function(req,res,next)
{

};