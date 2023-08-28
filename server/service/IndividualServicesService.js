'use strict';

const LogicalTerminationPointConfigurationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationInput');
const LogicalTerminationPointService = require('onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServices');
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
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const MonitorTypeApprovalChannel = require('./individualServices/MonitorTypeApprovalChannel');
const ApplicationPreceedingVersion = require('./individualServices/ApplicationPreceedingVersion');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const ResponseProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/ResponseProfile');
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const individualServicesOperationsMapping = require('./individualServices/IndividualServicesOperationsMapping');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const genericRepresentation = require('onf-core-model-ap-bs/basicServices/GenericRepresentation');
const createHttpError = require('http-errors');
const TcpObject = require('onf-core-model-ap/applicationPattern/onfModel/services/models/TcpObject');

const NEW_RELEASE_FORWARDING_NAME = 'PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications';

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
      let applicationProtocol = body["new-application-protocol"];
      let applicationAddress = body["new-application-address"];
      let applicationPort = body["new-application-port"];

      /****************************************************************************************
       * Prepare logicalTerminatinPointConfigurationInput object to 
       * configure logical-termination-point
       ****************************************************************************************/

      const appNameAndUuidFromForwarding = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName('PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals');
      if (appNameAndUuidFromForwarding?.httpClientLtpUuid == undefined) {
        reject(new createHttpError.BadRequest(`The new-release ${applicationName} was not found.`));
        return;
      }

      
      let logicalTerminationPointConfigurationStatus = {};
      let newReleaseHttpClientLtpUuid = appNameAndUuidFromForwarding.httpClientLtpUuid;
      if (newReleaseHttpClientLtpUuid != undefined) {
        let isReleaseUpdated = await httpClientInterface.setReleaseNumberAsync(newReleaseHttpClientLtpUuid, releaseNumber);
        let isApplicationNameUpdated = await httpClientInterface.setApplicationNameAsync(newReleaseHttpClientLtpUuid, applicationName);

        if (isReleaseUpdated || isApplicationNameUpdated) {
          let configurationStatus = new ConfigurationStatus(
            newReleaseHttpClientLtpUuid,
            undefined,
            true);
          logicalTerminationPointConfigurationStatus.httpClientConfigurationStatus = configurationStatus;
        }
        // ALT should know about this change

        let newReleaseTcpClientUuidList = await logicalTerminationPoint.getServerLtpListAsync(newReleaseHttpClientLtpUuid);
        let newReleaseTcpClientUuid = newReleaseTcpClientUuidList[0];

        let isProtocolUpdated = await tcpClientInterface.setRemoteProtocolAsync(newReleaseTcpClientUuid, applicationProtocol);
        let isAddressUpdated = await tcpClientInterface.setRemoteAddressAsync(newReleaseTcpClientUuid, applicationAddress);
        let isPortUpdated = await tcpClientInterface.setRemotePortAsync(newReleaseTcpClientUuid, applicationPort);

        if (isProtocolUpdated || isAddressUpdated || isPortUpdated) {
          let configurationStatus = new ConfigurationStatus(
            newReleaseTcpClientUuid,
            undefined,
            true);
          logicalTerminationPointConfigurationStatus.tcpClientConfigurationStatusList = [configurationStatus];
        }
        let forwardingAutomationInputList;
        if (logicalTerminationPointConfigurationStatus != undefined) {

          /****************************************************************************************
           * Prepare attributes to automate forwarding-construct
           ****************************************************************************************/
          forwardingAutomationInputList = await prepareForwardingAutomation.bequeathYourDataAndDie(
            logicalTerminationPointConfigurationStatus
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
      softwareUpgrade.upgradeSoftwareVersion(user, xCorrelator, traceIndicator, customerJourney,forwardingAutomationInputList.length)
        .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));

      }
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
exports.deregisterApplication = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["application-name"];
  let applicationReleaseNumber = body["release-number"];

  await excludeGenericResponseProfile(applicationName, applicationReleaseNumber);
  let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
    applicationName,
    applicationReleaseNumber,
    NEW_RELEASE_FORWARDING_NAME
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.deleteApplicationLtpsAsync(
    httpClientUuid
  );

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

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
  await ApplicationPreceedingVersion.removeEntryFromPrecedingVersionList(applicationName, applicationReleaseNumber);
  /****************************************************************************************
   * Prepare attributes to automate forwarding-construct
   ****************************************************************************************/
  let forwardingAutomationInputList = await prepareForwardingAutomation.deregisterApplication(
    ltpConfigurationStatus,
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
exports.inquireApplicationTypeApprovals = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["approval-application"];
  let releaseNumber = body["approval-application-release-number"];
  let applicationProtocol = body["approval-application-protocol"];
  let applicationAddress = body["approval-application-address"];
  let applicationPort = body["approval-application-port"];
  let approvalOperation = body["approval-operation"];

  const appNameAndUuidFromForwarding = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName('RegistrationCausesInquiryForApplicationTypeApproval');
  if (appNameAndUuidFromForwarding?.applicationName !== applicationName) {
    throw new createHttpError.BadRequest(`The approval-application ${applicationName} was not found.`);
  }

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/

  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("approval-operation", approvalOperation);

  let tcpObjectList = [new TcpObject(applicationProtocol, applicationAddress, applicationPort)];

  let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName, releaseNumber
  );
  let logicalTerminationPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObjectList,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus;
  if (httpClientUuid) {
    ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(
      logicalTerminationPointConfigurationInput
    );
  }

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList;
  if (ltpConfigurationStatus) {
    operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;
  }

  if (operationClientConfigurationStatusList) {
    forwardingConfigurationInputList = await prepareForwardingConfiguration.inquireApplicationTypeApprovals(
      operationClientConfigurationStatusList,
      approvalOperation
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
    ltpConfigurationStatus,
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

/**
 * Provides list of applications
 *
 * returns List
 **/
exports.listApplications = async function (body) {
  let applicationList = await getAllRegisteredApplicationList(body["required-protocol"]);
  return onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(applicationList);
}

/**
 * Provides list of applications in generic representation
 * returns inline_response_200_2
 **/
exports.listApplicationsInGenericRepresentation = async function () {
  let consequentActionList = await genericRepresentation.getConsequentActionList("/v1/list-applications-in-generic-representation");
  let responseValueList = await genericRepresentation.getResponseValueList("/v1/list-applications-in-generic-representation");
  return onfAttributeFormatter.modifyJsonObjectKeysToKebabCase({
    consequentActionList,
    responseValueList
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
exports.notifyApprovals = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["subscriber-application"];
  let releaseNumber = body["subscriber-release-number"];
  let applicationProtocol = body["subscriber-protocol"];
  let applicationAddress = body["subscriber-address"];
  let applicationPort = body["subscriber-port"];
  let subscriberOperation = body["subscriber-operation"];

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/

  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("subscriber-operation", subscriberOperation);

  let tcpObjectList = [new TcpObject(applicationProtocol, applicationAddress, applicationPort)];

  let httpClientLtpUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientLtpUuid,
    applicationName,
    releaseNumber,
    tcpObjectList,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(
    logicalTerminatinPointConfigurationInput
  );

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

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
    ltpConfigurationStatus,
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
exports.notifyDeregistrations = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["subscriber-application"];
  let releaseNumber = body["subscriber-release-number"];
  let applicationProtocol = body["subscriber-protocol"];
  let applicationAddress = body["subscriber-address"];
  let applicationPort = body["subscriber-port"];
  let subscriberOperation = body["subscriber-operation"];

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/
  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("subscriber-operation", subscriberOperation);

  let tcpObjectList = [new TcpObject(applicationProtocol, applicationAddress, applicationPort)];

  let httpClientLtpUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientLtpUuid,
    applicationName,
    releaseNumber,
    tcpObjectList,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(
    logicalTerminatinPointConfigurationInput
  );

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

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
    ltpConfigurationStatus,
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
exports.notifyWithdrawnApprovals = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["subscriber-application"];
  let releaseNumber = body["subscriber-release-number"];
  let applicationProtocol = body["subscriber-protocol"];
  let applicationAddress = body["subscriber-address"];
  let applicationPort = body["subscriber-port"];
  let subscriberOperation = body["subscriber-operation"];

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/

  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("subscriber-operation", subscriberOperation);

  let tcpObjectList = [new TcpObject(applicationProtocol, applicationAddress, applicationPort)];

  let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObjectList,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(
    logicalTerminatinPointConfigurationInput
  );

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

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
    ltpConfigurationStatus,
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
exports.registerApplication = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["application-name"];
  let releaseNumber = body["release-number"];
  let tcpServerList = body["tcp-server-list"];
  let embeddingOperation = body["embedding-operation"];
  let clientUpdateOperation = body["client-update-operation"];
  let clientOperationUpdateOperation = body["operation-client-update-operation"];

  let preceedingApplicationName = body["preceding-application-name"];
  let preceedingReleaseNumber = body["preceding-release-number"];

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/
  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("embedding-operation", embeddingOperation);
  operationNamesByAttributes.set("client-update-operation", clientUpdateOperation);
  operationNamesByAttributes.set("operation-client-update-operation", clientOperationUpdateOperation);
  
  let tcpObjectList = [];
  for (let tcpServer of tcpServerList) {
    let tcpObject = new TcpObject(tcpServer.protocol, tcpServer.address, tcpServer.port);
    tcpObjectList.push(tcpObject);
  }

  let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
    applicationName, releaseNumber, NEW_RELEASE_FORWARDING_NAME
  );
  let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObjectList,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(
    logicalTerminatinPointConfigurationInput
  );

  await ApplicationPreceedingVersion.addEntryToPreceedingVersionList(
    preceedingApplicationName,
    preceedingReleaseNumber,
    applicationName,
    releaseNumber
  );
  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

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
    ltpConfigurationStatus,
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
      let releaseNumber = body["release-number"];
      let oldOperationName = body["old-operation-name"];
      let newOperationName = body["new-operation-name"];

      /****************************************************************************************
       * decision making before proceeding with relay the server information
       ****************************************************************************************/
      let isRequestEligibleForRelaying = true;
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
      if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        // check whether application is approved ??
        const appNameAndUuidFromForwarding = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription(
          'ServerReplacementBroadcast',
          applicationName,
          releaseNumber);
        if (appNameAndUuidFromForwarding != httpClientUuidOfNewApplication) {
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
          releaseNumber,
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
      let currentApplicationName = body["current-application-name"];
      let currentReleaseNumber = body["current-release-number"];
      let futureApplicationName = body["future-application-name"];
      let futureReleaseNumber = body["future-release-number"];
      let futureProtocol = body["future-protocol"];
      let futureAddress = body["future-address"];
      let futurePort = body["future-port"];

      /****************************************************************************************
       * decision making before proceeding with relay the server information
       ****************************************************************************************/
      let isRequestEligibleForRelaying = true;
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidAsync(futureApplicationName, futureReleaseNumber);
      if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        // check whether application is approved ??
        const appNameAndUuidFromForwarding = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription(
          'ServerReplacementBroadcast',
          futureApplicationName,
          futureReleaseNumber);
        if (appNameAndUuidFromForwarding != httpClientUuidOfNewApplication) {
          isRequestEligibleForRelaying = false;
        }
      }

      /****************************************************************************************
       * Prepare attributes to automate forwarding-construct
       ****************************************************************************************/
      if (isRequestEligibleForRelaying) {
        let forwardingAutomationInputList;

        forwardingAutomationInputList = await prepareForwardingAutomation.relayServerReplacement(
          currentApplicationName,
          currentReleaseNumber,
          futureApplicationName,
          futureReleaseNumber,
          futureProtocol,
          futureAddress,
          futurePort
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
 * returns inline_response_200
 **/
exports.startApplicationInGenericRepresentation = async function () {
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

  let responseValueList = [];
  let applicationName = await httpServerInterface.getApplicationNameAsync();
  let reponseValue = new responseValue(
    "applicationName",
    applicationName,
    typeof applicationName
  );
  responseValueList.push(reponseValue);
  return onfAttributeFormatter.modifyJsonObjectKeysToKebabCase({
    consequentActionList,
    responseValueList
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
exports.updateApprovalStatus = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["application-name"];
  let releaseNumber = body["release-number"];
  let approvalStatus = body["approval-status"];
  let updateClientOperationName;
  let updateOperationClientOperationName;
  let embeddingOperationName;
  let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName,
    releaseNumber);

  if (approvalStatus == "APPROVED" || approvalStatus == "REGISTERED") {
    let isApplicationExists = await httpClientInterface.isApplicationExists(
      applicationName,
      releaseNumber
    );
    if (!isApplicationExists) {
      throw new createHttpError.BadRequest(`The application-name ${applicationName} was not found.`);
    }
  }

  /****************************************************************************************
   * find the operation client uuid for the operations "update-client" and 'update-operation-client'
   * configure logical-termination-point
   ****************************************************************************************/
  let operationClientUuidList = await LogicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
  if (operationClientUuidList) {
    for (let i = 0; i < operationClientUuidList.length; i++) {
      let operationClientUuid = operationClientUuidList[i];
      let apiSegment = getApiSegmentOfOperationClient(operationClientUuid);
      if (apiSegment == "im") {
        if (operationClientUuid.endsWith("001")) {
          updateClientOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        } else if (operationClientUuid.endsWith("002")) {
          updateOperationClientOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        } else if (operationClientUuid.endsWith("000")) {
          embeddingOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        }
      }
    }
  }
  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   * If the approval status is approved , then create forwarding construct for update-operation-client and update-client
   * If the approval status is not barred , check if any fc-port created, if so delete them 
   ****************************************************************************************/
  let forwardingConstructConfigurationStatus;
  let isApplicationAlreadyApproved

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
          updateOperationClientOperationName,
          embeddingOperationName
        );

        isApplicationAlreadyApproved = await checkApplicationApprovalStatus(operationClientUuidList)

        if (approvalStatus == 'APPROVED') {
          forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
            configureForwardingConstructAsync(
              operationServerName,
              forwardingConfigurationInputList
            );
          await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, releaseNumber);
        }else if (isApplicationAlreadyApproved && approvalStatus == 'REGISTERED') {
          forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
          unConfigureForwardingConstructAsync(
            operationServerName,
            forwardingConfigurationInputList
          );
          await MonitorTypeApprovalChannel.AddEntryToMonitorApprovalStatusChannel(applicationName, releaseNumber);
        } else if (approvalStatus == 'BARRED') {
          let forwardingConfigurationListForBarredApplication = 
              await prepareForwardingConfiguration.updateApprovalStatusBarred(operationClientUuidList);
          forwardingConfigurationInputList.push.apply(forwardingConfigurationInputList, forwardingConfigurationListForBarredApplication);
          forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
          unConfigureForwardingConstructAsync(
            operationServerName,
            forwardingConfigurationInputList,
            true
          );
          await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, releaseNumber);
          await ApplicationPreceedingVersion.removeEntryFromPrecedingVersionList(applicationName, releaseNumber);
        }

      }
    }
  }

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/
  let ltpConfigurationStatus;
  if (approvalStatus == 'BARRED') {
    await excludeGenericResponseProfile(applicationName, releaseNumber);
    let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
      applicationName,
      releaseNumber,
      NEW_RELEASE_FORWARDING_NAME
    );
    ltpConfigurationStatus = await LogicalTerminationPointService.deleteApplicationLtpsAsync(
      httpClientUuid
    );
  }

  /****************************************************************************************
   * Prepare attributes to automate forwarding-construct
   * If the approval status is approved , then embed-yourself, regard-application will be executed
   * If the approval status is barred , then disregard-application will be executed
   ****************************************************************************************/
  let forwardingAutomationInputList;
  if (approvalStatus == 'APPROVED') {
    forwardingAutomationInputList = await prepareForwardingAutomation.updateApprovalStatusApproved(
      ltpConfigurationStatus,
      forwardingConstructConfigurationStatus,
      applicationName,
      releaseNumber
    );
  } else if (approvalStatus == 'BARRED' || (approvalStatus == 'REGISTERED' && isApplicationAlreadyApproved )) {
    forwardingAutomationInputList = await prepareForwardingAutomation.updateApprovalStatusBarred(
      ltpConfigurationStatus,
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
}

/*
* This method is to check if application is APPROVED
*/
async function checkApplicationApprovalStatus(clientLTPs) {
  return new Promise(async function (resolve, reject) {
    try {
      if (clientLTPs.length > 0) {
        let applicationApproved = false
        let fcPortList
        let forwardingConstruct = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync("ServerReplacementBroadcast");
        fcPortList = forwardingConstruct["fc-port"]
        let fcPort = fcPortList.filter(fcport => clientLTPs.includes(fcport["logical-termination-point"]));
        if (fcPort != undefined && fcPort.length > 0) {
          applicationApproved = true
        }
        resolve(applicationApproved)
      }
    } catch (error) {
      reject(error);
    }
  })
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
function getAllRegisteredApplicationList(protocol) {
  return new Promise(async function (resolve, reject) {
    let clientApplicationList = [];
    const forwardingName = "TypeApprovalCausesRequestForEmbedding";
    try {

      /** 
       * This class instantiate objects that holds the application name , release number, 
       * IpAddress and port information of the registered client applications
       */
      let clientApplicationInformation = class ClientApplicationInformation {

        /**
         * @constructor 
         * @param {String} applicationName name of the client application.
         * @param {String} applicationReleaseNumber release number of the application.
         * @param {String} applicationAddress ip address of the application.
         * @param {String} applicationPort port of the application.
         **/
        constructor(applicationName, applicationReleaseNumber, applicationAddress, applicationPort) {
          this.applicationName = applicationName;
          this.releaseNumber = applicationReleaseNumber;
          if (applicationAddress != undefined) {
            this.address = applicationAddress;
          }
          if (applicationPort != undefined) {
            this.port = applicationPort;
          }
        }
      };
      let forwardingConstructForTheForwardingName = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
      let forwardingConstructUuid = forwardingConstructForTheForwardingName[onfAttributes.GLOBAL_CLASS.UUID];
      let fcPortList = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructUuid);
      let httpClientUuidList = []

      for (let fcPort of fcPortList) {
        let serverLtpList = await logicalTerminationPoint.getServerLtpListAsync(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT])
        httpClientUuidList = httpClientUuidList.concat(serverLtpList)
      }

      for (let i = 0; i < httpClientUuidList.length; i++) {
        let httpClientUuid = httpClientUuidList[i];
        let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
        let applicationReleaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
        if (protocol == undefined) {
          let clientApplication = new clientApplicationInformation(applicationName, applicationReleaseNumber);
          clientApplicationList.push(clientApplication);
        } else {
          let tcpClientUuidList = await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid);
          for (let i = 0; i < tcpClientUuidList.length; i++) {
            let tcpClientUuid = tcpClientUuidList[i];
            let tcpClientProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
            if (tcpClientProtocol.toLowerCase() == protocol.toLowerCase()) {
              let address = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
              let applicationAddress = "domain-name" in address ? address["domain-name"] : address["ip-address"]["ipv-4-address"];
              let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);
              let clientApplication = new clientApplicationInformation(applicationName, applicationReleaseNumber, applicationAddress, applicationPort);
              clientApplicationList.push(clientApplication);
            }
          }
        }
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

/**
 * @description This function excludes an existing response profile if not exists for a registered application
 * @return {Promise} return true if operation is successful
 **/
function excludeGenericResponseProfile(applicationName, releaseNumber) {
  return new Promise(async function (resolve, reject) {
    let isUpdated = true;
    try {
      let httpClientUuid = await HttpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
      if (httpClientUuid != undefined) {
        let applicationNameReference = onfPaths.HTTP_CLIENT_APPLICATION_NAME.replace("{uuid}", httpClientUuid);
        let responseProfileUuid = await ResponseProfile.findProfileUuidForFieldNameReferenceAsync(applicationNameReference);
        if (responseProfileUuid) {
          isUpdated = await ProfileCollection.deleteProfileAsync(responseProfileUuid);
        }
      }
      resolve(isUpdated);
    } catch (error) {
      reject();
    }
  });
}

/**
 * @description This function helps to get the APISegment of the operationClient uuid
 * @return {Promise} returns the APISegment
 **/
function getApiSegmentOfOperationClient(operationClientUuid) {
  let APISegment;
  try {
    APISegment = operationClientUuid.split("-")[6];
  } catch (error) {
    console.log("error in extracting the APISegment");
  }
  return APISegment;
}

async function resolveApplicationNameAndHttpClientLtpUuidFromForwardingName(forwardingName) {
  const forwardingConstruct = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  if (forwardingConstruct === undefined) {
    return null;
  }

  let fcPortOutputDirectionLogicalTerminationPointList = [];
  const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (const fcPort of fcPortList) {
    const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
      fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
    }
  }

  if (fcPortOutputDirectionLogicalTerminationPointList.length !== 1) {
    return null;
  }

  const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[0];
  const httpLtpUuidList = await LogicalTerminationPoint.getServerLtpListAsync(opLtpUuid);
  const httpClientLtpUuid = httpLtpUuidList[0];
  const applicationName = await httpClientInterface.getApplicationNameAsync(httpClientLtpUuid);
  return applicationName === undefined ? {
    applicationName: null,
    httpClientLtpUuid
  } : {
    applicationName,
    httpClientLtpUuid
  };
}


async function resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription(forwardingName, applicationName, releaseNumber) {
  let httpClientUuidOfTheSubscribedApplication = undefined;
  const forwardingConstruct = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
  if (forwardingConstruct === undefined) {
    return null;
  }

  let fcPortOutputDirectionLogicalTerminationPointList = [];
  const fcPortList = forwardingConstruct[onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
  for (const fcPort of fcPortList) {
    const portDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
    if (FcPort.portDirectionEnum.OUTPUT === portDirection) {
      fcPortOutputDirectionLogicalTerminationPointList.push(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT]);
    }
  }

  if (fcPortOutputDirectionLogicalTerminationPointList.length == 0) {
    return null;
  }

  for (let i = 0; i < fcPortOutputDirectionLogicalTerminationPointList.length; i++) {
    const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[i];
    const httpLtpUuidList = await LogicalTerminationPoint.getServerLtpListAsync(opLtpUuid);
    const httpClientLtpUuid = httpLtpUuidList[0];
    const _applicationName = await httpClientInterface.getApplicationNameAsync(httpClientLtpUuid);
    const _releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientLtpUuid);
    if (_applicationName == applicationName && _releaseNumber == releaseNumber) {
      httpClientUuidOfTheSubscribedApplication = httpClientLtpUuid;
    }
  }
  return httpClientUuidOfTheSubscribedApplication;
}
