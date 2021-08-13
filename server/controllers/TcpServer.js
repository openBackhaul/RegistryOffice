'use strict';

var utils = require('../utils/writer.js');
var TcpServer = require('../service/TcpServerService');

module.exports.getTcpServerLocalAddress = function getTcpServerLocalAddress (req, res, next, uuid) {
  TcpServer.getTcpServerLocalAddress(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getTcpServerLocalPort = function getTcpServerLocalPort (req, res, next, uuid) {
  TcpServer.getTcpServerLocalPort(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putTcpServerLocalAddress = function putTcpServerLocalAddress (req, res, next, body, uuid) {
  TcpServer.putTcpServerLocalAddress(body, uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putTcpServerLocalPort = function putTcpServerLocalPort (req, res, next, body, uuid) {
  TcpServer.putTcpServerLocalPort(body, uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
