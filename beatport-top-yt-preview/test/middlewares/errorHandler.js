'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const { DatabaseError } = require('../../errors');
const errorHandler = require('../../middlewares/errorHandler');

const mockResponse = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe('Error handler middleware', function() {
  afterEach(function() {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('When there is a default error, should respond 500 InternalServerError', function() {
    const err = new Error('This is a default error');
    const req = {};
    const res = mockResponse();

    errorHandler(err, req, res);

    expect(res.status.firstCall.args[0]).to.equal(500);
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: 'InternalServerError'
    });
  });

  it('When there is a DatabaseError, should respond 500 DatabaseError', function() {
    const err = new DatabaseError('This is a DatabaseError');
    const req = {};
    const res = mockResponse();

    errorHandler(err, req, res);

    expect(res.status.firstCall.args[0]).to.equal(500);
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: 'DatabaseError'
    });
  });

  it('When there is a default error with status 422, should respond 422 InternalServerError', function() {
    const err = new Error('This is a default error');
    err.status = 422;
    const req = {};
    const res = mockResponse();

    errorHandler(err, req, res);

    expect(res.status.firstCall.args[0]).to.equal(422);
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: 'InternalServerError'
    });
  });

  it('When there is a DatabaseError with public = true, should respond 500 and its error message', function() {
    const err = new DatabaseError('error message');
    err.isPublic = true;
    const req = {};
    const res = mockResponse();

    errorHandler(err, req, res);

    expect(res.status.firstCall.args[0]).to.equal(500);
    expect(res.json.firstCall.args[0]).to.deep.equal({
      error: 'error message'
    });
  });
});