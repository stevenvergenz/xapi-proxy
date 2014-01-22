/**
 * Created by svergenz on 1/21/14.
 */
var fs = require('fs'),
	util = require('util');

// parse config file
exports.config = {};
fs.readFile('config.json', function(err,data)
{
	if(err)
		data = {};
	else
		data = JSON.parse(data);

	exports.config.console_level = data.console_level || 3;
	exports.config.log_level = data.log_level || 3;
	exports.config.log_file = data.log_file;
	exports.config.port = data.port || 3000;
});

var logLevels = {
    'error': 0,
    'warning': 1,
    'log': 2,
    'info': 3
};

var logNames = ['ERR ','WARN','LOG ','INFO'];
var logColors = {
	'red': '\u001b[31m',
	'yellow': '\u001b[33m',
	'blue': '\u001b[34m',
	'reset': '\u001b[0m'
};
var levelColors = {
	0: logColors.red,
	1: logColors.yellow,
	3: logColors.blue
};

exports.log_request = function(req,res,next)
{
	var line = [req.method, req.url, req.ip, req.header('user-agent')];
	log(logLevels.info, line);
	next();
};

function log(level, args)
{
	if( exports.config.log_file && level <= exports.config.log_level )
	{
		var line = util.format('[%s] [%s]', (new Date()).toISOString(), logNames[level], args.join(' '));
		fs.appendFile(exports.config.log_file, line+'\n');
	}

	if( level <= exports.config.console_level )
	{

		var line = util.format('%s[%s] [%s]%s %s%s',
			levelColors[level] || '',
			(new Date()).toISOString(),
			logNames[level],
			level==logLevels.error ? '' : logColors.reset,
			args.join(' '),
			level!=logLevels.error ? '' : logColors.reset
		);
		console.log(line);
	}

}

exports.info = function(){
	log(logLevels.info, Array.prototype.slice.call(arguments));
};
exports.log = function(){
	log(logLevels.log, Array.prototype.slice.call(arguments));
};
exports.warning = function(){
	log(logLevels.warning, Array.prototype.slice.call(arguments));
};
exports.error = function(){
	log(logLevels.error, Array.prototype.slice.call(arguments));
};