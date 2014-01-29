var assert = require("assert"),
	request = require("request");

var validToken = '';

var testData = {
	'endpoint': 'https://lrs.adlnet.gov/xapi/',
	'user': 'bogusUser',
	'password': 'ButteredCatParadox',
	'actor': {
		'name': 'Steven Vergenz',
		'mbox_sha1sum': 'd16681af53ecce8c2c650c5751575325af277cee'
	}
};

describe('xAPI Proxy', function(){
	describe('#storeLRSInfo', function()
	{
		it('should return 400 on empty POSTs', function(done)
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

		it('should return 400 on malformed POSTs', function(done)
		{
			var testData = {
				'endpoint': 'https://lrs.adlnet.gov/xapi/',
				'user': 'bogusUser',
				'password': 'ButteredCatParadox'
				//missing actor
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

		it('should return a token on valid POSTs', function(done)
		{
			request.post('http://localhost:3000/config', {json:testData}, function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 200);
					assert.ok(/^[A-Za-z0-9/+]{16}$/.test(body));
					validToken = body;
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

		it('should return actor and expiration with a valid token', function(done){
			request.get('http://localhost:3000/config?xapi='+encodeURIComponent(validToken), function(err, res, body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 200);
					assert.deepEqual(JSON.parse(body).actor, testData.actor);
					done();
				}
				catch(e){
					done(e);
				}
			});
		});
	}); //End describe verifyToken

	describe('#proxy', function(){

		it('should return 401 for missing tokens', function(done){
			request.get('http://localhost:3000/xapi/statements', function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 401);
					done();
				}
				catch(e){
					done(e);
				}
			})
		});

		it('should return 401 for invalid tokens', function(done){
			request.get('http://localhost:3000/xapi/statements?xapi=herkaderpa', function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.strictEqual(res.statusCode, 401);
					done();
				}
				catch(e){
					done(e);
				}
			})
		});

		it('should proxy to LRS with valid token', function(done){
			request.get('http://localhost:3000/xapi/statements?xapi='+encodeURIComponent(validToken), function(err,res,body){
				if(err){
					done(err);
					return;
				}
				try {
					assert.ok(!!res.headers['x-experience-api-version']);
					done();
				}
				catch(e){
					done(e);
				}
			})
		});
	});
});