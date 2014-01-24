var assert = require("assert"),
	request = require("request");

describe('xAPI Proxy', function(){
	describe('#storeLRSInfo', function()
	{
		it('should fail on empty POSTs', function(done)
		{
			request.post('http://localhost:3000/config', function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 400);
					done();
				}
				catch(e){
					done(e);
				}
			});
		});

		it('should fail on malformed POSTs', function(done)
		{
			var testData = {
				'endpoint': 'https://lrs.adlnet.gov/xapi/',
				'user': 'bogusUser',
				'password': 'ButteredCatParadox'
			};

			request.post('http://localhost:3000/config', {json:testData}, function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 400);
					done();
				}
				catch(e){
					done(e);
				}
			});
		});
	}); // end describe storeLRSInfo

	describe('#verifyToken', function(){

		it('should return 404 when the token is not set', function(done){
			request.get('http://localhost:3000/config', function(err, res, body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 404);
					done();
				}
				catch(e){
					done(e);
				}
			});
		});
		it('should return 404 when the token is not valid', function(done){
			request.get('http://localhost:3000/config?xapi=this_key_should_not_be_found', function(err, res, body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 404);
					done();
				}
				catch(e){
					done(e);
				}
			});
		});
	}); //End describe verifyToken
});