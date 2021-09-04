'use strict';

var utils = require('../utils/writer.js');
var IndividualServices = require('../service/IndividualServicesService');

module.exports.deregisterApplication = function deregisterApplication (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.deregisterApplication(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listApplications = function listApplications (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listApplications(user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listApplicationsInGenericRepresentation = function listApplicationsInGenericRepresentation (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listApplicationsInGenericRepresentation(user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.notifyApprovals = function notifyApprovals (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.notifyApprovals(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.notifyDeregistrations = function notifyDeregistrations (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.notifyDeregistrations(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.notifyRegistrations = function notifyRegistrations (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.notifyRegistrations(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.notifyWithdrawnApprovals = function notifyWithdrawnApprovals (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.notifyWithdrawnApprovals(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.registerApplication = function registerApplication (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.registerApplication(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.stopNotifyingApplication = function stopNotifyingApplication (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.stopNotifyingApplication(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.updateApprovalStatus = function updateApprovalStatus (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.updateApprovalStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
