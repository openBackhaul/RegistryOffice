const forwardingConstructAutomationInput = require('onf-core-model-ap/applicationPattern/onfModel/services/models/forwardingConstruct/AutomationInput');
const httpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface');
const onfFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');
const logicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const LayerProtocol = require('onf-core-model-ap/applicationPattern/onfModel/models/LayerProtocol');
const operationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const onfPaths = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfPaths');


const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const httpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const tcpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpClientInterface');
const ControlConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ControlConstruct');

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
            InquiryForApprovalRequestBody.applicationReleaseNumber = applicationReleaseNumber;
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
            deregistrationNotificationRequestBody.applicationReleaseNumber = applicationReleaseNumber;
            deregistrationNotificationRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(deregistrationNotificationRequestBody);
            let forwardingAutomation = new forwardingConstructAutomationInput(
                deregistrationNotificationForwardingName,
                deregistrationNotificationRequestBody,
                deregistrationNotificationContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

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

exports.updateApprovalStatusApproved = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus,
    applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        let forwardingAutomation;
        try {
            /***********************************************************************************
             * TypeApprovalCausesRequestForEmbedding /v1/embed-yourself
             ************************************************************************************/
            let embedYourselfForwardingName = "TypeApprovalCausesRequestForEmbedding";
            let embedYourselfContext = applicationName + releaseNumber;
            let embedYourselfRequestBody = {};
            embedYourselfRequestBody.registryOfficeApplication = await httpServerInterface.getApplicationNameAsync();
            embedYourselfRequestBody.registryOfficeApplicationReleaseNumber = await httpServerInterface.getReleaseNumberAsync();
            
            let controlConstructUuid = await ControlConstruct.getUuidAsync();

            let relayServerReplacementOperationUuid = controlConstructUuid + "-op-s-is-010";
            embedYourselfRequestBody.relayServerReplacementOperation = await operationServerInterface.getOperationNameAsync(relayServerReplacementOperationUuid);

            let relayOperationUpdateOperationUuid = controlConstructUuid + "-op-s-is-011";
            embedYourselfRequestBody.relayOperationUpdateOperation = await operationServerInterface.getOperationNameAsync(relayOperationUpdateOperationUuid);

            let deregistrationOperationUuid = controlConstructUuid + "-op-s-is-002";
            embedYourselfRequestBody.deregistrationOperation = await operationServerInterface.getOperationNameAsync(deregistrationOperationUuid);

            embedYourselfRequestBody.registryOfficeAddress = await tcpServerInterface.getLocalAddress();
            embedYourselfRequestBody.registryOfficePort = await tcpServerInterface.getLocalPort();
            embedYourselfRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(embedYourselfRequestBody);
            forwardingAutomation = new forwardingConstructAutomationInput(
                embedYourselfForwardingName,
                embedYourselfRequestBody,
                embedYourselfContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

            /***********************************************************************************
             * ApprovalNotification /v1/regard-application
             ************************************************************************************/
            let approvalNotificationForwardingName = "ApprovalNotification";
            let approvalNotificationContext;
            let approvalNotificationRequestBody = {};
            let httpClientUuid = await httpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber)
            let tcpClientUuid = (await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid))[0];
            approvalNotificationRequestBody.applicationName = applicationName;
            approvalNotificationRequestBody.applicationReleaseNumber = releaseNumber;
            approvalNotificationRequestBody.applicationAddress = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
            approvalNotificationRequestBody.applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);
            approvalNotificationRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(approvalNotificationRequestBody);
            forwardingAutomation = new forwardingConstructAutomationInput(
                approvalNotificationForwardingName,
                approvalNotificationRequestBody,
                approvalNotificationContext
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

exports.updateApprovalStatusBarred = function (logicalTerminationPointconfigurationStatus, forwardingConstructConfigurationStatus,
    applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * WithdrawnApprovalNotification /v1/disregard-application
             ************************************************************************************/
            let withdrawnApprovalNotificationForwardingName = "WithdrawnApprovalNotification";
            let withdrawnApprovalNotificationContext;
            let withdrawnApprovalNotificationRequestBody = {};
            withdrawnApprovalNotificationRequestBody.applicationName = applicationName;
            withdrawnApprovalNotificationRequestBody.applicationReleaseNumber = releaseNumber;
            withdrawnApprovalNotificationRequestBody = onfFormatter.modifyJsonObjectKeysToKebabCase(withdrawnApprovalNotificationRequestBody);
            let forwardingAutomation = new forwardingConstructAutomationInput(
                withdrawnApprovalNotificationForwardingName,
                withdrawnApprovalNotificationRequestBody,
                withdrawnApprovalNotificationContext
            );
            forwardingConstructAutomationList.push(forwardingAutomation);

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

exports.relayServerReplacement = function (applicationName, oldApplicationReleaseNumber, newApplicationReleaseNumber, newApplicationAddress, newApplicationPort) {
    return new Promise(async function (resolve, reject) {
        let forwardingConstructAutomationList = [];
        try {

            /***********************************************************************************
             * ServerReplacementBroadcast /v1/update-client
             ************************************************************************************/
            let serverReplacementBroadcastForwardingName = "ServerReplacementBroadcast";
            let serverReplacementBroadcastContext;
            let serverReplacementBroadcastRequestBody = {};
            serverReplacementBroadcastRequestBody.applicationName = applicationName;
            serverReplacementBroadcastRequestBody.oldApplicationReleaseNumber = oldApplicationReleaseNumber;
            serverReplacementBroadcastRequestBody.newApplicationReleaseNumber = newApplicationReleaseNumber;
            serverReplacementBroadcastRequestBody.newApplicationAddress = newApplicationAddress;
            serverReplacementBroadcastRequestBody.newApplicationPort = newApplicationPort;
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
            operationUpdateBroadcastRequestBody.applicationReleaseNumber = applicationReleaseNumber;
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