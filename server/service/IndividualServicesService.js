// @ts-check
'use strict';

const LogicalTerminationPointConfigurationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/logicalTerminationPoint/ConfigurationInputV2');
const LogicalTerminationPointService = require('onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServicesV2');
const ServiceUtils = require('onf-core-model-ap-bs/basicServices/utility/LogicalTerminationPoint');
const ForwardingConfigurationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructConfigurationServices');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const prepareForwardingConfiguration = require('./individualServices/PrepareForwardingConfiguration');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const softwareUpgrade = require('./individualServices/SoftwareUpgrade');
const ConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/ConfigurationStatus');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const consequentAction = require('onf-core-model-ap/applicationPattern/rest/server/responseBody/ConsequentAction');
const responseValue = require('onf-core-model-ap/applicationPattern/rest/server/responseBody/ResponseValue');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const MonitorTypeApprovalChannel = require('./individualServices/MonitorTypeApprovalChannel');
const ApplicationPreceedingVersion = require('./individualServices/ApplicationPreceedingVersion');
const individualServicesOperationsMapping = require('./individualServices/IndividualServicesOperationsMapping');
const genericRepresentation = require('onf-core-model-ap-bs/basicServices/GenericRepresentation');
const createHttpError = require('http-errors');
const TcpObject = require('onf-core-model-ap/applicationPattern/onfModel/services/models/TcpObject');
const RegardUpdatedApprovalProcess = require('./individualServices/RegardUpdatedApprovalProcess');
const IndividualServicesUtility = require('./individualServices/IndividualServicesUtility');

const NEW_RELEASE_FORWARDING_NAME = 'PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications';
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

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
exports.bequeathYourDataAndDie = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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

    const newReleaseApplicationName = await ServiceUtils.resolveApplicationNameFromForwardingAsync("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");
    if (newReleaseApplicationName === undefined) {
      throw new createHttpError.BadRequest(`The new-release ${applicationName} was not found.`);
    }

    let ltpConfigurationStatus = {};
    let newReleaseHttpClientLtpUuid = await httpClientInterface.getHttpClientUuidFromForwarding("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");
    if (newReleaseHttpClientLtpUuid != undefined) {
      let isReleaseUpdated = await httpClientInterface.setReleaseNumberAsync(newReleaseHttpClientLtpUuid, releaseNumber);
      let isApplicationNameUpdated = await httpClientInterface.setApplicationNameAsync(newReleaseHttpClientLtpUuid, applicationName);

      if (isReleaseUpdated || isApplicationNameUpdated) {
        let configurationStatus = new ConfigurationStatus(
          newReleaseHttpClientLtpUuid,
          '',
          true);
        ltpConfigurationStatus.httpClientConfigurationStatus = configurationStatus;
      }

      let newReleaseTcpClientUuidList = await logicalTerminationPoint.getServerLtpListAsync(newReleaseHttpClientLtpUuid);
      let newReleaseTcpClientUuid = newReleaseTcpClientUuidList[0];

      let isProtocolUpdated = await tcpClientInterface.setRemoteProtocolAsync(newReleaseTcpClientUuid, applicationProtocol);
      let isAddressUpdated = await tcpClientInterface.setRemoteAddressAsync(newReleaseTcpClientUuid, applicationAddress);
      let isPortUpdated = await tcpClientInterface.setRemotePortAsync(newReleaseTcpClientUuid, applicationPort);

      if (isProtocolUpdated || isAddressUpdated || isPortUpdated) {
        let configurationStatus = new ConfigurationStatus(
          newReleaseTcpClientUuid,
          '',
          true);
        ltpConfigurationStatus.tcpClientConfigurationStatusList = [configurationStatus];
      }
      let forwardingAutomationInputList;
      if (ltpConfigurationStatus != undefined) {

        /****************************************************************************************
          * Prepare attributes to automate forwarding-construct
          ****************************************************************************************/
        forwardingAutomationInputList = await prepareForwardingAutomation.bequeathYourDataAndDie(
          ltpConfigurationStatus
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
      softwareUpgrade.upgradeSoftwareVersion(user, xCorrelator, traceIndicator, customerJourney, forwardingAutomationInputList.length)
        .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));
    }
  } catch (error) {
    console.log(`bequeathing process failed with error: ${error}`);
  }
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

  await IndividualServicesUtility.excludeGenericResponseProfile(applicationName, applicationReleaseNumber);
  let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
    applicationName,
    applicationReleaseNumber,
    NEW_RELEASE_FORWARDING_NAME
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.deleteApplicationLtpsAsync(
    httpClientUuid
  );

  /****************************************************************************************
   * Prepare attributes to remove fc-ports from forwarding-construct
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

  const tarApplicationName = await ServiceUtils.resolveApplicationNameFromForwardingAsync("RegistrationCausesInquiryForApplicationTypeApproval");
  if (tarApplicationName !== applicationName) {
    throw new createHttpError.BadRequest(`The approval-application ${applicationName} was not found.`);
  }

  /****************************************************************************************
   * Prepare logicalTerminatinPointConfigurationInput object to 
   * configure logical-termination-point
   ****************************************************************************************/

  let operationNamesByAttributes = new Map();
  operationNamesByAttributes.set("approval-operation", approvalOperation);

  let tcpObject = new TcpObject(applicationProtocol, applicationAddress, applicationPort);

  let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
  if (!httpClientUuid) {
    httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName);
  }
  let lpConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObject,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  let ltpConfigurationStatus = await LogicalTerminationPointService.FindAndUpdateApplicationLtpsAsync(lpConfigurationInput);

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
  let applicationList = await IndividualServicesUtility.getAllRegisteredApplicationList(body["required-protocol"]);
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
 * @deprecated since version 2.1.0
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

  let tcpObject = new TcpObject(applicationProtocol, applicationAddress, applicationPort);

  let httpClientLtpUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let ltpConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientLtpUuid,
    applicationName,
    releaseNumber,
    tcpObject,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  const ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(ltpConfigurationInput);

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
 * @deprecated since version 2.1.0
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

  let tcpObject = new TcpObject(applicationProtocol, applicationAddress, applicationPort);

  let httpClientLtpUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let ltpConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientLtpUuid,
    applicationName,
    releaseNumber,
    tcpObject,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  const ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(ltpConfigurationInput);

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
 * @deprecated since version 2.1.0
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

  let tcpObject = new TcpObject(applicationProtocol, applicationAddress, applicationPort);

  let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(
    applicationName,
    releaseNumber
  );
  let ltpConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObject,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  const ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(ltpConfigurationInput);

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
 * Offers subscribing to notifications about changes of the embedding status
 *
 * body V1_notifyembeddingstatuschanges_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.notifyEmbeddingStatusChanges = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
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

  let tcpObject = new TcpObject(applicationProtocol, applicationAddress, applicationPort);

  let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
    applicationName, releaseNumber, NEW_RELEASE_FORWARDING_NAME
  );
  let ltpConfigurationInput = new LogicalTerminationPointConfigurationInput(
    httpClientUuid,
    applicationName,
    releaseNumber,
    tcpObject,
    operationServerName,
    operationNamesByAttributes,
    individualServicesOperationsMapping.individualServicesOperationsMapping
  );
  const ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(ltpConfigurationInput);

  /****************************************************************************************
   * Prepare attributes to configure forwarding-construct
   ****************************************************************************************/

  let forwardingConfigurationInputList = [];
  let forwardingConstructConfigurationStatus;
  let operationClientConfigurationStatusList = ltpConfigurationStatus.operationClientConfigurationStatusList;

  if (operationClientConfigurationStatusList) {
    forwardingConfigurationInputList = await prepareForwardingConfiguration.notifyEmbeddingStatusChange(
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
  let forwardingAutomationInputList = await prepareForwardingAutomation.notifyEmbeddingStatusChange(
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
 * @deprecated since version 2.1.0
 * Adds to the list of known applications
 *
 * body V1_registerapplication_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-capability/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * operationServerName contains name of addressed request
 * no response value expected for this operation
 **/
exports.registerApplication = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  let applicationName = body["application-name"];
  let releaseNumber = body["release-number"];
  let tcpServer = body["tcp-server-list"][0];
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

  let tcpObject = new TcpObject(tcpServer.protocol, tcpServer.address, tcpServer.port);

  await lock.acquire("Register application", async () => {
    let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
      applicationName, releaseNumber, NEW_RELEASE_FORWARDING_NAME
    );
    let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
      httpClientUuid,
      applicationName,
      releaseNumber,
      tcpObject,
      operationServerName,
      operationNamesByAttributes,
      individualServicesOperationsMapping.individualServicesOperationsMapping
    );
    let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(logicalTerminatinPointConfigurationInput);

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

    await MonitorTypeApprovalChannel.AddEntryToMonitorApprovalStatusChannel(applicationName, releaseNumber);
    await IndividualServicesUtility.includeGenericResponseProfile(applicationName, releaseNumber);
  });
}

/**
 * Adds to the list of known applications
 * 'Registration service is not protected by operationKey. Receiving a de-registration request shall be assumed after passing wait time to approve from [/core-model-1-4:control-construct/profile-collection/profile=ro-2-1-0-integer-p-000/integer-profile-1-0:integer-profile-pac/integer-profile-configuration/integer-value]' 
 *
 * body V2_registerapplication_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * operationServerName contains name of addressed request
 * no response value expected for this operation
 **/
exports.registerApplication2 = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  try {
    let applicationName = body["application-name"];
    let releaseNumber = body["release-number"];
    let embeddingOperation = body["embedding-operation"];
    let clientUpdateOperation = body["client-update-operation"];
    let clientOperationUpdateOperation = body["operation-client-update-operation"];

    let preceedingApplicationName = body["preceding-application-name"];
    let preceedingReleaseNumber = body["preceding-release-number"];

    let operationNamesByAttributes = new Map();
    operationNamesByAttributes.set("embedding-operation", embeddingOperation);
    operationNamesByAttributes.set("client-update-operation", clientUpdateOperation);
    operationNamesByAttributes.set("operation-client-update-operation", clientOperationUpdateOperation);

    /****************************************************************************************
     * Differentiate between two schemas  
     * if schema has tcp-server-list attribute, it is old-multiple-TcpServers-format
     * else if schema has tcp-server object attribute, it is new-single-TcpServer-format
     ****************************************************************************************/
    let tcpServer = {};
    let disposeRemaindersOperation;
    let precedingReleaseOperation;
    let subsequentReleaseOperation;
    if (body.hasOwnProperty("tcp-server-list")) {
      tcpServer = body["tcp-server-list"][0];
    } else if (body.hasOwnProperty("tcp-server")) {
      tcpServer = body["tcp-server"];
      disposeRemaindersOperation = body["dispose-remainders-operation"];
      precedingReleaseOperation = body["preceding-release-operation"];
      subsequentReleaseOperation = body["subsequent-release-operation"];
      operationNamesByAttributes.set("dispose-remainders-operation", disposeRemaindersOperation);
      operationNamesByAttributes.set("preceding-release-operation", precedingReleaseOperation);
      operationNamesByAttributes.set("subsequent-release-operation", subsequentReleaseOperation);
    }

    /****************************************************************************************
     * Prepare logicalTerminatinPointConfigurationInput object to 
     * configure logical-termination-point
     ****************************************************************************************/
    let tcpObject = new TcpObject(tcpServer.protocol, tcpServer.address, tcpServer.port);

    await lock.acquire("Register application", async () => {
      let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
        applicationName, releaseNumber, NEW_RELEASE_FORWARDING_NAME
      );
      let logicalTerminatinPointConfigurationInput = new LogicalTerminationPointConfigurationInput(
        httpClientUuid,
        applicationName,
        releaseNumber,
        tcpObject,
        operationServerName,
        operationNamesByAttributes,
        individualServicesOperationsMapping.individualServicesOperationsMapping
      );
      let ltpConfigurationStatus = await LogicalTerminationPointService.createOrUpdateApplicationLtpsAsync(logicalTerminatinPointConfigurationInput);

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
        forwardingConfigurationInputList = await prepareForwardingConfiguration.registerApplication2(
          operationClientConfigurationStatusList,
          embeddingOperation, precedingReleaseOperation, subsequentReleaseOperation
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

      await MonitorTypeApprovalChannel.AddEntryToMonitorApprovalStatusChannel(applicationName, releaseNumber);
      await IndividualServicesUtility.includeGenericResponseProfile(applicationName, releaseNumber);
    });

  } catch (error) {
    console.log(error);
  }
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
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
        applicationName, releaseNumber, NEW_RELEASE_FORWARDING_NAME
      );
      if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        // check whether application is approved ??
        const appNameAndUuidFromForwarding = await IndividualServicesUtility.resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription(
          'OperationUpdateBroadcast',
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
      let httpClientUuidOfNewApplication = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
        futureApplicationName, futureReleaseNumber, NEW_RELEASE_FORWARDING_NAME
      );
      if (httpClientUuidOfNewApplication == undefined) {
        isRequestEligibleForRelaying = false;
      } else {
        // check whether application is approved ??
        const appNameAndUuidFromForwarding = await IndividualServicesUtility.resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription(
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
exports.regardUpdatedApprovalStatus = function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {
  return new Promise(async function (resolve, reject) {
    try {
      let requestHeaders = {
        user, xCorrelator, traceIndicator, customerJourney
      };
      let processId = await RegardUpdatedApprovalProcess.updateApprovalStatusInConfig(body, requestHeaders, operationServerName);
      if (processId) {
        resolve({
          "process-id": processId
        });
      } else {
        resolve();
      }
    } catch (error) {
      console.log(error)
      console.log(`${error} in regardUpdatedApprovalStatus`);
      reject(error);
    }
  });
}

