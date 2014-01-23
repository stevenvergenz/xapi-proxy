var assert = require("assert"),
	request = require("request"),
	async = require("async"),
	colors = require("colors");

var testCond = {total: 0, current: 0};
var passedAssertions = 0, errorAssertions = 0;

function shouldContinue(fun){
	testCond.current++;
	if(testCond.total == testCond.current){
		fun();
	}
}

function resetTestCond(){
	testCond.total = 0;
	testCond.current = 0;
}	

function assertHelper(fun, x, y, message){

	try{
		fun(x, y, message);
	}
	catch(err){
		errorAssertions++;
		throw err;
	}
	finally{
		passedAssertions++;
	}
}

colors.setTheme({
  pass: 'green',
  error: 'red'
});

describe('xAPI Proxy', function(){

	async.series([

		function(cb){
			describe('#storeLRSInfo', function()
			{
				it('should fail on bad POSTs', function(done)
				{
					//Convenience function to help determine whether or not these tests are complete
					var continueTests = function(){
						shouldContinue(function(){
							cb(null, 'storeLRSInfo');
							done();
						});
					};
					testCond.current = 0;
					testCond.total = 2;

					var testData = {
						'endpoint': 'https://lrs.adlnet.gov/xapi/',
						'user': 'bogusUser',
						'password': 'ButteredCatParadox'
					};

					request('http://localhost:3000/config', {method:'POST'}, function(err,res,body){
						assertHelper(assert.strictEqual, res.statusCode, 400, "Posting bad body should return Malformed");
						continueTests();
					});

					request('http://localhost:3000/config', {method:'POST', json: testData}, function(err,res,body){
						assertHelper(assert.strictEqual, res.statusCode, 400, "Posting bad body should return Malformed");
						continueTests();
					});
				}); // end "it"
			}); // end describe storeLRSInfo
		},
		function(cb){
			describe('#verifyToken', function(){

				it('should return status code 404 when the token is not set or not found', function(done){

					//Convenience function to help determine whether or not these tests are complete
					var continueTests = function(){
						shouldContinue(function(){
							cb(null, 'verifyToken');
							done();
						});
					};
					testCond.current = 0;
					testCond.total = 3;

					request('http://localhost:3000/config', function(err, res, body){
						assertHelper(assert.strictEqual, res.statusCode, 404, "Status code should be 404");
						continueTests();
					});

					request('http://localhost:3000/config?xapi=this_key_should_not_be_found', function(err, res, body){
						assertHelper(assert.strictEqual, res.statusCode, 404, "Status code should be 404");
						continueTests();
					});

					request('http://localhost:3000/config?xapi=%00../sdf/../../../../../var/www/', function(err, res, body){
						assertHelper(assert.strictEqual, res.statusCode, 404, "Status code should be 404");
						continueTests();
					});

				}); //End "it"
			}); //End describe verifyToken
		},
		function(cb){
			//Next test here..
			resetTestCond()
			cb(null, 'two');
		}
	],
	
		//optional callback
		function(err, results){
			console.log((passedAssertions + " assertions passed,").pass, (errorAssertions + " assertions failed").error);
		}
		
	); //End async
}); //End describe xAPI Proxy

