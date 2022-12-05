'use strict';

const LogicalTerminatinPointConfigurationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationInput');
const LogicalTerminationPointService = require('onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServices');
const LogicalTerminationPointConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationStatus');
const layerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');

const ForwardingConfigurationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructConfigurationServices');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const prepareForwardingConfiguration = require('./individualServices/PrepareForwardingConfiguration');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const softwareUpgrade = require('./individualServices/SoftwareUpgrade');
const ConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/ConfigurationStatus');

const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const operationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');

const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const consequentAction = require('onf-core-model-ap/applicationPattern/rest/server/responseBody/ConsequentAction');
const responseValue = require('onf-core-model-ap/applicationPattern/rest/server/responseBody/ResponseValue');

const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');


const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const TcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');

const MonitorTypeApprovalChannel = require('./individualServices/MonitorTypeApprovalChannel');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const ResponseProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/ResponseProfile');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
/**
 * Initiates process of embedding a new release
 *
 * body V1_bequeathyourdataanddie_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.bequeathYourDataAndDie = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["new-application-name"];
      let releaseNumber = body["new-application-release"];
      let applicationAddress = body["new-application-address"];
      let applicationPort = body["new-application-port"];

      /****************************************************************************************
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/
      let isdataTransferRequired = true;
      let newReleaseUuid = await httpClientInterface.getHttpClientUuidAsync("NewRelease");
      let currentApplicationName = await httpServerInterface.getApplicationNameAsync();
      if (currentApplicationName == applicationName) {
        let isUpdated = await httpClientInterface.setReleaseNumberAsync(newReleaseUuid, releaseNumber);
        let currentApplicationRemoteAddress = await TcpServerInterface.getLocalAddress();
        let currentApplicationRemotePort = await TcpServerInterface.getLocalPort();
        if ((applicationAddress == currentApplicationRemoteAddress) &&
          (applicationPort == currentApplicationRemotePort)) {
          isdataTransferRequired = false;
        }
        if (isUpdated) {
          applicationName = await httpClientInterface.getApplicationNameAsync(newReleaseUuid);
          let operationList = [];
          let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
            applicationName,
            releaseNumber,
            applicationAddress,
            applicationPort,
            operationList
          );
          let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
            logicalTerminatinPointConfigurationInput
          );

          /****************************************************************************************
           * Prepare attributes to automate forwarding-construct
           ****************************************************************************************/
          let forwardingAutomationInputList = await prepareForwardingAutomation.bequeathYourDataAndDie(
            logicalTerminationPointconfigurationStatus
          );
          ForwardingAutomationService.automateForwardingConstructAsync(
            operationServerName,
            forwardingAutomationInputList,
            user,
            xCorrelator,
            traceIndicator,
            customerJourney
          );
        }
      }
      softwareUpgrade.upgradeSoftwareVersion(isdataTransferRequired, user, xCorrelator, traceIndicator, customerJourney)
        .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Removes an application
 *
 * body V1_deregisterapplication_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.deregisterApplication = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let applicationReleaseNumber = body["application-release-number"];

      /****************************************************************************************
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.deleteApplicationInformationAsync(
        applicationName,
        applicationReleaseNumber
      );

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/

      let forwardingConfigurationInputList = [];
      let forwardingConstructConfigurationStatus;
      let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

      if (operationClientConfigurationStatusList) {
        forwardingConfigurationInputList = await prepareForwardingConfiguration.deregisterApplication(
          operationClientConfigurationStatusList
        );
        forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
        unConfigureForwardingConstructAsync(
          operationServerName,
          forwardingConfigurationInputList
        );
      }
      await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, applicationReleaseNumber);
      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareForwardingAutomation.deregisterApplication(
        logicalTerminationPointconfigurationStatus,
        forwardingConstructConfigurationStatus,
        applicationName,
        applicationReleaseNumber
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Offers subscribing to notifications about new registrations
 *
 * body V1_inquireapplicationtypeapprovals_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.inquireApplicationTypeApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/
      let httpClientUuidOfExistingTypeApprovalApplication = "ro-0-0-1-http-c-2030";
      let existingTypeApprovalApplicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuidOfExistingTypeApprovalApplication);
      if (applicationName == existingTypeApprovalApplicationName) {
        let operationList = [
          subscriberOperation
        ];
        let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
          applicationName,
          releaseNumber,
          applicationAddress,
          applicationPort,
          operationList
        );
        let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
          logicalTerminatinPointConfigurationInput
        );


        /****************************************************************************************
         * Prepare attributes to configure forwarding-construct
         ****************************************************************************************/

        let forwardingConfigurationInputList = [];
        let forwardingConstructConfigurationStatus;
        let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

        if (operationClientConfigurationStatusList) {
          forwardingConfigurationInputList = await prepareForwardingConfiguration.inquireApplicationTypeApprovals(
            operationClientConfigurationStatusList,
            subscriberOperation
          );
          forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
          configureForwardingConstructAsync(
            operationServerName,
            forwardingConfigurationInputList
          );
        }

        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         ****************************************************************************************/
        let forwardingAutomationInputList = await prepareForwardingAutomation.inquireApplicationTypeApprovals(
          logicalTerminationPointconfigurationStatus,
          forwardingConstructConfigurationStatus
        );
        ForwardingAutomationService.automateForwardingConstructAsync(
          operationServerName,
          forwardingAutomationInputList,
          user,
          xCorrelator,
          traceIndicator,
          customerJourney
        );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Provides list of applications
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns List
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
 * Provides list of applications in generic representation
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_2
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
 * Offers subscribing to notifications about new approvals
 *
 * body V1_notifyapprovals_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      let operationList = [
        subscriberOperation
      ];
      let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
        applicationName,
        releaseNumber,
        applicationAddress,
        applicationPort,
        operationList
      );
      let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
        logicalTerminatinPointConfigurationInput
      );


      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/

      let forwardingConfigurationInputList = [];
      let forwardingConstructConfigurationStatus;
      let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

      if (operationClientConfigurationStatusList) {
        forwardingConfigurationInputList = await prepareForwardingConfiguration.notifyApprovals(
          operationClientConfigurationStatusList,
          subscriberOperation
        );
        forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
        configureForwardingConstructAsync(
          operationServerName,
          forwardingConfigurationInputList
        );
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareForwardingAutomation.notifyApprovals(
        logicalTerminationPointconfigurationStatus,
        forwardingConstructConfigurationStatus
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Offers subscribing to notifications about withdrawn registrations
 *
 * body V1_notifyderegistrations_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyDeregistrations = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      let operationList = [
        subscriberOperation
      ];
      let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
        applicationName,
        releaseNumber,
        applicationAddress,
        applicationPort,
        operationList
      );
      let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
        logicalTerminatinPointConfigurationInput
      );


      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/

      let forwardingConfigurationInputList = [];
      let forwardingConstructConfigurationStatus;
      let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

      if (operationClientConfigurationStatusList) {
        forwardingConfigurationInputList = await prepareForwardingConfiguration.notifyDeregistrations(
          operationClientConfigurationStatusList,
          subscriberOperation
        );
        forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
        configureForwardingConstructAsync(
          operationServerName,
          forwardingConfigurationInputList
        );
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareForwardingAutomation.notifyDeregistrations(
        logicalTerminationPointconfigurationStatus,
        forwardingConstructConfigurationStatus
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Offers subscribing to notifications about withdrawn approvals
 *
 * body V1_notifywithdrawnapprovals_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyWithdrawnApprovals = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      let operationList = [
        subscriberOperation
      ];
      let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
        applicationName,
        releaseNumber,
        applicationAddress,
        applicationPort,
        operationList
      );
      let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
        logicalTerminatinPointConfigurationInput
      );


      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/

      let forwardingConfigurationInputList = [];
      let forwardingConstructConfigurationStatus;
      let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

      if (operationClientConfigurationStatusList) {
        forwardingConfigurationInputList = await prepareForwardingConfiguration.notifyWithdrawnApprovals(
          operationClientConfigurationStatusList,
          subscriberOperation
        );
        forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
        configureForwardingConstructAsync(
          operationServerName,
          forwardingConfigurationInputList
        );
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareForwardingAutomation.notifyWithdrawnApprovals(
        logicalTerminationPointconfigurationStatus,
        forwardingConstructConfigurationStatus
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Adds to the list of known applications
 *
 * body V1_registerapplication_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.registerApplication = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
      let clientOperationUpdateOperation = body["operation-client-update-operation"];


      /****************************************************************************************
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      let operationList = [
        embeddingOperation,
        clientUpdateOperation,
        clientOperationUpdateOperation
      ];
      let logicalTerminatinPointConfigurationInput = new LogicalTerminatinPointConfigurationInput(
        applicationName,
        releaseNumber,
        applicationAddress,
        applicationPort,
        operationList
      );
      let logicalTerminationPointconfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationInformationAsync(
        logicalTerminatinPointConfigurationInput
      );


      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       ****************************************************************************************/

      let forwardingConfigurationInputList = [];
      let forwardingConstructConfigurationStatus;
      let operationClientConfigurationStatusList = logicalTerminationPointconfigurationStatus.operationClientConfigurationStatusList;

      if (operationClientConfigurationStatusList) {
        forwardingConfigurationInputList = await prepareForwardingConfiguration.registerApplication(
          operationClientConfigurationStatusList,
          embeddingOperation
        );
        forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
        configureForwardingConstructAsync(
          operationServerName,
          forwardingConfigurationInputList
        );
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      let forwardingAutomationInputList = await prepareForwardingAutomation.registerApplication(
        logicalTerminationPointconfigurationStatus,
        forwardingConstructConfigurationStatus,
        applicationName,
        releaseNumber
      );
      ForwardingAutomationService.automateForwardingConstructAsync(
        operationServerName,
        forwardingAutomationInputList,
        user,
        xCorrelator,
        traceIndicator,
        customerJourney
      );
      MonitorTypeApprovalChannel.AddEntryToMonitorApprovalStatusChannel(applicationName, releaseNumber);
      includeGenericResponseProfile(applicationName, releaseNumber);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Offers broadcasting of information about backward compatible operations
 *
 * body V1_relayoperationupdate_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.relayOperationUpdate = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let applicationReleaseNumber = body["application-release-number"];
      let oldOperationName = body["old-operation-name"];
      let newOperationName = body["new-operation-name"];

      /****************************************************************************************
       * decision making before proceeding with relay the server information
       ****************************************************************************************/
      let isRequestEligibleForRelaying = true;
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidAsync(applicationName, applicationReleaseNumber);
      if (oldOperationName == newOperationName) {
        isRequestEligibleForRelaying = false;
      } else if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        let updateClientOperationName = "/v1/update-operation-client";
        let operationClientUuidOfUpdateClientOperationName = await operationClientInterface.getOperationClientUuidAsync(
          httpClientUuidOfNewApplication,
          updateClientOperationName
        );
        let forwardingConstructUuidOfOperationUpdateBroadcast = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(
          "OperationUpdateBroadcast");
        let forwardingConstructUuidOfOperationUpdateBroadcastUuid = forwardingConstructUuidOfOperationUpdateBroadcast[onfAttributes.GLOBAL_CLASS.UUID];
        let isFcPortExistsForUpdateOperationClientOperationName = await ForwardingConstruct.isFcPortExistsAsync(
          forwardingConstructUuidOfOperationUpdateBroadcastUuid,
          operationClientUuidOfUpdateClientOperationName
        );
        if (!isFcPortExistsForUpdateOperationClientOperationName) {
          isRequestEligibleForRelaying = false;
        }
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isRequestEligibleForRelaying) {
        let forwardingAutomationInputList;

        forwardingAutomationInputList = await prepareForwardingAutomation.relayOperationUpdate(
          applicationName,
          applicationReleaseNumber,
          oldOperationName,
          newOperationName
        );

        if (forwardingAutomationInputList) {
          ForwardingAutomationService.automateForwardingConstructAsync(
            operationServerName,
            forwardingAutomationInputList,
            user,
            xCorrelator,
            traceIndicator,
            customerJourney
          );
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Offers broadcasting of information about updated serving application
 *
 * body V1_relayserverreplacement_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.relayServerReplacement = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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
       * decision making before proceeding with relay the server information
       ****************************************************************************************/
      let isRequestEligibleForRelaying = true;
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidAsync(applicationName, newApplicationReleaseNumber);
      if (oldApplicationReleaseNumber == newApplicationReleaseNumber) {
        isRequestEligibleForRelaying = false;
      } else if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        let updateClientOperationName = "/v1/update-client";
        let operationClientUuidOfUpdateClientOperationName = await operationClientInterface.getOperationClientUuidAsync(
          httpClientUuidOfNewApplication,
          updateClientOperationName
        );
        let forwardingConstructUuidOfServerReplacementBroadcast = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(
          "ServerReplacementBroadcast");
        let forwardingConstructUuidOfServerReplacementBroadcastUuid = forwardingConstructUuidOfServerReplacementBroadcast[onfAttributes.GLOBAL_CLASS.UUID];
        let isFcPortExistsForUpdateClientOperationName = await ForwardingConstruct.isFcPortExistsAsync(
          forwardingConstructUuidOfServerReplacementBroadcastUuid,
          operationClientUuidOfUpdateClientOperationName
        );
        if (!isFcPortExistsForUpdateClientOperationName) {
          isRequestEligibleForRelaying = false;
        }
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isRequestEligibleForRelaying) {
        let forwardingAutomationInputList;

        forwardingAutomationInputList = await prepareForwardingAutomation.relayServerReplacement(
          applicationName,
          oldApplicationReleaseNumber,
          newApplicationReleaseNumber,
          newApplicationAddress,
          newApplicationPort
        );

        if (forwardingAutomationInputList) {
          ForwardingAutomationService.automateForwardingConstructAsync(
            operationServerName,
            forwardingAutomationInputList,
            user,
            xCorrelator,
            traceIndicator,
            customerJourney
          );
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Starts application in generic representation
 *
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200
 **/
exports.startApplicationInGenericRepresentation = function (user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    let response = {};
    try {
      /****************************************************************************************
       * Preparing consequent-action-list for response body
       ****************************************************************************************/
      let consequentActionList = [];

      let protocol = "http";
      let applicationAddress = await tcpServerInterface.getLocalAddress();
      let applicationPort = await tcpServerInterface.getLocalPort();
      let baseUrl = protocol + "://" + applicationAddress + ":" + applicationPort;

      let LabelForListRegisteredApplication = "List Registered Applications";
      let requestForListRegisteredApplication = baseUrl + await operationServerInterface.getOperationNameAsync("ro-0-0-1-op-s-3005");
      let consequentActionForListRegisteredApplication = new consequentAction(
        LabelForListRegisteredApplication,
        requestForListRegisteredApplication,
        false
      );
      consequentActionList.push(consequentActionForListRegisteredApplication);

      let LabelForInformAboutApplication = "Inform about Application";
      let requestForInformAboutApplication = baseUrl + await operationServerInterface.getOperationNameAsync("ro-0-0-1-op-s-2002");
      let consequentActionForInformAboutApplication = new consequentAction(
        LabelForInformAboutApplication,
        requestForInformAboutApplication,
        false
      );
      consequentActionList.push(consequentActionForInformAboutApplication);

      /****************************************************************************************
       * Preparing response-value-list for response body
       ****************************************************************************************/
      let responseValueList = [];
      let applicationName = await httpServerInterface.getApplicationNameAsync();
      let reponseValue = new responseValue(
        "applicationName",
        applicationName,
        typeof applicationName
      );
      responseValueList.push(reponseValue);

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
 * Updates the approval status of an already registered application
 *
 * body V1_regardupdatedapprovalstatus_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.updateApprovalStatus = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
    try {

      /****************************************************************************************
       * Setting up required local variables from the request body
       ****************************************************************************************/
      let applicationName = body["application-name"];
      let releaseNumber = body["application-release-number"];
      let approvalStatus = body["approval-status"];
      let updateClientOperationName = 'update-client';
      let updateOperationClientOperationName = 'update-operation-client';
      let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName,
        releaseNumber);

      /****************************************************************************************
       * Prepare attributes to configure forwarding-construct
       * If the approval status is approved , then create forwarding construct for update-operation-client and update-client
       * If the approval status is not barred , check if any fc-port created, if so delete them 
       ****************************************************************************************/
      let forwardingConstructConfigurationStatus;

      if (httpClientUuid) {
        let operationClientUuidList = await logicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
        let operationListForConfiguration = [];
        let forwardingConfigurationInputList;
        if (operationClientUuidList) {

          for (let i = 0; i < operationClientUuidList.length; i++) {
            let operationClientUuid = operationClientUuidList[i];
            let operationName = await operationClientInterface.getOperationNameAsync(operationClientUuid);

            if (operationName.includes(updateClientOperationName)) {
              updateClientOperationName = operationName;
              operationListForConfiguration.push(operationClientUuid);
            } else if (operationName.includes(updateOperationClientOperationName)) {
              updateOperationClientOperationName = operationName;
              operationListForConfiguration.push(operationClientUuid);
            }
          }

          if (operationListForConfiguration.length > 0) {
            forwardingConfigurationInputList = await prepareForwardingConfiguration.updateApprovalStatus(
              operationListForConfiguration,
              updateClientOperationName,
              updateOperationClientOperationName
            );

            if (approvalStatus == 'APPROVED') {
              forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
              configureForwardingConstructAsync(
                operationServerName,
                forwardingConfigurationInputList
              );
              await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, releaseNumber);
            } else if (approvalStatus == 'BARRED') {
              forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
              unConfigureForwardingConstructAsync(
                operationServerName,
                forwardingConfigurationInputList
              );
            }

          }
        }
      }


      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       * If the approval status is approved , then embed-yourself, regard-application will be executed
       * If the approval status is barred , then disregard-application will be executed
       ****************************************************************************************/
      let forwardingAutomationInputList;
      if (approvalStatus == 'APPROVED') {
        forwardingAutomationInputList = await prepareForwardingAutomation.updateApprovalStatusApproved(
          undefined,
          forwardingConstructConfigurationStatus,
          applicationName,
          releaseNumber
        );
      } else if (approvalStatus == 'BARRED') {
        forwardingAutomationInputList = await prepareForwardingAutomation.updateApprovalStatusBarred(
          undefined,
          forwardingConstructConfigurationStatus,
          applicationName,
          releaseNumber
        );
      }
      if (forwardingAutomationInputList) {
        ForwardingAutomationService.automateForwardingConstructAsync(
          operationServerName,
          forwardingAutomationInputList,
          user,
          xCorrelator,
          traceIndicator,
          customerJourney
        );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/****************************************************************************************
 * Functions utilized by individual services
 ****************************************************************************************/

/**
 * @description This function returns list of registered application information application-name , release-number, application-address, application-port.
 * @return {Promise} return the list of application information
 * <b><u>Procedure :</u></b><br>
 * <b>step 1 :</b> Get forwarding-construct based on ForwardingName
 * <b>step 2 :</b> Get forwarding-construct UUID
 * <b>step 3 :</b> Get fc-port list using forwarding-construct UUID
 * <b>step 4 :</b> Fetch http-client-list using logical-termination-point uuid from fc-port
 * <b>step 5 :</b> get the application name, release number and server-ltp<br>
 * <b>step 6 :</b> get the ipaddress and port name of each associated tcp-client <br>
 **/
function getAllRegisteredApplicationList() {
  return new Promise(async function (resolve, reject) {
    let clientApplicationList = [];
    const forwardingName = "ServerReplacementBroadcast";
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
      let forwardingConstructForTheForwardingName = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let forwardingConstructUuid = forwardingConstructForTheForwardingName[onfAttributes.GLOBAL_CLASS.UUID];
      let fcPortList = await ForwardingConstruct.getFcPortListAsync(forwardingConstructUuid);
      let httpClientUuidList = []

      for (let fcPortIndex = 0; fcPortIndex < fcPortList.length; fcPortIndex++) {
        if (fcPortList[fcPortIndex][onfAttributes.FC_PORT.PORT_DIRECTION] === FcPort.portDirectionEnum.OUTPUT) {
          let serverLtpList = await logicalTerminationPoint.getServerLtpListAsync(fcPortList[fcPortIndex][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT])
          httpClientUuidList = httpClientUuidList.concat(serverLtpList)
        }
      }

      for (let i = 0; i < httpClientUuidList.length; i++) {
        let httpClientUuid = httpClientUuidList[i];
        let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
        let applicationReleaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
        let serverLtp = await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid);
        let tcpClientUuid = serverLtp[0];
        let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
        let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);
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
 * <b>step 1 :</b> Get forwarding-construct based on ForwardingName
 * <b>step 2 :</b> Get forwarding-construct UUID
 * <b>step 3 :</b> Get fc-port list using forwarding-construct UUID
 * <b>step 4 :</b> Fetch http-client-list using logical-termination-point uuid from fc-port
 * <b>step 5 :</b> get the application name, release number and server-ltp<br>
 * <b>step 6 :</b> get the ipaddress and port name of each associated tcp-client <br>
 **/
function getAllRegisteredApplicationNameAndReleaseList() {
  return new Promise(async function (resolve, reject) {
    let clientApplicationList = [];
    const forwardingName = "ServerReplacementBroadcast";
    try {
      let forwardingConstructForTheForwardingName = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let forwardingConstructUuid = forwardingConstructForTheForwardingName[onfAttributes.GLOBAL_CLASS.UUID];
      let fcPortList = await ForwardingConstruct.getFcPortListAsync(forwardingConstructUuid);
      let httpClientUuidList = []

      for (let fcPortIndex = 0; fcPortIndex < fcPortList.length; fcPortIndex++) {
        if (fcPortList[fcPortIndex][onfAttributes.FC_PORT.PORT_DIRECTION] === FcPort.portDirectionEnum.OUTPUT) {
          let serverLtpList = await logicalTerminationPoint.getServerLtpListAsync(fcPortList[fcPortIndex][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT])
          httpClientUuidList = httpClientUuidList.concat(serverLtpList)
        }
      }

      for (let i = 0; i < httpClientUuidList.length; i++) {
        let clientApplication = {};
        let httpClientUuid = httpClientUuidList[i];
        let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
        let applicationReleaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
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


/**
 * @description This function includes a new response profile if not exists for a registered application
 * @return {Promise} return true if operation is successful
 **/
function includeGenericResponseProfile(applicationName, releaseNumber) {
  return new Promise(async function (resolve, reject) {
    let isUpdated = true;
    try {
      let httpClientUuid = await HttpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
      if (httpClientUuid != undefined) {
        let applicationNameReference = onfPaths.HTTP_CLIENT_APPLICATION_NAME.replace("{uuid}", httpClientUuid);
        let isResponseProfileAlreadyExist = await ResponseProfile.findProfileUuidForFieldNameReferenceAsync(applicationNameReference);
        if (!isResponseProfileAlreadyExist) {
          let releaseNumberReference = onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", httpClientUuid);
          let operationName = "/v1/list-applications-in-generic-representation";
          let description = "List of registered application names and release numbers";
          let datatype = "string";
          let responseProfile = await ResponseProfile.createProfileAsync(operationName,
            applicationNameReference,
            description,
            datatype,
            releaseNumberReference);
          isUpdated = await ProfileCollection.addProfileAsync(responseProfile);
        }
      }
      resolve(isUpdated);
    } catch (error) {
      reject();
    }
  });
}