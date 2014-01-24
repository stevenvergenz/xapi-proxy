/**
 * Created by svergenz on 1/21/14.
 */
var crypto = require('crypto'),
	liburl = require('url'),
	async = require('async'),
	global = require('./global.js');

var sessionInfo = {};

// store LRS info in session, and return session token
exports.storeLRSInfo = function(req,res,next)
{
	// verify/sanitize LRS information
	var info = req.body;
	if( !(info && info.endpoint && info.user && info.password && info.actor) ){
		global.info('400 Bad request');
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
	// token is valid iff "xapi" query arg present and that value in the lookup table
	var url = liburl.parse(req.url, true);
	if( url.query.xapi && sessionInfo[url.query.xapi] )
	{
		var info = sessionInfo[url.query.xapi];
		global.info('Data exists for token', url.query.xapi);
		res.send(200, {
			'actor': info.actor,
			'expires': (new Date(info.expires)).toISOString()
		});
	}
	else {
		global.info('404 Token does not exist');
		res.send(404);
	}
};

// look up LRS info and pass request there
exports.forward = function(req,res,next)
{
	var url = liburl.parse(req.url, true);
	if( !url.query.xapi || !sessionInfo[url.query.xapi] ){
		global.info('401 No Token, No Auth, No Proxy');
		res.send(401);
	}

	var info = sessionInfo[url.query.xapi];
};