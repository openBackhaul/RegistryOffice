'use strict';

var utils = require('../utils/writer.js');
var Core = require('../service/CoreService');

module.exports.getControlConstruct = function getControlConstruct (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  Core.getControlConstruct(user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
