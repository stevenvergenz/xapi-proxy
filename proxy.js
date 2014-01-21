/**
 * Created by svergenz on 1/21/14.
 */
var http = require('http'),
	https = require('https'),
	global = require('./global.js');


// store LRS info in session, and return session token
exports.storeLRSInfo = function(req,res,next)
{

};

// return whether or not the token is valid, and if it is, also return its expiration date
exports.verifyToken = function(req,res,next)
{

}

// look up LRS info and pass request there
exports.forward = function(req,res,next)
{

};