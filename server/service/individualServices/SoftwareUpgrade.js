/**
 * @file This module provides functionality to migrate the data from the current version to the next version. 
 * This file should be modified accourding to the individual service forwarding requirements 
 * @module SoftwareUpgrade
 **/

const operationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const FcPort = require('onf-core-model-ap/applicationPattern/onfModel/models/FcPort');
const onfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');

const eventDispatcher = require('onf-core-model-ap/applicationPattern/rest/client/eventDispatcher');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');

const ApplicationPreceedingVersion = require('./ApplicationPreceedingVersion');
const ControlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
var traceIndicatorIncrementer = 1;
/**
 * This method performs the set of procedure to transfer the data from this version to next version of the application<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {Promise} Promise is resolved if the operation succeeded else the Promise is rejected<br>
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
exports.upgradeSoftwareVersion = async function (isdataTransferRequired, user, xCorrelator, traceIndicator, customerJourney,_traceIndicatorIncrementer) {
    return new Promise(async function (resolve, reject) {
        try {
            traceIndicatorIncrementer = _traceIndicatorIncrementer;
            if (isdataTransferRequired) {
                await transferDataToTheNewRelease(user, xCorrelator, traceIndicator, customerJourney);
            }
            await redirectNotificationNewRelease(user, xCorrelator, traceIndicator, customerJourney);
            await replaceOldReleaseWithNewRelease(user, xCorrelator, traceIndicator, customerJourney);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function transferDataToTheNewRelease(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications(user, xCorrelator, traceIndicator, customerJourney);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function redirectNotificationNewRelease(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            await promptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication(user, xCorrelator, traceIndicator, customerJourney);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function replaceOldReleaseWithNewRelease(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            await promptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement(user, xCorrelator, traceIndicator, customerJourney);
            await promptForBequeathingDataCausesRequestForDeregisteringOfOldRelease(user, xCorrelator, traceIndicator, customerJourney);
            resolve();
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let inquiryForApplicationTypeApprovalFCName = "RegistrationCausesInquiryForApplicationTypeApproval";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(inquiryForApplicationTypeApprovalFCName);
            let operationClientUuidList = getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];

                    let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    let releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                    let inquiryForApprovalOperation = await operationClientInterface.getOperationNameAsync(operationClientUuid);
                    let applicationProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

                    /***********************************************************************************
                     * PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals
                     *   /v1/inquire-application-type-approvals
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.approvalApplication = applicationName;
                    requestBody.approvalApplicationReleaseNumber = releaseNumber;
                    requestBody.approvalOperation = inquiryForApprovalOperation;
                    requestBody.approvalApplicationProtocol = applicationProtocol;
                    requestBody.approvalApplicationAddress = applicationAddress;
                    requestBody.approvalApplicationPort = applicationPort;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                    }

                } catch (error) {
                    console.log(error);
                    throw "operation is not success";
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications";

            /***********************************************************************************
             * Figureout the httpClientUuid of OldRelease and NewRelease
             ************************************************************************************/

            let httpClientUuidOfOldRelease = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName("PromptForEmbeddingCausesRequestForBequeathingData");
            let httpClientUuidOfNewRelease = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let httpClientUuidList = await logicalTerminationPoint.getUuidListForTheProtocolAsync(LayerProtocol.layerProtocolNameEnum.HTTP_CLIENT);

            for (let i = 0; i < httpClientUuidList.length; i++) {
                try {
                    let httpClientUuid = httpClientUuidList[i];
                    let applicationName;
                    let releaseNumber;
                    let embeddingOperationName;
                    let clientUpdateOperationName;
                    let operationClientUpdateOperation;
                    let tcpServerList = [];
                    let preceedingApplicationName;
                    let preceedingApplicationReleaseNumber;

                    if (httpClientUuid != httpClientUuidOfOldRelease.httpClientLtpUuid && httpClientUuid != httpClientUuidOfNewRelease.httpClientLtpUuid) {

                        applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                        releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);

                        /******************************************************************************************
                         * formulate the operation attributes for the callback. The logic needs to be tuned
                         * in version 3.0.0 after deciding https://github.com/openBackhaul/RegistryOffice/issues/98
                         ********************************************************************************************/
                        embeddingOperationName = await resolveOperationNameForAHttpClientFromForwardingName(
                            "TypeApprovalCausesRequestForEmbedding",
                            httpClientUuid
                        );
                        if (embeddingOperationName == undefined) {
                            embeddingOperationName = "/v1/embed-yourself"
                        }

                        clientUpdateOperationName = await resolveOperationNameForAHttpClientFromForwardingName(
                            "ServerReplacementBroadcast",
                            httpClientUuid
                        );
                        if (clientUpdateOperationName == undefined) {
                            clientUpdateOperationName = "/v1/update-client"
                        }

                        operationClientUpdateOperation = await resolveOperationNameForAHttpClientFromForwardingName(
                            "OperationUpdateBroadcast",
                            httpClientUuid
                        );
                        if (operationClientUpdateOperation == undefined) {
                            operationClientUpdateOperation = "/v1/update-operation-client"
                        }

                        /******************************************************************************************
                         * formulate tcp-server-list attribute
                         ********************************************************************************************/

                        let tcpClientUuidList = await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid);
                        for (let i = 0; i < tcpClientUuidList.length; i++) {
                            let tcpClientUuid = tcpClientUuidList[i];
                            let protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                            let address = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                            let port = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);
                            let tcpServer = {
                                protocol: protocol,
                                address: address,
                                port: port
                            }
                            tcpServerList.push(tcpServer);
                        }

                        /******************************************************************************************
                         * formulate preceeding application infomration
                         ********************************************************************************************/

                        let preceedingApplicationInformation = await ApplicationPreceedingVersion.getPreceedingApplicationInformation(
                            applicationName,
                            releaseNumber
                        );
                        if (preceedingApplicationInformation != undefined) {
                            preceedingApplicationName = preceedingApplicationInformation.preceedingApplicationName;
                            preceedingApplicationReleaseNumber = preceedingApplicationInformation.preceedingReleaseNumber;
                        }

                        /***********************************************************************************
                         * PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications
                         *   /v1/register-application
                         ************************************************************************************/
                        let requestBody = {};
                        requestBody.applicationName = applicationName;
                        requestBody.releaseNumber = releaseNumber;
                        requestBody.embeddingOperation = embeddingOperationName;
                        requestBody.clientUpdateOperation = clientUpdateOperationName;
                        requestBody.operationClientUpdateOperation = operationClientUpdateOperation;
                        requestBody.tcpServerList = tcpServerList;
                        if (preceedingApplicationName != undefined) {
                            requestBody.precedingApplicationName = preceedingApplicationName;
                        }
                        if (preceedingApplicationReleaseNumber != undefined) {
                            requestBody.precedingReleaseNumber = preceedingApplicationReleaseNumber;
                        }
                        requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                        result = await forwardRequest(
                            forwardingKindNameOfTheBequeathOperation,
                            requestBody,
                            user,
                            xCorrelator,
                            traceIndicator + "." + traceIndicatorIncrementer++,
                            customerJourney
                        );
                        if (!result) {
                            throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                        }
                    }
                } catch (error) {
                    console.log(error);
                    throw "operation is not success";
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForDeregistrationNotifications";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let inquiryForApplicationTypeApprovalFCName = "DeregistrationNotification";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(inquiryForApplicationTypeApprovalFCName);
            let operationClientUuidList = getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];

                    let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    let releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                    let deregistrationNotificationOperation = await operationClientInterface.getOperationNameAsync(operationClientUuid);
                    let applicationProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

                    /***********************************************************************************
                     * PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals
                     *   /v1/inquire-application-type-approvals
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.subscriberApplication = applicationName;
                    requestBody.subscriberReleaseNumber = releaseNumber;
                    requestBody.subscriberOperation = deregistrationNotificationOperation;
                    requestBody.subscriberProtocol = applicationProtocol;
                    requestBody.subscriberAddress = applicationAddress;
                    requestBody.subscriberPort = applicationPort;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                    }
                } catch (error) {
                    console.log(error);
                    throw "operation is not success";
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForApprovalNotifications";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let inquiryForApplicationTypeApprovalFCName = "ApprovalNotification";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(inquiryForApplicationTypeApprovalFCName);
            let operationClientUuidList = getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];

                    let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    let releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                    let approvalNotificationOperation = await operationClientInterface.getOperationNameAsync(operationClientUuid);
                    let applicationProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

                    /***********************************************************************************
                     * PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals
                     *   /v1/inquire-application-type-approvals
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.subscriberApplication = applicationName;
                    requestBody.subscriberReleaseNumber = releaseNumber;
                    requestBody.subscriberOperation = approvalNotificationOperation;
                    requestBody.subscriberProtocol = applicationProtocol;
                    requestBody.subscriberAddress = applicationAddress;
                    requestBody.subscriberPort = applicationPort;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                    }

                } catch (error) {
                    console.log(error);
                    throw "operation is not success";
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToDocumentSubscriptionsForWithdrawnApprovalNotifications";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let withdrawnApprovalNotificationFCName = "WithdrawnApprovalNotification";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(withdrawnApprovalNotificationFCName);
            let operationClientUuidList = getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];

                    let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    let releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                    let withdrawnApprovalNotificationOperation = await operationClientInterface.getOperationNameAsync(operationClientUuid);
                    let applicationProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

                    /***********************************************************************************
                     * PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals
                     *   /v1/inquire-application-type-approvals
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.subscriberApplication = applicationName;
                    requestBody.subscriberReleaseNumber = releaseNumber;
                    requestBody.subscriberOperation = withdrawnApprovalNotificationOperation;
                    requestBody.subscriberProtocol = applicationProtocol;
                    requestBody.subscriberAddress = applicationAddress;
                    requestBody.subscriberPort = applicationPort;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                    }

                } catch (error) {
                    console.log(error);
                    throw "operation is not success";
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication";

            /***********************************************************************************
             * Preparing requestBody 
             ************************************************************************************/
            try {

                let httpClientUuidOfNewRelease = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");
                let newReleaseHttpClientUuid = httpClientUuidOfNewRelease.httpClientLtpUuid;
                let newReleaseTcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(newReleaseHttpClientUuid))[0];
                let regardUpdateApprovalOperationUuidSuffix = "-op-s-is-003";
                let controlConstructUuid = await ControlConstruct.getUuidAsync();
                let regardUpdateApprovalOperationUuid = controlConstructUuid + regardUpdateApprovalOperationUuidSuffix;

                let applicationName = await httpServerInterface.getApplicationNameAsync();
                let releaseNumber = await httpClientInterface.getReleaseNumberAsync(newReleaseHttpClientUuid);
                let regardUpdateApprovalOperation = await OperationServerInterface.getOperationNameAsync(regardUpdateApprovalOperationUuid);
                let applicationProtocol = await tcpClientInterface.getRemoteProtocolAsync(newReleaseTcpClientUuid);
                let applicationAddress = await tcpClientInterface.getRemoteAddressAsync(newReleaseTcpClientUuid);
                let applicationPort = await tcpClientInterface.getRemotePortAsync(newReleaseTcpClientUuid);

                /***********************************************************************************
                 * PromptForBequeathingDataCausesTARbeingRequestedToRedirectInfoAboutApprovalsToNewApplication
                 *   /v1/redirect-info-about-approval-status-changes
                 ************************************************************************************/
                let requestBody = {};
                requestBody.subscriberApplication = applicationName;
                requestBody.subscriberReleaseNumber = releaseNumber;
                requestBody.subscriberOperation = regardUpdateApprovalOperation;
                requestBody.subscriberProtocol = applicationProtocol;
                requestBody.subscriberAddress = applicationAddress;
                requestBody.subscriberPort = applicationPort;
                requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                result = await forwardRequest(
                    forwardingKindNameOfTheBequeathOperation,
                    requestBody,
                    user,
                    xCorrelator,
                    traceIndicator + "." + traceIndicatorIncrementer++,
                    customerJourney
                );
                if (!result) {
                    throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                }

            } catch (error) {
                console.log(error);
                throw "operation is not success";
            }

            resolve(result);
        } catch (error) {
            reject(error);
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
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement";

            /***********************************************************************************
             * Preparing requestBody 
             ************************************************************************************/
            try {

                let httpClientUuidOfNewRelease = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");
                let newReleaseHttpClientUuid = httpClientUuidOfNewRelease.httpClientLtpUuid;
                let newReleaseTcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(newReleaseHttpClientUuid))[0];


                let currentApplicationName = await httpServerInterface.getApplicationNameAsync();
                let currentReleaseNumber = await httpServerInterface.getReleaseNumberAsync();
                let futureApplicationName = await httpClientInterface.getApplicationNameAsync(newReleaseHttpClientUuid);
                let futureReleaseNumber = await httpClientInterface.getReleaseNumberAsync(newReleaseHttpClientUuid);
                let futureProtocol = await tcpClientInterface.getRemoteProtocolAsync(newReleaseTcpClientUuid);
                let futureAddress = await tcpClientInterface.getRemoteAddressAsync(newReleaseTcpClientUuid);
                let futurePort = await tcpClientInterface.getRemotePortAsync(newReleaseTcpClientUuid);

                /***********************************************************************************
                 * PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement
                 *   /v1/relay-server-replacement
                 ************************************************************************************/
                let requestBody = {};
                requestBody.currentApplicationName = currentApplicationName;
                requestBody.currentReleaseNumber = currentReleaseNumber;
                requestBody.futureApplicationName = futureApplicationName;
                requestBody.futureReleaseNumber = futureReleaseNumber;
                requestBody.futureProtocol = futureProtocol;
                requestBody.futureAddress = futureAddress;
                requestBody.futurePort = futurePort;
                requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                result = await forwardRequest(
                    forwardingKindNameOfTheBequeathOperation,
                    requestBody,
                    user,
                    xCorrelator,
                    traceIndicator + "." + traceIndicatorIncrementer++,
                    customerJourney
                );
                if (!result) {
                    throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                }

            } catch (error) {
                console.log(error);
                throw "operation is not success";
            }

            resolve(result);
        } catch (error) {
            reject(error);
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
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesRequestForDeregisteringOfOldRelease";

            /***********************************************************************************
             * Preparing requestBody 
             ************************************************************************************/
            try {
                let httpClientUuidOfNewRelease = await resolveApplicationNameAndHttpClientLtpUuidFromForwardingName("PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals");
                let newReleaseHttpClientUuid = httpClientUuidOfNewRelease.httpClientLtpUuid;
                let oldApplicationName = await httpServerInterface.getApplicationNameAsync();
                let oldReleaseNumber = await httpServerInterface.getReleaseNumberAsync();
                let newApplicationName = await httpClientInterface.getApplicationNameAsync(newReleaseHttpClientUuid);
                let newReleaseNumber = await httpClientInterface.getReleaseNumberAsync(newReleaseHttpClientUuid);
                if (oldReleaseNumber != newReleaseNumber || oldApplicationName != newApplicationName) {
                    /***********************************************************************************
                     * PromptForBequeathingDataCausesRequestForBroadcastingInfoAboutServerReplacement
                     *   /v1/relay-server-replacement
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.applicationName = oldApplicationName;
                    requestBody.releaseNumber = oldReleaseNumber;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + requestBody;
                    }
                }
            } catch (error) {
                console.log(error);
                throw "operation is not success";
            }

            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

/****************************************************************************************
 * Functions utilized by individual services
 ****************************************************************************************/

function getOperationClientUuidThatContainsTheOperationNameAsync(httpClientUuid, operationName) {
    return new Promise(async function (resolve, reject) {
        let operationClientUuid;
        try {
            let existingOperationClientUuidList = await logicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
            for (let i = 0; i < existingOperationClientUuidList.length; i++) {
                let existingOperationName = await OperationClientInterface.getOperationNameAsync(existingOperationClientUuidList[i]);
                if (existingOperationName.includes(operationName)) {
                    operationClientUuid = existingOperationClientUuidList[i];
                }
            }
            resolve(operationClientUuid);
        } catch (error) {
            reject(error);
        }
    });
}

function getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance) {
    try {
        let fcPortOutputLogicalTerminationPointList = [];
        let fcPortList = forwardingConstructInstance[
            onfAttributes.FORWARDING_CONSTRUCT.FC_PORT];
        for (let i = 0; i < fcPortList.length; i++) {
            let fcPort = fcPortList[i];
            let fcPortPortDirection = fcPort[onfAttributes.FC_PORT.PORT_DIRECTION];
            if (fcPortPortDirection == FcPort.portDirectionEnum.OUTPUT) {
                let fclogicalTerminationPoint = fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
                fcPortOutputLogicalTerminationPointList.push(fclogicalTerminationPoint);
            }
        }
        return fcPortOutputLogicalTerminationPointList;
    } catch (error) {
        throw error;
    }
}

/**
 * @description This function automates the forwarding construct by calling the appropriate call back operations based on the fcPort input and output directions.
 * @param {String} operationServerUuid operation server uuid of the request url
 * @param {list}   attributeList list of attributes required during forwarding construct automation(to send in the request body)
 * @param {String} user user who initiates this request
 * @param {string} originator originator of the request
 * @param {string} xCorrelator flow id of this request
 * @param {string} traceIndicator trace indicator of the request
 * @param {string} customerJourney customer journey of the request
 **/
function forwardRequest(forwardingKindName, attributeList, user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingKindName);
            let operationClientUuid = (getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
            let result = await eventDispatcher.dispatchEvent(
                operationClientUuid,
                attributeList,
                user,
                xCorrelator,
                traceIndicator,
                customerJourney
            );
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
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
    const httpLtpUuidList = await logicalTerminationPoint.getServerLtpListAsync(opLtpUuid);
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

async function resolveOperationNameForAHttpClientFromForwardingName(forwardingName, httpClientUuid) {

    let operationName;
    const operationClientUuidList = await logicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
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

    for (let i = 0; i < fcPortOutputDirectionLogicalTerminationPointList.length; i++) {
        let opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[i];
        let isAvailable = operationClientUuidList.includes(opLtpUuid);
        if (isAvailable == true) {
            operationName = await operationClientInterface.getOperationNameAsync(opLtpUuid);
        }
    }
    return operationName;
}