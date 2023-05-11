'use strict';

var utils = require('../utils/writer.js');
var IntegerProfile = require('../service/IntegerProfileService');
var responseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var oamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');

module.exports.getIntegerProfileIntegerName = async function getIntegerProfileIntegerName (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await IntegerProfile.getIntegerProfileIntegerName(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getIntegerProfileIntegerValue = async function getIntegerProfileIntegerValue (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await IntegerProfile.getIntegerProfileIntegerValue(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getIntegerProfileMaximum = async function getIntegerProfileMaximum (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await IntegerProfile.getIntegerProfileMaximum(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getIntegerProfileMinimum = async function getIntegerProfileMinimum (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await IntegerProfile.getIntegerProfileMinimum(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getIntegerProfileUnit = async function getIntegerProfileUnit (req, res, next, uuid) {
  let responseCode = responseCodeEnum.code.OK;
  await IntegerProfile.getIntegerProfileUnit(req.url)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putIntegerProfileIntegerValue = async function putIntegerProfileIntegerValue (req, res, next, body, uuid) {
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  await IntegerProfile.putIntegerProfileIntegerValue(body, req.url, uuid)
    .then(function (response) {
      responseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
       if(response == "Integer value must between maximum and minimun value"){
        responseCode = responseCodeEnum.code.BAD_REQUEST;
      }
      else{
        responseCode = responseCodeEnum.code.INTERNAL_SERVER_ERROR;
      }

      responseBuilder.buildResponse(res, responseCode, response);
    });
  oamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};
