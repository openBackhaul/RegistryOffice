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
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const ApplicationPreceedingVersion = require('./ApplicationPreceedingVersion');
const ControlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');
const IndividualServicesUtility = require('./IndividualServicesUtility');
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
exports.upgradeSoftwareVersion = async function (user, xCorrelator, traceIndicator, customerJourney, _traceIndicatorIncrementer) {
    return new Promise(async function (resolve, reject) {
        try {
            traceIndicatorIncrementer = _traceIndicatorIncrementer;

            await transferDataToTheNewRelease(user, xCorrelator, traceIndicator, customerJourney);
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
            await promptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications(user, xCorrelator, traceIndicator, customerJourney);
            await PromptForBequeathingDataCausesTransferOfListOfSubscriptionsForEmbeddingStatusChanges(user, xCorrelator, traceIndicator, customerJourney);
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
            let operationClientUuidList = await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

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
                    result = await IndividualServicesUtility.forwardRequest(
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
 * 1. Get information about the application that provides approval for the registered application by using the fc-name "TypeApprovalCausesRequestForEmbedding"
 * 2. Collect the application-name, release-number, tcp-client, embed-yourself,update-client, update-operation-client, dispose-remainders-of-deregistered-application, 
 *            inform-about-preceding-release, update-client-of-subsequent-release operations, preceding-release information to formulate the request body
 * 3. push the collected attribute for each registered application and send it to the method automateForwardingConstructForNIteration 
 *    to automate the forwarding.
 */
async function promptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesTransferOfListOfAlreadyRegisteredApplications";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let approvalCausesRequestForEmbeddingFCName = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(approvalCausesRequestForEmbeddingFCName);
            let operationClientUuidList = await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let applicationName;
                    let releaseNumber;
                    let embeddingOperationName;
                    let clientUpdateOperationName;
                    let operationClientUpdateOperation;
                    let disposeRemaindersOperation;
                    let precedingReleaseOperation;
                    let subsequentReleaseOperation;
                    let tcpServer = {};
                    let preceedingApplicationName;
                    let preceedingApplicationReleaseNumber;

                    applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);

                    /******************************************************************************************
                     * formulate the operation attributes for the callback. The logic needs to be tuned
                     * in version 3.0.0 after deciding https://github.com/openBackhaul/RegistryOffice/issues/98
                     ********************************************************************************************/
                    embeddingOperationName = await resolveOperationNameForAHttpClientFromForwardingName(
                        "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding",
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

                    disposeRemaindersOperation = await resolveOperationNameForAHttpClientFromForwardingName(
                        "DeRegistrationBroadcast",
                        httpClientUuid
                    );
                    if (disposeRemaindersOperation == undefined) {
                        disposeRemaindersOperation = "/v1/dispose-remainders-of-deregistered-application"
                    }

                    precedingReleaseOperation = await resolveOperationNameForAHttpClientFromForwardingName(
                        "ApprovingApplicationCausesPreparingTheEmbedding.RequestForOldRelease",
                        httpClientUuid
                    );
                    if (precedingReleaseOperation == undefined) {
                        precedingReleaseOperation = "/v1/inform-about-preceding-release"
                    }

                    subsequentReleaseOperation = await resolveOperationNameForAHttpClientFromForwardingName(
                        "ApprovingApplicationCausesPreparingTheEmbedding.RequestForUpdatingNewReleaseClient",
                        httpClientUuid
                    );
                    if (subsequentReleaseOperation == undefined) {
                        subsequentReleaseOperation = "/v1/update-client-of-subsequent-release"
                    }

                    /******************************************************************************************
                     * formulate tcp-server attribute
                     ********************************************************************************************/
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
                    tcpServer.protocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    tcpServer.address = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    tcpServer.port = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

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
                    requestBody.disposeRemaindersOperation = disposeRemaindersOperation;
                    requestBody.precedingReleaseOperation = precedingReleaseOperation;
                    requestBody.subsequentReleaseOperation = subsequentReleaseOperation;
                    requestBody.tcpServer = tcpServer;
                    if (preceedingApplicationName != undefined) {
                        requestBody.precedingApplicationName = preceedingApplicationName;
                    }
                    if (preceedingApplicationReleaseNumber != undefined) {
                        requestBody.precedingReleaseNumber = preceedingApplicationReleaseNumber;
                    }
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await IndividualServicesUtility.forwardRequest(
                        forwardingKindNameOfTheBequeathOperation,
                        requestBody,
                        user,
                        xCorrelator,
                        traceIndicator + "." + traceIndicatorIncrementer++,
                        customerJourney
                    );
                    if (!result) {
                        throw forwardingKindNameOfTheBequeathOperation + "forwarding is not success for the input" + JSON.stringify(requestBody);
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
 * Prepare attributes and automate PromptForBequeathingDataCausesTransferOfListOfSubscriptionsForEmbeddingStatusChanges<br>
 * @param {String} user String User identifier from the system starting the service call
 * @param {String} xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param {String} traceIndicator String Sequence of request numbers along the flow
 * @param {String} customerJourney String Holds information supporting customer’s journey to which the execution applies
 * @returns {boolean} return true if the operation is success or else return false<br> 
 * steps :
 * 1. Get information about the application that has subscribed for embedding notification fc-name "EmbeddingStatusNotification"
 * 2. Collect the application-name, release-number, tcp-client and callback-operation information to formulate the request body
 * 3. Post the information to the new application's service "/v1/notify-embedding-status-changes"
 */
async function PromptForBequeathingDataCausesTransferOfListOfSubscriptionsForEmbeddingStatusChanges(user, xCorrelator, traceIndicator, customerJourney) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = true;
            let forwardingKindNameOfTheBequeathOperation = "PromptForBequeathingDataCausesTransferOfListOfSubscriptionsForEmbeddingStatusChanges";

            /***********************************************************************************
             * Preparing requestBody and transfering the data one by one
             ************************************************************************************/

            let embeddingStatusNotificationFCName = "EmbeddingStatusNotification";
            let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(embeddingStatusNotificationFCName);
            let operationClientUuidList = await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance);

            for (let i = 0; i < operationClientUuidList.length; i++) {
                try {
                    let operationClientUuid = operationClientUuidList[i];
                    let httpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                    let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];

                    let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                    let releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                    let embeddingStatusNotificationOperation = await operationClientInterface.getOperationNameAsync(operationClientUuid);
                    let subscriberProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                    let subscriberAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                    let subscriberPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);

                    /***********************************************************************************
                     * PromptForBequeathingDataCausesTransferOfListOfSubscriptionsForEmbeddingStatusChanges
                     *   /v1/notify-embedding-status-changes
                     ************************************************************************************/
                    let requestBody = {};
                    requestBody.subscriberApplication = applicationName;
                    requestBody.subscriberReleaseNumber = releaseNumber;
                    requestBody.subscriberOperation = embeddingStatusNotificationOperation;
                    requestBody.subscriberProtocol = subscriberProtocol;
                    requestBody.subscriberAddress = subscriberAddress;
                    requestBody.subscriberPort = subscriberPort;
                    requestBody = onfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
                    result = await IndividualServicesUtility.forwardRequest(
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
                let newReleaseFcName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals";
                let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(newReleaseFcName);
                let operationClientUuid = (await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
                let newReleaseHttpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
                let newReleaseTcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(newReleaseHttpClientUuid))[0];
                let regardUpdateApprovalOperationUuidSuffix = "-op-s-is-003";
                let controlConstructUuid = await ControlConstruct.getUuidAsync();
                let regardUpdateApprovalOperationUuid = controlConstructUuid + regardUpdateApprovalOperationUuidSuffix;

                let applicationName = await httpClientInterface.getApplicationNameAsync(newReleaseHttpClientUuid);
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
                result = await IndividualServicesUtility.forwardRequest(
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

                let newReleaseFcName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals";
                let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(newReleaseFcName);
                let operationClientUuid = (await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
                let newReleaseHttpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
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
                result = await IndividualServicesUtility.forwardRequest(
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
                let newReleaseFcName = "PromptForBequeathingDataCausesNewApplicationBeingRequestedToInquireForApplicationTypeApprovals";
                let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(newReleaseFcName);
                let operationClientUuid = (await IndividualServicesUtility.getFcPortOutputLogicalTerminationPointList(forwardingConstructInstance))[0];
                let newReleaseHttpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(operationClientUuid))[0];
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
                    result = await IndividualServicesUtility.forwardRequest(
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