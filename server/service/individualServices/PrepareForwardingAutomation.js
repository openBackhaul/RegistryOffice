const forwardingConstructAutomationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/forwardingConstruct/AutomationInput');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const onfFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ControlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');

const ApplicationPreceedingVersion = require('./ApplicationPreceedingVersion');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');

exports.registerApplication = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus,
    applicationName, applicationReleaseNumber) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {
            /***********************************************************************************
             * RegistrationCausesInquiryForApplicationTypeApproval /v1/regard-application
             ************************************************************************************/
            let InquiryForApprovalForwardingName = "RegistrationCausesInquiryForApplicationTypeApproval";
            let InquiryForApprovalContext;
            let InquiryForApprovalRequestBody = {};
            InquiryForApprovalRequestBody.applicationName = applicationName;
            InquiryForApprovalRequestBody.releaseNumber = applicationReleaseNumber;
            InquiryForApprovalRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(InquiryForApprovalRequestBody);
            let forwardingAutomation = new forwardingConstructAutomationInput(
                InquiryForApprovalForwardingName,
                InquiryForApprovalRequestBody,
                InquiryForApprovalContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.deregisterApplication = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus,
    applicationName, applicationReleaseNumber) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {
            /***********************************************************************************
             * DeregistrationNotification /v1/disregard-application
             ************************************************************************************/
            let deregistrationNotificationForwardingName = "DeregistrationNotification";
            let deregistrationNotificationContext;
            let deregistrationNotificationRequestBody = {};
            deregistrationNotificationRequestBody.applicationName = applicationName;
            deregistrationNotificationRequestBody.releaseNumber = applicationReleaseNumber;
            deregistrationNotificationRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(deregistrationNotificationRequestBody);
            let forwardingAutomationForDeregistrationNotification = new forwardingConstructAutomationInput(
                deregistrationNotificationForwardingName,
                deregistrationNotificationRequestBody,
                deregistrationNotificationContext
            );
            forwardingConstructAutomationList.push(forwardingAutomationForDeregistrationNotification);

            /***********************************************************************************
             * DeRegistrationBroadcast /v1/dispose-remainders-of-deregistered-application
             ************************************************************************************/
            let deregistrationBroadcastForwardingName = "DeRegistrationBroadcast";
            let deregistrationBroadcastContext;
            let deregistrationBroadcastRequestBody = {};
            deregistrationBroadcastRequestBody.applicationName = applicationName;
            deregistrationBroadcastRequestBody.releaseNumber = applicationReleaseNumber;
            deregistrationBroadcastRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(deregistrationBroadcastRequestBody);
            let forwardingAutomationForDeregistrationBroadcast = new forwardingConstructAutomationInput(
                deregistrationBroadcastForwardingName,
                deregistrationBroadcastRequestBody,
                deregistrationBroadcastContext
            );
            forwardingConstructAutomationList.push(forwardingAutomationForDeregistrationBroadcast);

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTUnConfigureForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.updateApprovalStatusApproved = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {
            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.updateApprovalStatusRegistered = function (forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {
            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getFDUnconfigureForwardingAutomationInputList(
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.notifyWithdrawnApprovals = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.notifyDeregistrations = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.notifyApprovals = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.notifyEmbeddingStatusChange = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.inquireApplicationTypeApprovals = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                forwardingConstructConfigurationStatus
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.relayServerReplacement = function (currentApplicationName, currentReleaseNumber, futureApplicationName, futureReleaseNumber,
    futureProtocol, futureAddress, futurePort) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * ServerReplacementBroadcast /v1/update-client
             ************************************************************************************/
            let serverReplacementBroadcastForwardingName = "ServerReplacementBroadcast";
            let serverReplacementBroadcastContext;
            let serverReplacementBroadcastRequestBody = {};
            serverReplacementBroadcastRequestBody.currentApplicationName = currentApplicationName;
            serverReplacementBroadcastRequestBody.currentReleaseNumber = currentReleaseNumber;
            serverReplacementBroadcastRequestBody.futureApplicationName = futureApplicationName;
            serverReplacementBroadcastRequestBody.futureReleaseNumber = futureReleaseNumber;
            serverReplacementBroadcastRequestBody.futureProtocol = futureProtocol;
            serverReplacementBroadcastRequestBody.futureAddress = futureAddress;
            serverReplacementBroadcastRequestBody.futurePort = futurePort;
            serverReplacementBroadcastRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(serverReplacementBroadcastRequestBody);
            let forwardingAutomation = new forwardingConstructAutomationInput(
                serverReplacementBroadcastForwardingName,
                serverReplacementBroadcastRequestBody,
                serverReplacementBroadcastContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.relayOperationUpdate = function (applicationName, applicationReleaseNumber, oldOperationName, newOperationName) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * OperationUpdateBroadcast /v1/update-operation-client
             ************************************************************************************/
            let operationUpdateBroadcastForwardingName = "OperationUpdateBroadcast";
            let operationUpdateBroadcastContext;
            let operationUpdateBroadcastRequestBody = {};
            operationUpdateBroadcastRequestBody.applicationName = applicationName;
            operationUpdateBroadcastRequestBody.releaseNumber = applicationReleaseNumber;
            operationUpdateBroadcastRequestBody.oldOperationName = oldOperationName;
            operationUpdateBroadcastRequestBody.newOperationName = newOperationName;
            operationUpdateBroadcastRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(operationUpdateBroadcastRequestBody);
            let forwardingAutomation = new forwardingConstructAutomationInput(
                operationUpdateBroadcastForwardingName,
                operationUpdateBroadcastRequestBody,
                operationUpdateBroadcastContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.bequeathYourDataAndDie = function (logicalTerminationPointconfigurationStatus) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputAsync(
                logicalTerminationPointconfigurationStatus,
                undefined
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}

exports.OAMLayerRequest = function (uuid) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * forwardings for application layer topology
             ************************************************************************************/
            let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputForOamRequestAsync(
                uuid
            );

            if (applicationLayerTopologyForwardingInputList) {
                for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
                    let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
                    forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
                }
            }

            resolve(forwardingConstructAutomationList);
        } catch (error) {
            reject(error);
        }
    });
}


exports.getOperationClientForwardingAutomationInputListAsync = async function(operationClientConfigurationStatusList) {
    let forwardingConstructAutomationList = [];
    let fwName = "ServiceRequestCausesLtpUpdateRequest";
    if (operationClientConfigurationStatusList) {
        for (let operationClientConfigurationStatus of operationClientConfigurationStatusList) {
            if (operationClientConfigurationStatus.updated) {
                let body = await ControlConstruct.getLogicalTerminationPointAsync(
                    operationClientConfigurationStatus.uuid);
                body = removeAttribute(body, "operation-key")
                let forwardingAutomation = new forwardingConstructAutomationInput(fwName, body, undefined);
                forwardingConstructAutomationList.push(forwardingAutomation);
            }
        }
    }
    return forwardingConstructAutomationList;
}

function removeAttribute(jsonObject, attributeName) {
    for (var element in jsonObject) {
        if (element == attributeName) {
            delete jsonObject[element];
        } else if (typeof jsonObject[element] == 'object') {
            removeAttribute(jsonObject[element], attributeName);
        }
    }
    return jsonObject;
}