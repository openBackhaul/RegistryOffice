'use strict';

const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingConfigurationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructConfigurationServices');
const ForwardingAutomationService = require('onf-core-model-ap/applicationPattern/onfModel/services/ForwardingConstructAutomationServices');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const ConfigurationStatus = require('onf-core-model-ap/applicationPattern/onfModel/services/models/ConfigurationStatus');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const forwardingConstructAutomationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/forwardingConstruct/AutomationInput');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const integerProfileOperation = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/IntegerProfile');
const ControlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const MonitorTypeApprovalChannel = require('./MonitorTypeApprovalChannel');
const IndividualServicesUtility = require('./IndividualServicesUtility');
const prepareForwardingConfiguration = require('./PrepareForwardingConfiguration');
const prepareForwardingAutomation = require('./PrepareForwardingAutomation');
const createHttpError = require('http-errors');

const NEW_RELEASE_FORWARDING_NAME = 'PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications';

/**
 * This function is responsible for making initial configurations in config file as soon as regard-updated-approval-status has been received.  
 * {String} applicationName of application regarded
 * {String} releaseNumber of application regarded
 * {String} approvalStatus of application regarded
 * {Object} requestHeaders that came in incoming requests
 * {return} processId identifier for a request
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
                throw createHttpError.BadRequest(`The application-name ${applicationName} was not found.`);
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
        let isApplicationAlreadyApproved;
        if (operationListForConfiguration.length > 0) {
            forwardingConfigurationInputList = await prepareForwardingConfiguration.updateApprovalStatus(
                operationListForConfiguration,
                updateClientOperationName,
                updateOperationClientOperationName,
                disposeRemaindersOperationName
            );

            isApplicationAlreadyApproved = await checkApplicationApprovalStatus(operationClientUuidList)

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
                requestHeaders.traceIndicatorIncrementer = 1;
                BarringApplicationCausesDeregisteringOfApplication(applicationName, releaseNumber, requestHeaders);
                return processId;
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
        } else if (approvalStatus == 'REGISTERED' && isApplicationAlreadyApproved) {
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
        /****************************************************************************************
         * Initiating sequence to start embedding of the approved application into architecture
         * Reference:https://github.com/openBackhaul/RegistryOffice/blob/develop/spec/diagrams/is010_regardApprovalStatusCausesSequence.plantuml
         ****************************************************************************************/
        if (approvalStatus == 'APPROVED') {
            applicationApprovalCausesSequenceForEmbedding(requestBody, requestHeaders, operationServerName, processId);
        }
        return processId;
    } catch (error) {
        console.log(`error in updateApprovalStatus`, error);
        throw createHttpError.InternalServerError(`${error}`);
    }
}

/**
* This method initiates embedding sequence for an approved application
* @param {Object} requestBody incoming request body in request
* @param {Object} requestHeaders request header from incoming request and attached traceIndicatorIncrementor to be used for further callbacks
* @param {String} operationServerName 
* @param {String} processId request Identifier
*/
async function applicationApprovalCausesSequenceForEmbedding(requestBody, requestHeaders, operationServerName, processId) {
    try {
        let applicationName = requestBody["application-name"];
        let releaseNumber = requestBody["release-number"];
        
        let connectionWithTACResult = await ApprovingApplicationCausesConnectingWith(processId, applicationName, releaseNumber, requestHeaders);

        if (!connectionWithTACResult["successfully-embedded"]) {
            ApprovingApplicationCausesResponding(connectionWithTACResult, requestHeaders);
            return;
        }
        ApprovalNotification(applicationName, releaseNumber, requestHeaders, operationServerName);
        ApprovingApplicationCausesPreparingTheEmbedding(processId, applicationName, releaseNumber, requestHeaders);

    } catch (error) {
        console.log(error);
    }
}

/**
* This method is to check if application is APPROVED
* @param {List} clientLtps list of op-c uuid(s)
* @returns {Boolean} true if op-c is present in OUTPUT fc-port list of ServerReplacementBroadcast
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
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @returns {String} processId - identifier of a request
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
    let result = false;
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
        console.log(`${forwardingName} responded with ${result.status}`)
        return result;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesConnectingWith series that notifies to Alt, OKM, EATL, AA, OL
 * @param {String} processId identifier for a request
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @returns {Object} result  Object that contains actual embedding status
 */
async function ApprovingApplicationCausesConnectingWith(processId, applicationName, releaseNumber, requestHeaders) {
    let result = {};
    result["process-id"] = processId;
    try {
        let forwardingsList = [
            "ApprovingApplicationCausesConnectingWith.Alt",
            "ApprovingApplicationCausesConnectingWith.Okm",
            "ApprovingApplicationCausesConnectingWith.Eatl",
            "ApprovingApplicationCausesConnectingWith.Aa",
            "ApprovingApplicationCausesConnectingWith.Ol"
        ];
        /* form request body for regard-application */
        let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
            applicationName,
            releaseNumber,
            NEW_RELEASE_FORWARDING_NAME
        );
        let requestBody = { applicationName, releaseNumber };
        let tcpClient = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
        requestBody.protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClient);
        requestBody.address = await tcpClientInterface.getRemoteAddressAsync(tcpClient);
        requestBody.port = await tcpClientInterface.getRemotePortAsync(tcpClient);
        /* send regard-application to each application based on forwardingList */
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
            let responseCode = response.status;
            let responseData = response.data;
            if (!responseCode.toString().startsWith("2")) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
            } else if (!responseData["successfully-connected"]) {
                result["successfully-embedded"] = responseData["successfully-connected"];
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = responseData["successfully-connected"];
            }
            if (!result["successfully-embedded"]) {
                console.log(`embedding sequence terminated at ${forwardingName} because of ${result["reason-of-failure"]}`);
                return result;
            }
            console.log(`${forwardingName} responded with ${responseCode}`);
        }
        return result;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesResponding
 * @param {Object} requestBody Object containing request-body to the request
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 */
async function ApprovingApplicationCausesResponding(requestBody, requestHeaders) {
    try {
        let forwardingName = "ApprovingApplicationCausesResponding";
        OperationClientInterface.turnOFFNotificationChannel(requestHeaders.timestampOfCurrentRequest);
        let result = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        console.log(`Embedding status is sent to TypeApprovalRegister through ${forwardingName} for ${JSON.stringify(requestBody)} with response code: ${result.status} `);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Prepare attributes and automate ApprovalNotification
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {String} operationServerName op-s that has been called
 */
async function ApprovalNotification(applicationName, releaseNumber, requestHeaders, operationServerName) {
    let forwardingConstructAutomationList = [];
    try {
        let forwardingName = "ApprovalNotification";
        let httpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(
            applicationName,
            releaseNumber,
            NEW_RELEASE_FORWARDING_NAME
        );
        let requestBody = { applicationName, releaseNumber };
        let tcpClient = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
        requestBody.protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClient);
        requestBody.address = await tcpClientInterface.getRemoteAddressAsync(tcpClient);
        requestBody.port = await tcpClientInterface.getRemotePortAsync(tcpClient);
        requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
        let forwardingAutomation = new forwardingConstructAutomationInput(forwardingName, requestBody);
        forwardingConstructAutomationList.push(forwardingAutomation);
        ForwardingAutomationService.automateForwardingConstructAsync(
            operationServerName,
            forwardingConstructAutomationList,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        console.log(`${forwardingName} has been triggered`)
    } catch (error) {
        console.log(error);
    }
}

/**
 * Prepare attributes for initiating embedding process with callback ApprovingApplicationCausesPreparingTheEmbedding
 * @param {String} processId identifier for a request
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @returns {Object} result  Object that contains actual embedding status
 */
async function ApprovingApplicationCausesPreparingTheEmbedding(processId, applicationName, releaseNumber, requestHeaders) {
    let result = {};
    let responseData = {};
    result["process-id"] = processId;
    try {
        /*  requesting old-release information from the approved application*/
        [result, responseData] = await RequestForOldRelease(applicationName, releaseNumber, requestHeaders, result);

        if (!result["successfully-embedded"]) {
            ApprovingApplicationCausesResponding(result, requestHeaders);
            return;
        }

        /* processing old release data for deciding further callbacks */
        let isCallBackEligible = true;
        let oldReleaseApplicationName = responseData["application-name"];
        let oldReleaseReleaseNumber = responseData["release-number"];
        let oldReleaseHttpClientUuid = await httpClientInterface.getHttpClientUuidExcludingOldReleaseAndNewRelease(oldReleaseApplicationName, oldReleaseReleaseNumber, NEW_RELEASE_FORWARDING_NAME);
        if (oldReleaseApplicationName == "OldRelease" || !oldReleaseHttpClientUuid) {
            isCallBackEligible = false;
        }
        /* if old-release of an application is actually present, further callbacks to be triggered */
        if (isCallBackEligible) {
            /* CreateLinkToUpdateNewReleaseClient */
            result = await CreateLinkToUpdateNewReleaseClient(oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }
        }
        proceedToUpdatingNewReleaseClientAfterReceivingOperationKey(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result, isCallBackEligible);
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.RequestForOldRelease
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @returns {Object, Object} {result, responseData} 
 * result contains the embedding status, responseData contains the actual response for request in case of success
 */
async function RequestForOldRelease(applicationName, releaseNumber, requestHeaders, result) {
    let responseData = {};
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForOldRelease";
    try {
        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            {},
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney,
            applicationName + releaseNumber
        );
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            responseData = response.data;
            result["successfully-embedded"] = true;
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return [result, responseData];
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkToUpdateNewReleaseClient
 * This callback helps creating link between old-release of application and RegistryOffice for /v1/update-client-of-subsequent-release
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkToUpdateNewReleaseClient(oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkToUpdateNewReleaseClient";
    let forwardingForUpdatingNewReleaseClient = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForUpdatingNewReleaseClient";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = oldReleaseApplicationName;
        requestBody["serving-application-release-number"] = oldReleaseReleaseNumber;
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingForUpdatingNewReleaseClient, oldReleaseApplicationName, oldReleaseReleaseNumber);
        requestBody["operation-name"] = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        requestBody["consuming-application-name"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["consuming-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * After ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkToUpdateNewReleaseClient, this function autmates further callbacks after receiving /v1/update-operation-key for OR://v1/update-client-of-subsequent-release
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 */
async function proceedToUpdatingNewReleaseClientAfterReceivingOperationKey(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result, isCallBackEligible) {
    let isOperationKeyUpdated = false;
    let responseData = {};
    try {
        if (isCallBackEligible) {
            let forwardingNameForUpdatingNewReleaseClient = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForUpdatingNewReleaseClient";
            let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingNameForUpdatingNewReleaseClient, oldReleaseApplicationName, oldReleaseReleaseNumber);
            let waitingTime = await integerProfileOperation.getIntegerValueForTheIntegerProfileNameAsync("maximumWaitTimeToReceiveOperationKey");
            isOperationKeyUpdated = await OperationClientInterface.waitUntilOperationKeyIsUpdated(operationClientUuid, requestHeaders.timestampOfCurrentRequest, waitingTime);
            if (!isOperationKeyUpdated) {
                result["successfully-embedded"] = 'false';
                result["reason-of-failure"] = `RO_OPERATIONKEY_NOT_RECEIVED_1`;
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }

            /* RequestForUpdatingNewReleaseClient */
            [result, responseData] = await RequestForUpdatingNewReleaseClient(oldReleaseApplicationName, oldReleaseReleaseNumber, applicationName, releaseNumber, requestHeaders, result);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }

            /* CreateLinkForBequeathYourData */
            result = await CreateLinkForBequeathYourData(oldReleaseApplicationName, oldReleaseReleaseNumber, responseData, applicationName, releaseNumber, requestHeaders, result);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }

            /* CreateFurtherLinksForTransferringData */
            result = await CreateFurtherLinksForTransferringData(applicationName, releaseNumber, responseData, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }
            /* CreateLinkForPromptingEmbedding */
            result = await CreateLinkForPromptingEmbedding(applicationName, releaseNumber, requestHeaders, result);
            if (!result["successfully-embedded"]) {
                ApprovingApplicationCausesResponding(result, requestHeaders);
                return;
            }
            proceedToEmbeddingAfterReceivingOperationKey(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result);
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.RequestForUpdatingNewReleaseClient
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object, Object} {result, responseData} result contains the embedding status and process-id while responseData contains actual response body on success
 */
async function RequestForUpdatingNewReleaseClient(oldReleaseApplicationName, oldReleaseReleaseNumber, applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForUpdatingNewReleaseClient";
    let responseData = {};
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["application-name"] = applicationName;
        requestBody["release-number"] = releaseNumber;
        let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
        let tcpClient = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
        requestBody.protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClient);
        requestBody.address = await tcpClientInterface.getRemoteAddressAsync(tcpClient);
        requestBody.port = await tcpClientInterface.getRemotePortAsync(tcpClient);
        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney,
            oldReleaseApplicationName + oldReleaseReleaseNumber
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            responseData = response.data;
            result["successfully-embedded"] = true;
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return [result, responseData];
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkForBequeathYourData
 * This callback helps creating link between old-release and new-release of application for /v1/bequeath-your-data-and-die
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} responseDataOfRequestForUpdatingNewReleaseClient response received from RequestForUpdatingNewReleaseClient callback
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkForBequeathYourData(oldReleaseApplicationName, oldReleaseReleaseNumber, responseDataOfRequestForUpdatingNewReleaseClient, applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkForBequeathYourData";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = oldReleaseApplicationName;
        requestBody["serving-application-release-number"] = oldReleaseReleaseNumber;
        requestBody["operation-name"] = responseDataOfRequestForUpdatingNewReleaseClient["bequeath-your-data-and-die-operation"];
        requestBody["consuming-application-name"] = applicationName;
        requestBody["consuming-application-release-number"] = releaseNumber;

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.CreateFurtherLinksForTransferringData
 * This callback helps creating link between old-release and new-release of application for each operation-clients received in RequestForUpdatingNewReleaseClient["data-transfer-operations-list"]
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} responseDataOfRequestForUpdatingNewReleaseClient response received from RequestForUpdatingNewReleaseClient callback
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateFurtherLinksForTransferringData(applicationName, releaseNumber, responseDataOfRequestForUpdatingNewReleaseClient, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.CreateFurtherLinksForTransferringData";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = applicationName;
        requestBody["serving-application-release-number"] = releaseNumber;
        requestBody["consuming-application-name"] = oldReleaseApplicationName;
        requestBody["consuming-application-release-number"] = oldReleaseReleaseNumber;
        let operationNameList = responseDataOfRequestForUpdatingNewReleaseClient["data-transfer-operations-list"];
        for (let i = 0; i < operationNameList.length; i++) {
            requestBody["operation-name"] = operationNameList[i];
            let response = await IndividualServicesUtility.forwardRequest(
                forwardingName,
                requestBody,
                requestHeaders.user,
                requestHeaders.xCorrelator,
                requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
                requestHeaders.customerJourney
            );
            /* processing the response */
            let responseCode = response.status;
            if (!responseCode.toString().startsWith("2")) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
                break;
            } else {
                let responseData = response.data;
                if (!responseData["client-successfully-added"]) {
                    result["successfully-embedded"] = false;
                    result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
                    break;
                } else {
                    result["successfully-embedded"] = true;
                }
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkForPromptingEmbedding
 * This callback helps creating link between new-release of application and RegistryOffice for /v1/embed-yourself
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkForPromptingEmbedding(applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkForPromptingEmbedding";
    let forwardingForEmbedding = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = applicationName;
        requestBody["serving-application-release-number"] = releaseNumber;
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingForEmbedding, applicationName, releaseNumber);
        requestBody["operation-name"] = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        requestBody["consuming-application-name"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["consuming-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * After ApprovingApplicationCausesPreparingTheEmbedding.CreateLinkForPromptingEmbedding, this function autmates further callbacks after receiving /v1/update-operation-key for NR://v1/embed-yourself
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 */
async function proceedToEmbeddingAfterReceivingOperationKey(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result) {
    let isOperationKeyUpdated = false;
    try {
        let forwardingNameForEmbedding = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding";
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingNameForEmbedding, applicationName, releaseNumber);
        let waitingTime = await integerProfileOperation.getIntegerValueForTheIntegerProfileNameAsync("maximumWaitTimeToReceiveOperationKey");
        isOperationKeyUpdated = await OperationClientInterface.waitUntilOperationKeyIsUpdated(operationClientUuid, requestHeaders.timestampOfCurrentRequest, waitingTime);
        if (!isOperationKeyUpdated) {
            result["successfully-embedded"] = 'false';
            result["reason-of-failure"] = `RO_OPERATIONKEY_NOT_RECEIVED_2`;
            ApprovingApplicationCausesResponding(result, requestHeaders);
            return;
        }
        /* RequestForEmbedding */
        result = await RequestForEmbedding(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result); // to be initiated by update-operation-key
        if (!result["successfully-embedded"]) {
            ApprovingApplicationCausesResponding(result, requestHeaders);
            return;
        }
        /**
         *  ApprovingApplicationCausesConnectingToBroadcast has been triggered after successful embedding of application
         */
        result = await ApprovingApplicationCausesConnectingToBroadcast(applicationName, releaseNumber, requestHeaders, result);
        ApprovingApplicationCausesResponding(result, requestHeaders);
    } catch (error) {
        console.log(error);
        throw error;
    }
    return;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {String} oldReleaseApplicationName name of old-release of the application for which approval-status is updated
 * @param {String} oldReleaseReleaseNumber release of old-release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result result contains the embedding status and process-id
 */
async function RequestForEmbedding(applicationName, releaseNumber, oldReleaseApplicationName, oldReleaseReleaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["registry-office-application"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["registry-office-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();
        requestBody["registry-office-address"] = await tcpServerInterface.getLocalAddressForForwarding();
        requestBody["registry-office-port"] = await tcpServerInterface.getLocalPort();
        requestBody["registry-office-protocol"] = await tcpServerInterface.getLocalProtocol()

        let controlConstructUuid = await ControlConstruct.getUuidAsync();

        let relayServerReplacementOperationUuid = controlConstructUuid + "-op-s-is-010";
        requestBody["relay-server-replacement-operation"] = await operationServerInterface.getOperationNameAsync(relayServerReplacementOperationUuid);

        let relayOperationUpdateOperationUuid = controlConstructUuid + "-op-s-is-011";
        requestBody["relay-operation-update-operation"] = await operationServerInterface.getOperationNameAsync(relayOperationUpdateOperationUuid);

        let deregistrationOperationUuid = controlConstructUuid + "-op-s-is-002";
        requestBody["deregistration-operation"] = await operationServerInterface.getOperationNameAsync(deregistrationOperationUuid);

        let oldReleaseHttpClientUuid = await httpClientInterface.getHttpClientUuidAsync(oldReleaseApplicationName, oldReleaseReleaseNumber);

        //get the oldRelease tcp client information
        if (oldReleaseHttpClientUuid) {
            let tcpClientOfOldRelease = (await logicalTerminationPoint.getServerLtpListAsync(oldReleaseHttpClientUuid))[0];
            if (tcpClientOfOldRelease) {
                requestBody["old-release-protocol"] = await tcpClientInterface.getRemoteProtocolAsync(tcpClientOfOldRelease);
                requestBody["old-release-address"] = await tcpClientInterface.getRemoteAddressAsync(tcpClientOfOldRelease);
                requestBody["old-release-port"] = await tcpClientInterface.getRemotePortAsync(tcpClientOfOldRelease);
            }
        }
        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney,
            applicationName + releaseNumber
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            result["successfully-embedded"] = true;
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error)
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * ApprovingApplicationCausesConnectingToBroadcast further calls broadcasting services to broadcast information about new application to all other applications. 
 * @param {String} applicationName name of approved application
 * @param {String} releaseNumber release of approved application
 * @param {Object} requestHeaders header parameters came along with request
 * @param {Object} result contains previous result and process-id
 * @returns {Object} result contains current result for the given process-id
 */
async function ApprovingApplicationCausesConnectingToBroadcast(applicationName, releaseNumber, requestHeaders, result) {
    try {
        result = await CreateLinkForUpdatingClient(applicationName, releaseNumber, requestHeaders, result);
        if (!result["successfully-embedded"]) return result;
        result = await CreateLinkForUpdatingOperationClient(applicationName, releaseNumber, requestHeaders, result);
        if (!result["successfully-embedded"]) return result;
        result = await CreateLinkForDisposingRemainders(applicationName, releaseNumber, requestHeaders, result);
        if (!result["successfully-embedded"]) return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
    return result;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForUpdatingClient
 * This callback helps creating link between new-release of application and RegistryOffice for /v1/update-client
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkForUpdatingClient(applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForUpdatingClient";
    let forwardingForBroadcast = "ServerReplacementBroadcast";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = applicationName;
        requestBody["serving-application-release-number"] = releaseNumber;
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingForBroadcast, applicationName, releaseNumber);
        requestBody["operation-name"] = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        requestBody["consuming-application-name"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["consuming-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForUpdatingOperationClient
 * This callback helps creating link between new-release of application and RegistryOffice for /v1/update-operation-client
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkForUpdatingOperationClient(applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForUpdatingOperationClient";
    let forwardingForBroadcast = "OperationUpdateBroadcast";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = applicationName;
        requestBody["serving-application-release-number"] = releaseNumber;
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingForBroadcast, applicationName, releaseNumber);
        requestBody["operation-name"] = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        requestBody["consuming-application-name"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["consuming-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}

/**
 * Prepare attributes and automate ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForDisposingRemainders
 * This callback helps creating link between new-release of application and RegistryOffice for /v1/dispose-remainders-of-deregistered-application
 * @param {String} applicationName name of the application for which approval-status is updated
 * @param {String} releaseNumber release of the application for which approval-status is updated
 * @param {Object} requestHeaders this object contains all request header attributes like user, xCorrelator, 
 *          traceIndicator, customerJourney as well as traceIndicatorIncrementor
 * @param {Object} result contains process-id and previous result
 * @returns {Object} result contains the embedding status and process-id
 */
async function CreateLinkForDisposingRemainders(applicationName, releaseNumber, requestHeaders, result) {
    let forwardingName = "ApprovingApplicationCausesConnectingToBroadcast.CreateLinkForDisposingRemainders";
    let forwardingForBroadcast = "DeRegistrationBroadcast";
    try {
        /* formulating request body*/
        let requestBody = {};
        requestBody["serving-application-name"] = applicationName;
        requestBody["serving-application-release-number"] = releaseNumber;
        let operationClientUuid = await IndividualServicesUtility.getConsequentOperationClientUuid(forwardingForBroadcast, applicationName, releaseNumber);
        requestBody["operation-name"] = await OperationClientInterface.getOperationNameAsync(operationClientUuid);
        requestBody["consuming-application-name"] = await httpServerInterface.getApplicationNameAsync();
        requestBody["consuming-application-release-number"] = await httpServerInterface.getReleaseNumberAsync();

        let response = await IndividualServicesUtility.forwardRequest(
            forwardingName,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + requestHeaders.traceIndicatorIncrementer++,
            requestHeaders.customerJourney
        );
        /* processing the response */
        let responseCode = response.status;
        if (!responseCode.toString().startsWith("2")) {
            result["successfully-embedded"] = false;
            result["reason-of-failure"] = `RO_REQUEST_UNANSWERED`;
        } else {
            let responseData = response.data;
            if (!responseData["client-successfully-added"]) {
                result["successfully-embedded"] = false;
                result["reason-of-failure"] = `RO_${responseData["reason-of-failure"]}`;
            } else {
                result["successfully-embedded"] = true;
            }
        }
        console.log(`${forwardingName} has been triggered`);
    } catch (error) {
        console.log(error);
        result["successfully-embedded"] = false;
        result["reason-of-failure"] = `RO_OTHERS`;
    }
    return result;
}