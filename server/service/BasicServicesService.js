//@ts-check
'use strict';

const LogicalTerminationPointService = require('onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServicesV2');

const ForwardingConfigurationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructConfigurationServices');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const prepareForwardingConfiguration = require('./individualServices/PrepareForwardingConfiguration');
const prepareForwardingAutomation = require('./individualServices/PrepareForwardingAutomation');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const IndividualServicesUtility = require('./individualServices/IndividualServicesUtility');
const MonitorTypeApprovalChannel = require('./individualServices/MonitorTypeApprovalChannel');
const ApplicationPreceedingVersion = require('./individualServices/ApplicationPreceedingVersion');

/**
 * Removes application from configuration and application data
 *
 * body V1_disposeremaindersofderegisteredapplication_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.disposeRemaindersOfDeregisteredApplication = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName, newReleaseFWName) {
    let applicationName = body["application-name"];
    let applicationReleaseNumber = body["release-number"];

    await IndividualServicesUtility.excludeGenericResponseProfile(applicationName, applicationReleaseNumber);
    let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
      applicationName,
      applicationReleaseNumber,
      newReleaseFWName
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
      forwardingConfigurationInputList = await prepareForwardingConfiguration.disposeRemaindersOfDeregisteredApplication(
        operationClientConfigurationStatusList
      );
      forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
      unConfigureForwardingConstructAsync(
        operationServerName,
        forwardingConfigurationInputList
      );
    }
    /****************************************************************************************
     * Prepare attributes to remove application-data file
     ****************************************************************************************/
    await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, applicationReleaseNumber);
    await ApplicationPreceedingVersion.removeEntryFromPrecedingVersionList(applicationName, applicationReleaseNumber);
  
    /****************************************************************************************
     * Prepare attributes to automate forwarding-construct
     ****************************************************************************************/
    let forwardingAutomationInputList = await prepareForwardingAutomation.disposeRemaindersOfDeregisteredApplication(
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

  