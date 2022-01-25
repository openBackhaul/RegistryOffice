/**
 * @file This module provides functionality to migrate the data from the current version to the next version. 
 * This file should be modified accourding to the individual service forwarding requirements 
 * @author      prathiba.jeevan.external@telefonica.com
 * @since       07.12.2021
 * @version     1.0
 * @copyright   Telefónica Germany GmbH & Co. OHG
 * @module SoftwareUpgrade
 **/

const forwardingConstruct = require('../onfModel/models/ForwardingConstruct');
const operationClientInterface = require('../onfModel/models/layerprotocols/OperationClientInterface');
const logicalTerminationPoint = require('../onfModel/models/logicalTerminationPoint');
const httpServerInterface = require('../onfModel/models/layerprotocols/HttpServerInterface');
const httpClientInterface = require('../onfModel/models/layerprotocols/HttpClientInterface');
const tcpClientInterface = require('../onfModel/models/layerprotocols/TcpClientInterface');
const forwardingConstructService = require('../onfModel/services/ForwardingConstructService');


/**
 * This method performs the set of procedure to transfer the data from this version to next version of the application<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br>
 * The following are the list of forwarding-construct that will be automated to transfer the data from this current release to next release
 * 1. PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals
 * 2. PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications
 * 3. PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications
 * 4. PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications
 * 5. PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications
 * 6. PromptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication
 * 7. PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement
 * 8. PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease
 */
exports.upgradeSoftwareVersion = async function (user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesRequestForDeregisteringOfOldRelease(user, xCorrelator, traceIndicator, customerJourney);
            resolve();
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get information about the application that provides approval for the registered application by using the fc-name "RegistrationCausesInquiryForApplicationTypeApproval"
 * 2. Collect the application-name, release-number, remote-address, remote-port and callback-operation information to formulate the request body
 * 3. Post the information to the new application's service "/v1/inquire-application-type-approvals"
 */
async function promptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals";
            let inquiryForApplicationTypeApprovalFCName = "RegistrationCausesInquiryForApplicationTypeApproval";
            let operationClientUuidList = await forwardingConstruct.getFcPortOutputDirectionLogicalTerminationPointListForTheForwardingName(inquiryForApplicationTypeApprovalFCName);
            for (let i = 0; i < operationClientUuidList.length; i++) {
                let httpClientUuid = (await logicalTerminationPoint.getServerLtpList(operationClientUuidList[i]))[0];
                let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
                let releaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
                let inquiryForApplicationTypeApprovalOperation = await operationClientInterface.getOperationName(operationClientUuidList[i]);
                let tcpClientUuid = (await logicalTerminationPoint.getServerLtpList(httpClientUuid))[0];
                let tcpClientIpAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
                let tcpClientPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
                let attributeListForOperation = [{
                        "name": "approval-application",
                        "value": applicationName
                    },
                    {
                        "name": "approval-application-release-number",
                        "value": releaseNumber
                    },
                    {
                        "name": "approval-operation",
                        "value": inquiryForApplicationTypeApprovalOperation
                    },
                    {
                        "name": "approval-application-address",
                        "value": tcpClientIpAddress
                    },
                    {
                        "name": "approval-application-port",
                        "value": tcpClientPort
                    }
                ];
                attributeList.push(attributeListForOperation);
            }
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get all http-client-interface apart from OldRelease and NewRelease
 * 2. Collect the application-name, release-number, remote-address, embed-yourself operation,update-client operation information to formulate the request body
 * 3. push the collected attribute for each registered application and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications";
            let httpClientUuidList = await logicalTerminationPoint.getUuidListForTheProtocol("http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER");
            for (let i = 0; i < httpClientUuidList.length; i++) {
                let httpClientUuid = httpClientUuidList[i];
                let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
                if (applicationName != "OldRelease" && applicationName != "NewRelease") {
                    let releaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
                    let embeddingOperationUuid = await operationClientInterface.getOperationClientUuidThatContainsTheOperationName(httpClientUuid, "embed-yourself");
                    let embeddingOperation = await operationClientInterface.getOperationName(embeddingOperationUuid);
                    let clientUpdateOperationUuid = await operationClientInterface.getOperationClientUuidThatContainsTheOperationName(httpClientUuid, "update-client");
                    let clientUpdateOperation = await operationClientInterface.getOperationName(clientUpdateOperationUuid);
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpList(httpClientUuid))[0];
                    let tcpClientIpAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
                    let tcpClientPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
                    let attributeListForOperation = [{
                            "name": "application-name",
                            "value": applicationName
                        },
                        {
                            "name": "application-release-number",
                            "value": releaseNumber
                        },
                        {
                            "name": "embedding-operation",
                            "value": embeddingOperation
                        },
                        {
                            "name": "client-update-operation",
                            "value": clientUpdateOperation
                        },
                        {
                            "name": "application-address",
                            "value": tcpClientIpAddress
                        },
                        {
                            "name": "application-port",
                            "value": tcpClientPort
                        }
                    ];
                    attributeList.push(attributeListForOperation);
                }
            }
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}



/**
 * Prepare attributes and automate PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get all applications that are subscribed for deregistration by using the fc-name "DeregistrationNotification"
 * 2. Collect the subscriber-application,subscriber-release-number,subscriber-operation,subscriber-address,subscriber-address information to formulate the request body
 * 3. push the collected attribute for each registered application and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications";
            let deregistrationNotificationFCName = "DeregistrationNotification";
            operationClientUuidList = await forwardingConstruct.getFcPortOutputDirectionLogicalTerminationPointListForTheForwardingName(deregistrationNotificationFCName);
            for (let i = 0; i < operationClientUuidList.length; i++) {
                let httpClientUuid = (await logicalTerminationPoint.getServerLtpList(operationClientUuidList[i]))[0];
                let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
                let releaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
                let deregistrationNotificationOperation = await operationClientInterface.getOperationName(operationClientUuidList[i]);
                let tcpClientUuid = (await logicalTerminationPoint.getServerLtpList(httpClientUuid))[0];
                let tcpClientIpAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
                let tcpClientPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
                let attributeListForOperation = [{
                        "name": "subscriber-application",
                        "value": applicationName
                    },
                    {
                        "name": "subscriber-release-number",
                        "value": releaseNumber
                    },
                    {
                        "name": "subscriber-operation",
                        "value": deregistrationNotificationOperation
                    },
                    {
                        "name": "subscriber-address",
                        "value": tcpClientIpAddress
                    },
                    {
                        "name": "subscriber-port",
                        "value": tcpClientPort
                    }
                ];
                attributeList.push(attributeListForOperation);
            }
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}


/**
 * Prepare attributes and automate PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get all applications that are subscribed for deregistration by using the fc-name "ApprovalNotification"
 * 2. Collect the subscriber-application,subscriber-release-number,subscriber-operation,subscriber-address,subscriber-address information to formulate the request body
 * 3. push the collected attribute for each registered application and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications";
            let approvalNotificationFCName = "ApprovalNotification";
            operationClientUuidList = await forwardingConstruct.getFcPortOutputDirectionLogicalTerminationPointListForTheForwardingName(approvalNotificationFCName);
            for (let i = 0; i < operationClientUuidList.length; i++) {
                let httpClientUuid = (await logicalTerminationPoint.getServerLtpList(operationClientUuidList[i]))[0];
                let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
                let releaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
                let approvalNotificationOperation = await operationClientInterface.getOperationName(operationClientUuidList[i]);
                let tcpClientUuid = (await logicalTerminationPoint.getServerLtpList(httpClientUuid))[0];
                let tcpClientIpAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
                let tcpClientPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
                let attributeListForOperation = [{
                        "name": "subscriber-application",
                        "value": applicationName
                    },
                    {
                        "name": "subscriber-release-number",
                        "value": releaseNumber
                    },
                    {
                        "name": "subscriber-operation",
                        "value": approvalNotificationOperation
                    },
                    {
                        "name": "subscriber-address",
                        "value": tcpClientIpAddress
                    },
                    {
                        "name": "subscriber-port",
                        "value": tcpClientPort
                    }
                ];
                attributeList.push(attributeListForOperation);
            }
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get all applications that are subscribed for WithdrawnApproval by using the fc-name "WithdrawnApprovalNotification"
 * 2. Collect the subscriber-application,subscriber-release-number,subscriber-operation,subscriber-address,subscriber-address information to formulate the request body
 * 3. push the collected attribute for each registered application and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications";
            let withdrawnApprovalNotificationFCName = "WithdrawnApprovalNotification";
            operationClientUuidList = await forwardingConstruct.getFcPortOutputDirectionLogicalTerminationPointListForTheForwardingName(withdrawnApprovalNotificationFCName);
            for (let i = 0; i < operationClientUuidList.length; i++) {
                let httpClientUuid = (await logicalTerminationPoint.getServerLtpList(operationClientUuidList[i]))[0];
                let applicationName = await httpClientInterface.getApplicationName(httpClientUuid);
                let releaseNumber = await httpClientInterface.getReleaseNumber(httpClientUuid);
                let withdrawnApprovalNotificationOperation = await operationClientInterface.getOperationName(operationClientUuidList[i]);
                let tcpClientUuid = (await logicalTerminationPoint.getServerLtpList(httpClientUuid))[0];
                let tcpClientIpAddress = await tcpClientInterface.getRemoteAddress(tcpClientUuid);
                let tcpClientPort = await tcpClientInterface.getRemotePort(tcpClientUuid);
                let attributeListForOperation = [{
                        "name": "subscriber-application",
                        "value": applicationName
                    },
                    {
                        "name": "subscriber-release-number",
                        "value": releaseNumber
                    },
                    {
                        "name": "subscriber-operation",
                        "value": withdrawnApprovalNotificationOperation
                    },
                    {
                        "name": "subscriber-address",
                        "value": tcpClientIpAddress
                    },
                    {
                        "name": "subscriber-port",
                        "value": tcpClientPort
                    }
                ];
                attributeList.push(attributeListForOperation);
            }
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. create attribute list with the details of the new application-name, release-number, tcp-ip-address , tcp-port of new release
 *    and /v1/regard-updated-approval-status as subscription operation for now.(need to receive it from bequeath-your-data-and-die requestbody) 
 * 2. push the collected attribute and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication";
            let newReleaseApplicationName = await httpServerInterface.getApplicationName();
            let newReleaseHttpClientUuid = await httpClientInterface.getHttpClientUuidForTheApplicationName("NewRelease");
            let newReleaseTcpClientUuid = (await logicalTerminationPoint.getServerLtpList(newReleaseHttpClientUuid))[0];
            let newReleaseReleaseNumber = await httpClientInterface.getReleaseNumber(newReleaseHttpClientUuid);
            let newReleaseTcpIpAddress = await tcpClientInterface.getRemoteAddress(newReleaseTcpClientUuid);
            let newReleasePortNumber = await tcpClientInterface.getRemotePort(newReleaseTcpClientUuid);
            let newReleaseUpdateApprovalStatusOperation = "/v1/regard-updated-approval-status";
            let attributeListForOperation = [{
                    "name": "subscriber-application",
                    "value": newReleaseApplicationName
                },
                {
                    "name": "subscriber-release-number",
                    "value": newReleaseReleaseNumber
                },
                {
                    "name": "subscriber-operation",
                    "value": newReleaseUpdateApprovalStatusOperation
                },
                {
                    "name": "subscriber-address",
                    "value": newReleaseTcpIpAddress
                },
                {
                    "name": "subscriber-port",
                    "value": newReleasePortNumber
                }
            ];
            attributeList.push(attributeListForOperation);
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. create attribute list with the details of the new application-name, old-application-release-number, new-application-release-number , 
 *    new-application-address,new-application-port of new release
 * 2. push the collected attribute and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement";
            let newReleaseApplicationName = await httpServerInterface.getApplicationName();
            let newReleaseHttpClientUuid = await httpClientInterface.getHttpClientUuidForTheApplicationName("NewRelease");
            let newReleaseTcpClientUuid = (await logicalTerminationPoint.getServerLtpList(newReleaseHttpClientUuid))[0];
            let newReleaseReleaseNumber = await httpClientInterface.getReleaseNumber(newReleaseHttpClientUuid);
            let oldReleaseReleaseNumber = await httpServerInterface.getReleaseNumber();
            let newReleaseTcpIpAddress = await tcpClientInterface.getRemoteAddress(newReleaseTcpClientUuid);
            let newReleasePortNumber = await tcpClientInterface.getRemotePort(newReleaseTcpClientUuid);
            let attributeListForOperation = [{
                    "name": "application-name",
                    "value": newReleaseApplicationName
                },
                {
                    "name": "old-application-release-number",
                    "value": oldReleaseReleaseNumber
                },
                {
                    "name": "new-application-release-number",
                    "value": newReleaseReleaseNumber
                },
                {
                    "name": "new-application-address",
                    "value": newReleaseTcpIpAddress
                },
                {
                    "name": "new-application-port",
                    "value": newReleasePortNumber
                }
            ];
            attributeList.push(attributeListForOperation);
            let result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                attributeList, user, xCorrelator, traceIndicator, customerJourney);
            if (result == false) {
                throw result;
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}

/**
 * Prepare attributes and automate PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. create attribute list with the details of the new application-name, old-application-release-number, new-application-release-number , 
 *    new-application-address,new-application-port of new release
 * 2. push the collected attribute and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesRequestForDeregisteringOfOldRelease(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = true;
            let attributeList = [];
            let forwardingKindName = "PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease";
            let oldReleaseApplicationName = await httpServerInterface.getApplicationName();
            let newReleaseHttpClientUuid = await httpClientInterface.getHttpClientUuidForTheApplicationName("NewRelease");
            let newReleaseReleaseNumber = await httpClientInterface.getReleaseNumber(newReleaseHttpClientUuid);
            let oldReleaseReleaseNumber = await httpServerInterface.getReleaseNumber();
            if (oldReleaseReleaseNumber != newReleaseReleaseNumber) {
                let attributeListForOperation = [{
                        "name": "application-name",
                        "value": oldReleaseApplicationName
                    },
                    {
                        "name": "application-release-number",
                        "value": oldReleaseReleaseNumber
                    }
                ];
                attributeList.push(attributeListForOperation);
                result = await forwardingConstructService.automateForwardingConstructForNIteration("Individual", forwardingKindName,
                    attributeList, user, xCorrelator, traceIndicator, customerJourney);
                if (result == false) {
                    throw result;
                }
            }
            resolve(result);
        } catch (error) {
            reject();
        }
    });
}