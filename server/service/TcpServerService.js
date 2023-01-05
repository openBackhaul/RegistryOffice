'use strict';
var fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
var tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');

const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');

/**
 * Returns Description of TcpServer
 *
 * uuid String 
 * returns inline_response_200_37
 **/
exports.getTcpServerDescription = function (url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "tcp-server-interface-1-0:description": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns address of the server
 *
 * uuid String 
 * returns inline_response_200_39
 **/
exports.getTcpServerLocalAddress = function (url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "tcp-server-interface-1-0:local-address": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns TCP port of the server
 *
 * uuid String 
 * returns inline_response_200_20
 **/
exports.getTcpServerLocalPort = function (url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "tcp-server-interface-1-0:local-port": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns Protocol of TcpServer
 *
 * uuid String 
 * returns inline_response_200_38
 **/
exports.getTcpServerLocalProtocol = function (url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      if (value.toUpperCase() == "HTTP") {
        value = "tcp-server-interface-1-0:PROTOCOL_TYPE_HTTP";
      } else if (value.toUpperCase() == "HTTPS") {
        value = "tcp-server-interface-1-0:PROTOCOL_TYPE_HTTPS";
      } else {
        value = "tcp-server-interface-1-0:PROTOCOL_TYPE_NOT_YET_DEFINED";
      }
      var response = {};
      response['application/json'] = {
        "tcp-server-interface-1-0:local-protocol": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Documents Description of TcpServer
 *
 * body Tcpserverinterfaceconfiguration_description_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerDescription = function (url, body, uuid) {
  return new Promise(async function (resolve, reject) {
    try {
      let isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isUpdated) {
        let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
          uuid
        );
        ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
          forwardingAutomationInputList
        );
      }

      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * Documents address of the server
 *
 * body Tcpserverinterfaceconfiguration_localaddress_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerLocalAddress = function (url, body, uuid) {
  return new Promise(async function (resolve, reject) {
    try {
      let localAddress = {"local-address" : body["tcp-server-interface-1-0:local-address"]}
      let isUpdated = await tcpServerInterface.setLocalAddressAsync(uuid, localAddress);
      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isUpdated) {
        let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
          uuid
        );
        ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
          forwardingAutomationInputList
        );
      }

      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * Documents TCP port of the server
 *
 * body Tcpserverinterfaceconfiguration_localport_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerLocalPort = function (url, body, uuid) {
  return new Promise(async function (resolve, reject) {
    try {
      let isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isUpdated) {
        let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
          uuid
        );
        ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
          forwardingAutomationInputList
        );
      }

      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * Documents Protocol of TcpServer
 *
 * body Tcpserverinterfaceconfiguration_localprotocol_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerLocalProtocol = function (url, body, uuid) {
  return new Promise(async function (resolve, reject) {
    try {
      let value = body["tcp-server-interface-1-0:local-protocol"];
      if (value == "tcp-server-interface-1-0:PROTOCOL_TYPE_HTTP") {
        body["tcp-server-interface-1-0:local-protocol"] = "HTTP";
      } else if (value == "tcp-server-interface-1-0:PROTOCOL_TYPE_HTTPS") {
        body["tcp-server-interface-1-0:local-protocol"] = "HTTPS";
      } else {
        body["tcp-server-interface-1-0:local-protocol"] = "NOT_YET_DEFINED";
      }
      let isUpdated = await fileOperation.writeToDatabaseAsync(url, body, false);

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isUpdated) {
        let forwardingAutomationInputList = await prepareForwardingAutomation.OAMLayerRequest(
          uuid
        );
        ForwardingAutomationService.automateForwardingConstructWithoutInputAsync(
          forwardingAutomationInputList
        );
      }

      resolve();
    } catch (error) {
      reject();
    }
  });
}