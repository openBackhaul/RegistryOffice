'use strict';


/**
 * Returns IP address of the server
 *
 * uuid String 
 * returns inline_response_200_19
 **/
exports.getTcpServerLocalAddress = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "tcp-server-interface-1-0:local-address" : {
    "ipv-4-address" : "10.118.125.157",
    "ipv-6-address" : "0:0:0:0:0:0:0:0"
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns TCP port of the server
 *
 * uuid String 
 * returns inline_response_200_20
 **/
exports.getTcpServerLocalPort = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "tcp-server-interface-1-0:local-port" : 1000
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Documents IP address of the server
 *
 * body Tcpserverinterfaceconfiguration_localaddress_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerLocalAddress = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Documents TCP port of the server
 *
 * body Tcpserverinterfaceconfiguration_localport_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putTcpServerLocalPort = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

