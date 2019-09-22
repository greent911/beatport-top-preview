const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./../app');

var expect = chai.expect;

chai.use(chaiHttp);

describe('beatport-top-yt-preview', function() {
  describe('GET /types', function() {
    it('response is no error and 200 status', function(done) {
      chai.request(app)
        .get('/types')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  describe('GET /tracks', function() {
    it('response is no error and 200 status', function(done) {
      chai.request(app)
        .get('/tracks')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
    it('GET /tracks/top100 response is no error and 200 status', function(done) {
      chai.request(app)
        .get('/tracks/top100')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
    });
    it('GET /tracks/top99 response is no error and 200 status and empty', function(done) {
      chai.request(app)
        .get('/tracks/top99')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });
  });
  describe('GET /PageNotFound', function() {
    it('response status is 404', function(done) {
      chai.request(app)
        .get('/PageNotFound')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});