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

module.exports.getFileProfileFilePath = async function getFileProfileFilePath (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileFilePath(req.url)
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

module.exports.getFileProfilePassword = async function getFileProfilePassword (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfilePassword(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.getFileProfileUserName = async function getFileProfileUserName (req, res, next, uuid) {
  let responseCode = ResponseCode.code.OK;
  await FileProfile.getFileProfileUserName(req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putFileProfileFilePath = async function putFileProfileFilePath (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await FileProfile.putFileProfileFilePath(body, req.url)
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

module.exports.putFileProfilePassword = async function putFileProfilePassword (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await FileProfile.putFileProfilePassword(body, req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};

module.exports.putFileProfileUserName = async function putFileProfileUserName (req, res, next, body, uuid) {
  let responseCode = ResponseCode.code.NO_CONTENT;
  await FileProfile.putFileProfileUserName(body, req.url)
    .then(function (response) {
      ResponseBuilder.buildResponse(res, responseCode, response);
    })
    .catch(function (response) {
      let sentResp = ResponseBuilder.buildResponse(res, undefined, response);
      responseCode = sentResp.code;
    });
  OamLogService.recordOamRequest(req.url, req.body, responseCode, req.headers.authorization, req.method);
};
