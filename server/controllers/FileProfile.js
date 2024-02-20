//@ts-check
'use strict';

var FileProfile = require('../service/FileProfileService');
var ResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var ResponseCode = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var OamLogService = require('onf-core-model-ap/applicationPattern/services/OamLogService');

module.exports.getFileProfileFileDescription = async function getFileProfileFileDescription (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileFileDescription(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getFileProfileFileIdentifier = async function getFileProfileFileIdentifier (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileFileIdentifier(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getFileProfileFileName = async function getFileProfileFileName (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileFileName(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getFileProfileOperation = async function getFileProfileOperation (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileOperation(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putFileProfileFileName = async function putFileProfileFileName (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await FileProfile.putFileProfileFileName(body, req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putFileProfileOperation = async function putFileProfileOperation (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await FileProfile.putFileProfileOperation(body, req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};