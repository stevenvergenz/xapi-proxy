var assert = require("assert");
var request = require("request");
var done = 0;

//var test = 
//console.log(test);

describe('Array', function(){
  describe('#indexOf()', function(){
	it('should return -1 when the value is not present', function(done){
	  assert.equal(-1, [1,2,3].indexOf(5));
	  assert.equal(-1, [1,2,3].indexOf(0));
	  
	  request('http://google.com', function(err, res, body){
	  
		console.log(body);
		done();
	  });

	})
  })
});

