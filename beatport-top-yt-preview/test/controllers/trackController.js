'use strict';

const expect = require('chai').expect;
const express = require('express');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const trackController = require('./../../controllers/trackController');
const { trackService } = require('./../../services');

const router = express.Router();
router.get('/:type', trackController.getTracks);
router.get('/', trackController.getTracks);

const mockResponse = () => {
  return httpMocks.createResponse({eventEmitter: require('events').EventEmitter});
};

describe('Track controller', function() {
  afterEach(function() {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('When path is not in a correct format, should respond validation error', function(done) {
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/vsvdsvd-',
    }); 
    let res = mockResponse();

    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        expect(json).to.have.property('message');
        expect(json).to.have.property('errors');
        expect(json.message).to.equal('Request input validation error');
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });

  it('When path is in a correct format, should pass validation', function(done) {
    let stub = sinon.stub(trackService, 'getTracksByType');
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/psy-trance',
    }); 
    let res = mockResponse();

    stub.returns(Promise.resolve([]));
    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, 'psy-trance');
        expect(json).to.have.lengthOf(0);
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });

  it('When query string is not in a correct format, should respond validation error', function(done) {
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/?fields=num,',
    }); 
    let res = mockResponse();

    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        expect(json).to.have.property('message');
        expect(json).to.have.property('errors');
        expect(json.message).to.equal('Request input validation error');
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });

  it('When query string contains incorrect field names, should respond validation error', function(done) {
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/?fields=num,nofield',
    }); 
    let res = mockResponse();

    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        expect(json).to.have.property('message');
        expect(json).to.have.property('errors');
        expect(json.message).to.equal('Request input validation error');
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });

  it('When path with query string is in a correct format, should pass validation', function(done) {
    let stub = sinon.stub(trackService, 'getTracksByType');
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/psy-trance?fields=num,title',
    }); 
    let res = mockResponse();

    stub.returns(Promise.resolve([]));
    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, 'psy-trance', ['num', 'title']);
        expect(json).to.have.lengthOf(0);
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });

  it('When request with no parameter, should use the default one', function(done) {
    let stub = sinon.stub(trackService, 'getTracksByType');
    let req  = httpMocks.createRequest({
      method: 'GET',
      url: '/',
    }); 
    let res = mockResponse();

    stub.returns(Promise.resolve([]));
    res.on('end', function() {
      let json = res._getJSONData();
      console.log(json);
      try {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, 'top100');
        expect(json).to.have.lengthOf(0);
        done();
      } catch (err) {
        // Catch mocha’s failure message
        done(err);
      }
    });

    router.handle(req, res);
  });
});