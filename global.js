/**
 * Created by svergenz on 1/21/14.
 */
var fs = require('fs'),
	util = require('util');

exports.config = {
    'cookie_secret': "You can't hit what you can't see!",
    'console_level': 3,
	'log_level': 2,
	'log_file': undefined,
    'port': 3000
};

var logLevels = {
    'error': 0,
    'warning': 1,
    'log': 2,
    'info': 3
};

var logNames = ['ERR','WARN','LOG','INFO'];
var logColors = {
	'red': '\u001b[31m',
	'yellow': '\u001b[33m',
	'blue': '\u001b[34m',
	'reset': '\u001b[0m'
};
var levelColors = {
	0: logColors.red,
	1: logColors.yellow,
	2: logColors.blue
};

function log(level, args)
{
	if( level <= exports.config.log_level )
	{
		var line = util.format('[%s] [%s]', (new Date()).toISOString(), logNames[level], args.join());
		fs.appendFile(exports.config.log_file, line+'\n');
	}

	if( level <= exports.config.console_level )
	{

		var line = util.format('%s[%s] [%s]%s %s%s',
			levelColors[level],
			(new Date()).toISOString(),
			logNames[level],
			level==logLevels.error ? '' : logColors.reset,
			args.join(),
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