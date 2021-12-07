'use strict';

const operationServerInterface = require('../applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const httpClientInterface = require('../applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('../applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const logicalTerminationPoint = require('../applicationPattern/onfModel/models/LogicalTerminationPoint');
const forwardingConstructService = require('../applicationPattern/onfModel/services/ForwardingConstructService');
const logicalTerminationPointService = require('../applicationPattern/onfModel/services/LogicalTerminationPointService');
const responseValue = require('../applicationPattern/rest/server/responseBody/ResponseValue');
const onfAttributeFormatter = require('../applicationPattern/onfModel/utility/OnfAttributeFormatter');
const layerProtocol = require('../applicationPattern/onfModel/models/LayerProtocol');

const serviceType = "Individual";
/**
 * @description Removes an application
 *
 * @param {String} body V1_deregisterapplication_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.deregisterApplication = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    let response = {};
    try {
      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let applicationReleaseNumber = body["application-release-number"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationClientList = await logicalTerminationPointService.deleteLogicalTerminationPointInstanceGroup(applicationName, applicationReleaseNumber);

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if(operationClientList!=undefined && operationClientList.length>0){
      let attributeList = [{
          "name": "application-name",
          "value": applicationName
        },
        {
          "name": "application-release-number",
          "value": applicationReleaseNumber
        }
      ];
      /****************************************************************************************
       * Configure and automate forwarding construct
       ****************************************************************************************/
      let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
      forwardingConstructService.unConfigureAndAutomateForwardingConstruct(serviceType, operationServerUuid,
        operationClientList, attributeList, user, xCorrelator, traceIndicator, customerJourney);
      }
    } catch (error) {
      console.log(error);
    }
    if (Object.keys(response).length > 0) {
      resolve(response[Object.keys(response)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * @description Offers subscribing to notifications about new registrations
 *
 * @param {String} body V1_inquireapplicationtypeapprovals_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.inquireApplicationTypeApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["approval-application"];
      let releaseNumber = body["approval-application-release-number"];
      let applicationAddress = body["approval-application-address"];
      let applicationPort = body["approval-application-port"];
      let subscriberOperation = body["approval-operation"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationList = [subscriberOperation];
      let createdOperationInstanceInformationList = await logicalTerminationPointService.updateLogicalTerminationPointInstanceGroup(applicationName, releaseNumber, applicationAddress,
        applicationPort, operationList);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
      let forwardingConstructConfigurationList = [];
      if (createdOperationInstanceInformationList.length > 0) {
        let requestSubscriberOperationUuid = createdOperationInstanceInformationList[0].uuid;
        forwardingConstructConfigurationList = [{
          "forwardingName": "RegistrationCausesInquiryForApplicationTypeApproval",
          "OperationClientUuid": requestSubscriberOperationUuid
        }];
        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         ****************************************************************************************/
        let attributeList = [];

        /****************************************************************************************
         * Configure and automate forwarding construct
         ****************************************************************************************/
        let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
        forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
          forwardingConstructConfigurationList, attributeList,
          user, xCorrelator, traceIndicator, customerJourney);
      }
      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Provides list of applications
 *
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {promise} returns application list
 **/
exports.listApplications = function (user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    let response = {};
    try {
      /****************************************************************************************
       * Preparing response body
       ****************************************************************************************/
      let applicationList = await getAllRegisteredApplicationList();

      /****************************************************************************************
       * Setting 'application/json' response body
       ****************************************************************************************/
      response['application/json'] = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(applicationList);
    } catch (error) {
      console.log(error);
    }
    if (Object.keys(response).length > 0) {
      resolve(response[Object.keys(response)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * @description Provides list of applications in generic representation
 *
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {promise} returns list application in generic representation
 **/
exports.listApplicationsInGenericRepresentation = function (user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    let response = {};
    try {
      /****************************************************************************************
       * Preparing consequent-action-list for response body
       ****************************************************************************************/
      let consequentActionList = [];

      /****************************************************************************************
       * Preparing response-value-list for response body
       ****************************************************************************************/
      let responseValueList = [];
      let applicationList = await getAllRegisteredApplicationNameAndReleaseList();
      for (let i = 0; i < applicationList.length; i++) {
        let applicationName = applicationList[i]["application-name"];
        let releaseNumber = applicationList[i]["release-number"];
        let reponseValue = new responseValue(applicationName, releaseNumber, typeof releaseNumber);
        responseValueList.push(reponseValue);
      }

      /****************************************************************************************
       * Setting 'application/json' response body
       ****************************************************************************************/
      response['application/json'] = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase({
        consequentActionList,
        responseValueList
      });
    } catch (error) {
      console.log(error);
    }

    if (Object.keys(response).length > 0) {
      resolve(response[Object.keys(response)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * @description Offers subscribing to notifications about new approvals
 *
 * @param {String} body V1_notifyapprovals_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["subscriber-application"];
      let releaseNumber = body["subscriber-release-number"];
      let applicationAddress = body["subscriber-address"];
      let applicationPort = body["subscriber-port"];
      let subscriberOperation = body["subscriber-operation"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationList = [subscriberOperation];
      let createdOperationInstanceInformationList = await logicalTerminationPointService.updateLogicalTerminationPointInstanceGroup(applicationName, releaseNumber, applicationAddress,
        applicationPort, operationList);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
      let forwardingConstructConfigurationList = [];
      if (createdOperationInstanceInformationList.length > 0) {
        let requestSubscriberOperationUuid = createdOperationInstanceInformationList[0].uuid;
        forwardingConstructConfigurationList = [{
          "forwardingName": "ApprovalNotification",
          "OperationClientUuid": requestSubscriberOperationUuid
        }];

        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         ****************************************************************************************/
        let attributeList = [];

        /****************************************************************************************
         * Configure and automate forwarding construct
         ****************************************************************************************/
        let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
        forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
          forwardingConstructConfigurationList, attributeList,
          user, xCorrelator, traceIndicator, customerJourney);
      }
      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Offers subscribing to notifications about withdrawn registrations
 *
 * @param {String} body V1_notifyderegistrations_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyDeregistrations = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["subscriber-application"];
      let releaseNumber = body["subscriber-release-number"];
      let applicationAddress = body["subscriber-address"];
      let applicationPort = body["subscriber-port"];
      let subscriberOperation = body["subscriber-operation"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationList = [subscriberOperation];
      let createdOperationInstanceInformationList = await logicalTerminationPointService.updateLogicalTerminationPointInstanceGroup(applicationName, releaseNumber, applicationAddress,
        applicationPort, operationList);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
      let forwardingConstructConfigurationList = [];
      if (createdOperationInstanceInformationList.length > 0) {
        let requestSubscriberOperationUuid = createdOperationInstanceInformationList[0].uuid;
        forwardingConstructConfigurationList = [{
          "forwardingName": "DeregistrationNotification",
          "OperationClientUuid": requestSubscriberOperationUuid
        }];

        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         ****************************************************************************************/
        let attributeList = [];

        /****************************************************************************************
         * Configure and automate forwarding construct
         ****************************************************************************************/
        let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
        forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
          forwardingConstructConfigurationList, attributeList,
          user, xCorrelator, traceIndicator, customerJourney);
      }
      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Offers subscribing to notifications about withdrawn approvals
 *
 * @param {String} body V1_notifywithdrawnapprovals_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyWithdrawnApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {
      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["subscriber-application"];
      let releaseNumber = body["subscriber-release-number"];
      let applicationAddress = body["subscriber-address"];
      let applicationPort = body["subscriber-port"];
      let subscriberOperation = body["subscriber-operation"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationList = [subscriberOperation];
      let createdOperationInstanceInformationList = await logicalTerminationPointService.updateLogicalTerminationPointInstanceGroup(applicationName, releaseNumber, applicationAddress,
        applicationPort, operationList);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
      let forwardingConstructConfigurationList = [];
      if (createdOperationInstanceInformationList.length > 0) {
        let requestSubscriberOperationUuid = createdOperationInstanceInformationList[0].uuid;
        forwardingConstructConfigurationList = [{
          "forwardingName": "WithdrawnApprovalNotification",
          "OperationClientUuid": requestSubscriberOperationUuid
        }];
        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         ****************************************************************************************/
        let attributeList = [];

        /****************************************************************************************
         * Configure and automate forwarding construct
         ****************************************************************************************/
        let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
        forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
          forwardingConstructConfigurationList, attributeList,
          user, xCorrelator, traceIndicator, customerJourney);
      }
      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Adds to the list of known applications
 *
 * @param {String} body V1_registerapplication_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.registerApplication = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let releaseNumber = body["application-release-number"];
      let applicationAddress = body["application-address"];
      let applicationPort = body["application-port"];
      let embeddingOperation = body["embedding-operation"];
      let clientUpdateOperation = body["client-update-operation"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      let operationList = [embeddingOperation, clientUpdateOperation];
      let createdOperationInstanceInformationList = await logicalTerminationPointService.createLogicalTerminationPointInstanceGroup(applicationName, releaseNumber, applicationAddress,
        applicationPort, operationList);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
      let embedYourSelfOperationClientUuid;
      for (let i = 0; i < createdOperationInstanceInformationList.length; i++) {
        let operationClientInstance = createdOperationInstanceInformationList[i];
        if (operationClientInstance.operationName.includes(embeddingOperation)) {
          embedYourSelfOperationClientUuid = operationClientInstance.uuid;
        }
      }
      let forwardingConstructConfigurationList = [{
        "forwardingName": "TypeApprovalCausesRequestForEmbedding",
        "OperationClientUuid": embedYourSelfOperationClientUuid
      }];

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let attributeList = [{
          "name": "application-name",
          "value": applicationName
        },
        {
          "name": "release-number",
          "value": releaseNumber
        }
      ]

      /****************************************************************************************
       * Configure and automate forwarding construct
       ****************************************************************************************/
      let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
      forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
        forwardingConstructConfigurationList, attributeList, user, xCorrelator, traceIndicator, customerJourney);

      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Offers broadcasting of information about updated serving application
 *
 * @param {String} body V1_relayserverreplacement_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.relayServerReplacement = function (body, user, originator, xCorrelator, traceIndicator, customerJourney,originalUrl) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let oldApplicationReleaseNumber = body["old-application-release-number"];
      let newApplicationReleaseNumber = body["new-application-release-number"];
      let newApplicationAddress = body["new-application-address"];
      let newApplicationPort = body["new-application-port"];

      /****************************************************************************************
       * Prepare attributes and configure logical-termination-point
       ****************************************************************************************/
      

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/
       let forwardingConstructConfigurationList = [];

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let attributeList = [{
          "name": "application-name",
          "value": applicationName
        },
        {
          "name": "old-application-release-number",
          "value": oldApplicationReleaseNumber
        },{
          "name": "new-application-release-number",
          "value": newApplicationReleaseNumber
        },
        {
          "name": "new-application-address",
          "value": newApplicationAddress
        },{
          "name": "new-application-port",
          "value": newApplicationPort
        }
      ]

      /****************************************************************************************
       * Configure and automate forwarding construct
       ****************************************************************************************/
      let operationServerUuid = await operationServerInterface.getOperationServerUuidForTheOperationName(originalUrl);
      forwardingConstructService.configureAndAutomateForwardingConstruct(true, serviceType, operationServerUuid,
        forwardingConstructConfigurationList, attributeList, user, xCorrelator, traceIndicator, customerJourney);
      resolve();
    } catch (error) {
      reject();
    }
  });
}


/**
 * @description Updates the approval status of an already registered application
 *
 * @param {String} body V1_regardupdatedapprovalstatus_body 
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.updateApprovalStatus = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}

/****************************************************************************************
 * Functions utilized by individual services
 ****************************************************************************************/

/**
 * @description This function returns list of registered application information application-name , release-number, application-address, application-port.
 * @return {Promise} return the list of application information
 * <b><u>Procedure :</u></b><br>
 * <b>step 1 :</b> get all http client Interface and get the application name, release number and server-ltp<br>
 * <b>step 2 :</b> get the ipaddress and port name of each associated tcp-client <br>
 **/
function getAllRegisteredApplicationList() {
  return new Promise(async function (resolve, reject) {
    let clientApplicationList = [];
    try {

      /** 
       * This class instantiate objects that holds the application name , release number, 
       * IpAddress and port information of the registered client applications
       */
      let clientApplicationInformation = class ClientApplicationInformation {
        applicationName;
        applicationReleaseNumber;
        applicationAddress;
        applicationPort;

        /**
         * @constructor 
         * @param {String} applicationName name of the client application.
         * @param {String} applicationReleaseNumber release number of the application.
         * @param {String} applicationAddress ip address of the application.
         * @param {String} applicationPort port of the application.
         **/
        constructor(applicationName, applicationReleaseNumber, applicationAddress, applicationPort) {
          this.applicationName = applicationName;
          this.applicationReleaseNumber = applicationReleaseNumber;
          this.applicationAddress = applicationAddress;
          this.applicationPort = applicationPort;
        }
      };
      let httpClientUuidList = await logicalTerminationPoint.getUuidListForTheProtocol(layerProtocol.layerProtocolNameEnum.HTTP_CLIENT);
      for (let i = 0; i < httpClientUuidList.length; i++) {
        let httpClientUuid = httpClientUuidList[i];
        let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
        let applicationReleaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
        let serverLtp = await logicalTerminationPoint.getServerLtpList(httpClientUuid);
        let tcpClientUuid = serverLtp[0];
        let applicationAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
        let applicationPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
        let clientApplication = new clientApplicationInformation(applicationName, applicationReleaseNumber, applicationAddress, applicationPort);
        clientApplicationList.push(clientApplication);
      }
      resolve(clientApplicationList);
    } catch (error) {
      reject();
    }
  });
}

/**
 * @description This function returns list of registered application information application-name , release-number.
 * @return {Promise} return the list of application information
 * <b><u>Procedure :</u></b><br>
 * <b>step 1 :</b> get all http client Interface and get the application name, release number and server-ltp<br>
 * <b>step 2 :</b> get the ipaddress and port name of each associated tcp-client <br>
 **/
function getAllRegisteredApplicationNameAndReleaseList() {
  return new Promise(async function (resolve, reject) {
    let clientApplicationList = [];
    try {
      let httpClientUuidList = await logicalTerminationPoint.getUuidListForTheProtocol(layerProtocol.layerProtocolNameEnum.HTTP_CLIENT);
      for (let i = 0; i < httpClientUuidList.length; i++) {
        let clientApplication = {};
        let httpClientUuid = httpClientUuidList[i];
        let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
        let applicationReleaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
        clientApplication["application-name"] = applicationName;
        clientApplication["release-number"] = applicationReleaseNumber;
        clientApplicationList.push(clientApplication);
      }
      resolve(clientApplicationList);
    } catch (error) {
      reject();
    }
  });
}