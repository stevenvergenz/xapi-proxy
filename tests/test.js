var assert = require("assert"),
	request = require("request"),
	async = require("async");

describe('xAPI Proxy', function(){

  describe('#config', function(){
	
	async.series([
		function(cb){
			var totalTests = 2,
				currentTest = 0;
			
			it('should return status code 404 when the token is not set or not found', function(done){
			  
			  request('http://localhost:3000', function(err, res, body){
				assert.strictEqual(res.statusCode, 404, "Status code should be 404");
				done();
			  });
			  
			   request('http://localhost:3000?xapi=this_key_should_not_be_found', function(err, res, body){
				assert.strictEqual(res.statusCode, 404, "Status code should be 404");
				done();
			  });	
			  
			   request('http://localhost:3000?xapi=%00../sdf/../../../../../var/www/', function(err, res, body){
				assert.strictEqual(res.statusCode, 404, "Status code should be 404");
				done();
			  });
			});
			
			cb(null, 'one');
		},
		function(cb){
			// do some more stuff ...
			cb(null, 'two');
		}
	],
	// optional callback
	function(err, results){
		// results is now equal to ['one', 'two']
	});
	

	

  });
  
});

