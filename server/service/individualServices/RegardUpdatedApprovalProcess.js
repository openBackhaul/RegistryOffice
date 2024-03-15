'use strict';

const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingConfigurationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructConfigurationServices');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const LogicalTerminationPointService = require('onf-core-model-ap/applicationPattern/onfModel/services/LogicalTerminationPointServices');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const ConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/ConfigurationStatus');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const MonitorTypeApprovalChannel = require('./MonitorTypeApprovalChannel');
const IndividualServicesUtility = require('./IndividualServicesUtility');
const prepareForwardingConfiguration = require('./PrepareForwardingConfiguration');
const prepareForwardingAutomation = require('./PrepareForwardingAutomation');

const NEW_RELEASE_FORWARDING_NAME = 'PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications';

/**
 * This function is responsible for making initial configurations in config file as soon as regard-updated-approval-status has been received.  
 * {String} applicationName of application regarded
 * {String} releaseNumber of application regarded
 * {String} approvalStatus of application regarded
 * {Object} requestHeaders that came in incoming requests
 */
exports.updateApprovalStatusInConfig = async function (requestBody, requestHeaders, operationServerName) {
    let processId;
    try {
        //extracting data from request-body
        let applicationName = requestBody["application-name"];
        let releaseNumber = requestBody["release-number"];
        let approvalStatus = requestBody["approval-status"];

        let forwardingAutomationInputList;
        /****************************************************************************************
         * updating response-receiver-operation to corresponding LTP using ApprovingApplicationCausesResponding
        ****************************************************************************************/
        if (requestBody.hasOwnProperty("response-receiver-operation")) {
            processId = await generateProcessId(applicationName, releaseNumber);
            let responseReceiverOperation = requestBody["response-receiver-operation"];
            let forwardingName = "ApprovingApplicationCausesResponding";
            let forwardingConstructForTheForwardingName = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
            let forwardingConstructUuid = forwardingConstructForTheForwardingName[onfAttributes.GLOBAL_CLASS.UUID];
            let fcPortList = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructUuid);
            let operationClientUuid = fcPortList[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
            let isOperationNameUpdated = await OperationClientInterface.setOperationNameAsync(operationClientUuid, responseReceiverOperation);
            if (isOperationNameUpdated) {
                let configurationStatus = new ConfigurationStatus(
                    operationClientUuid,
                    '',
                    true);
                forwardingAutomationInputList = await prepareForwardingAutomation.getOperationClientForwardingAutomationInputListAsync([configurationStatus]);
            }
        }
        /****************************************************************************************
         * code block to check if application is registered to registry office (finding if LTP instances is present in config file)
         ****************************************************************************************/
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
         * find the operation client uuid for the operations 'update-client', 'update-operation-client', 
         * 'dispose-remainders-of-deregistered-application' that shall be updated in fc-ports
         ****************************************************************************************/
        let updateClientOperationName;
        let updateOperationClientOperationName;
        let disposeRemaindersOperationName;
        let operationClientUuidList;
        let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
        if (httpClientUuid) {
            operationClientUuidList = await logicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
        }
        let operationListForConfiguration = [];
        if (operationClientUuidList) {
            for (let i = 0; i < operationClientUuidList.length; i++) {
                let operationClientUuid = operationClientUuidList[i];
                let apiSegment = IndividualServicesUtility.getApiSegmentOfOperationClient(operationClientUuid);
                if (apiSegment == "im") {
                    if (operationClientUuid.endsWith("001")) {
                        updateClientOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
                        operationListForConfiguration.push(operationClientUuid);
                    } else if (operationClientUuid.endsWith("002")) {
                        updateOperationClientOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
                        operationListForConfiguration.push(operationClientUuid);
                    } else if (operationClientUuid.endsWith("006")) {
                        disposeRemaindersOperationName = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
                        operationListForConfiguration.push(operationClientUuid);
                    }
                }
            }
        }
        /****************************************************************************************
         * Prepare attributes to configure forwarding-construct
         * If the approval status is approved , then create forwarding construct for update-operation-client and update-client
         * If the approval status is not barred , check if any fc-port created, if so delete them 
         ****************************************************************************************/
        let forwardingConfigurationInputList;
        let ltpConfigurationStatus;
        let forwardingConstructConfigurationStatus;
        if (operationListForConfiguration.length > 0) {
            forwardingConfigurationInputList = await prepareForwardingConfiguration.updateApprovalStatus(
                operationListForConfiguration,
                updateClientOperationName,
                updateOperationClientOperationName,
                disposeRemaindersOperationName
            );

            let isApplicationAlreadyApproved = await checkApplicationApprovalStatus(operationClientUuidList)

            if (approvalStatus == 'APPROVED') {
                forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
                    configureForwardingConstructAsync(
                        operationServerName,
                        forwardingConfigurationInputList
                    );
                await MonitorTypeApprovalChannel.removeEntryFromMonitorApprovalStatusChannel(applicationName, releaseNumber);
            } else if (isApplicationAlreadyApproved && approvalStatus == 'REGISTERED') {
                forwardingConstructConfigurationStatus = await ForwardingConfigurationService.
                    unConfigureForwardingConstructAsync(
                        operationServerName,
                        forwardingConfigurationInputList
                    );
                await MonitorTypeApprovalChannel.AddEntryToMonitorApprovalStatusChannel(applicationName, releaseNumber);
            } else if (approvalStatus == 'BARRED') {
                // need not send explicit requests to update ALT because /v1/deregister-application will send delete notifications to ALT
                BarringApplicationCausesDeregisteringOfApplication(applicationName, releaseNumber, requestHeaders);
                resolve(processId);
            }
        }
        /****************************************************************************************
         * Prepare attributes to automate forwarding-construct
         * If the approval status is approved , then embed-yourself, regard-application will be executed
         * If the approval status is barred , then disregard-application will be executed
         ****************************************************************************************/

        if (approvalStatus == 'APPROVED') {
            forwardingAutomationInputList = await prepareForwardingAutomation.updateApprovalStatusApproved(
                ltpConfigurationStatus,
                forwardingConstructConfigurationStatus,
                applicationName,
                releaseNumber
            );
        } else if (approvalStatus == 'BARRED' || (approvalStatus == 'REGISTERED' && isApplicationAlreadyApproved)) {
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
                requestHeaders.user,
                requestHeaders.xCorrelator,
                requestHeaders.traceIndicator,
                requestHeaders.customerJourney
            );
        }
        return processId;
    } catch (error) {
        console.log(`error in updateApprovalStatus`, error);
        throw new createHttpError.InternalServerError(`${error}`);
    }
    
}

exports.regardUpdatedApprovalProcess = async function (applicationName, releaseNumber, approvalStatus, processId, requestHeaders) {
    try {
        requestHeaders.traceIndicatorIncrementer = 1;
        if (approvalStatus === "BARRED") {
            BarringApplicationCausesDeregisteringOfApplication(applicationName, releaseNumber, requestHeaders);
            resolve();
        }
        if (approvalStatus == "APPROVED") {
            let result = await ApprovingApplicationCausesConnectingWith(processId, applicationName, releaseNumber, requestHeaders);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                resolve();
            }


        } else if (approvalStatus == "REGISTERED") {
            // code shall need to be added
        }
    } catch (error) {
        console.log(error);
        reject(error);
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
/**
 * This method generates a new process-id based on 
 *   - current date and time
 *   - incoming application-name and release-number of application
 */
const generateProcessId = async function (applicationName, releaseNumber) {
    try {
        let currentDate = new Date();
        let processId =
            applicationName + releaseNumber.replaceAll(".", "") + ":" +
            currentDate.getFullYear().toString() +
            (currentDate.getMonth() + 1).toString().padStart(2, '0') +
            currentDate.getDate().toString().padStart(2, '0') + ':' +
            currentDate.getHours().toString() +
            currentDate.getMinutes().toString() +
            currentDate.getSeconds().toString();
        return processId;
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
}

/**
 * Prepare attributes and automate BarringApplicationCausesDeregisteringOfApplication
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 */
async function BarringApplicationCausesDeregisteringOfApplication(applicationName, releaseNumber, requestHeaders) {
    let result = true;
    let forwardingName = "BarringApplicationCausesDeregisteringOfApplication";
    try {
        let httpServerApplicationName = await httpServerInterface.getApplicationNameAsync();
        let httpServerReleaseNumber = await httpServerInterface.getReleaseNumberAsync();
        let requestBody = {};
        requestBody.applicationName = applicationName;
        requestBody.releaseNumber = releaseNumber;
        requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
        if (httpServerApplicationName != applicationName && httpServerReleaseNumber != releaseNumber) {
            result = await IndividualServicesUtility.forwardRequest(
                forwardingName,
                requestBody,
                requestHeaders.user,
                requestHeaders.xCorrelator,
                requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
                requestHeaders.customerJourney
            );
        }
    } catch (error) {
        console.log(error);
        throw "operation is not success";
    }

    resolve(result);
}

async function ApprovingApplicationCausesConnectingWith(processId, applicationName, releaseNumber, requestHeaders) {
    let result = {};
    try {
        let forwardingsList = ["ApprovingApplicationCausesConnectingWith.Alt", "ApprovingApplicationCausesConnectingWith.Okm", "ApprovingApplicationCausesConnectingWith.Eatl", "ApprovingApplicationCausesConnectingWith.Aa", "ApprovingApplicationCausesConnectingWith.Ol"];
        let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
            applicationName,
            applicationReleaseNumber,
            NEW_RELEASE_FORWARDING_NAME
        );
        let requestBody = {
            applicationName, releaseNumber
        };
        let tcpClient = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
        requestBody.protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClient);
        requestBody.address = await tcpClientInterface.getRemoteAddressAsync(tcpClient);
        requestBody.port = await tcpClientInterface.getRemotePortAsync(tcpClient);
        for (let i = 0; i < forwardingsList.length; i++) {
            let forwardingName = forwardingsList[i];
            let response = await IndividualServicesUtility.forwardRequest(
                forwardingName,
                requestBody,
                requestHeaders.user,
                requestHeaders.xCorrelator,
                requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
                requestHeaders.customerJourney
            );
            let responseCode = response.code;
            let responseData = response.data;
            result["process-id"] = processId;
            if (!responseCode.toString().startsWith("2")) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `${forwardingName} resulted in response code ${responseCode}`;
            } else if (!responseData["successfully-connected"]) {
                result["successfully-embedded"] = responseData["successfully-connected"];
                result["reason-of-failure"] = `${forwardingName} received ${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = responseData["successfully-connected"];
            }
            if (!result["successfully-embedded"]) {
                return result;
            }
        }
        return result;
    } catch (error) {
        console.log(error);
        reject(error);
    }
}

function ApprovingApplicationCausesResponding(requestBody) {
    try {
        let forwardingName = "ApprovingApplicationCausesResponding";
        IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
    } catch (error) {
        console.log(error)
    }
}

