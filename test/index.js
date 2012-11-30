var finder = require('../index.js')();
var expect = require('chai').expect;

describe('Finder', function() {
  describe('.open', function() {
    this.timeout(5000);
    it('should traverse directories', function(done) {
      finder.open({user: 'apily', project: 'zero'})
      .on('file', function(item) {
        expect(item).to.have.property('type').and.equal('file');
        expect(item).to.have.property('content');
      })
      .on('dir', function(item) {
        expect(item).to.be.an('array');
      })
      .on('end', function() {
        done();
      })

    });
  });
});