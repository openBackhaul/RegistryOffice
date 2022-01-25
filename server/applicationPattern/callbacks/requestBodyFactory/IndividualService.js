/**
 * @file This module provides functionality to build the request body. This file should be modified accourding to the individual service forwarding requirements  
 * This class consolidates the technology specific extensions.
 * @author      prathiba.jeevan.external@telefonica.com
 * @since       23.09.2021
 * @version     1.0
 * @copyright   Telefónica Germany GmbH & Co. OHG* 
 **/

'use strict';

/**
 * This funtion formulates the request body based on the operation name and application 
 * @param {String} clientApplicationName name of the client application.
 * @param {String} operationName name of the client operation that needs to be addressed.
 * @param {String} attributeList list of attributes that needs to be included in the request body based on the operation name. 
 */
 exports.prepareRequestBody = function (clientApplicationName, operationName, attributeList) {
    return new Promise(async function (resolve, reject) {
        let httpRequestBody = {};
        try {
            if (operationName.includes("v1/disregard-application")) {
                let applicationName;
                let releaseNumber;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "application-name") {
                        applicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "application-release-number") {
                        releaseNumber = attributeList[i]["value"];
                    }
                }
                httpRequestBody = {
                    "application-name": applicationName,
                    "application-release-number": releaseNumber
                }
            } else if (operationName.includes("v1/regard-application")) {
                if (clientApplicationName == "TypeApprovalRegister") {
                    let applicationName;
                    let releaseNumber;
                    for (let i = 0; i < attributeList.length; i++) {
                        if (attributeList[i]["name"] == "application-name") {
                            applicationName = attributeList[i]["value"];
                        } else if (attributeList[i]["name"] == "release-number") {
                            releaseNumber = attributeList[i]["value"];
                        }
                    }
                    httpRequestBody = {
                        "application-name": applicationName,
                        "application-release-number": releaseNumber
                    }
                } else {
                    let applicationName;
                    let releaseNumber;
                    let applicationAddress;
                    let applicationPort;
                    for (let i = 0; i < attributeList.length; i++) {
                        if (attributeList[i]["name"] == "application-name") {
                            applicationName = attributeList[i]["value"];
                        } else if (attributeList[i]["name"] == "release-number") {
                            releaseNumber = attributeList[i]["value"];
                        } else if (attributeList[i]["name"] == "application-address") {
                            applicationAddress = attributeList[i]["value"];
                        } else if (attributeList[i]["name"] == "application-port") {
                            applicationPort = attributeList[i]["value"];
                        }
                    }
                    httpRequestBody = {
                        "application-name": applicationName,
                        "application-release-number": releaseNumber,
                        "application-address": applicationAddress,
                        "application-port": applicationPort
                    }
                }
            } else if (operationName.includes("v1/update-client")||
            operationName.includes("/v1/relay-server-replacement")) {
                let applicationName;
                let oldApplicationReleaseNumber;
                let newApplicationReleaseNumber;
                let newApplicationAddress;
                let newApplicationPort;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "application-name") {
                        applicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "old-application-release-number") {
                        oldApplicationReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "new-application-release-number") {
                        newApplicationReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "new-application-address") {
                        newApplicationAddress = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "new-application-port") {
                        newApplicationPort = attributeList[i]["value"];
                    }
                }
                httpRequestBody = {
                    "application-name": applicationName,
                    "old-application-release-number": oldApplicationReleaseNumber,
                    "new-application-release-number": newApplicationReleaseNumber,
                    "new-application-address": newApplicationAddress,
                    "new-application-port": newApplicationPort
                }
            } else if (operationName.includes("/v1/embed-yourself")) {
                let registryApplicationName;
                let registryApplicationReleaseNumber;
                let registryApplicationAddress;
                let registryApplicationPort;
                let relayServerReplacementOperationName;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "registry-office-application") {
                        registryApplicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "registry-office-application-release-number") {
                        registryApplicationReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "registry-office-address") {
                        registryApplicationAddress = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "registry-office-port") {
                        registryApplicationPort = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "relay-server-replacement-operation") {
                        relayServerReplacementOperationName = attributeList[i]["value"];
                    }
                }
                httpRequestBody = {
                    "registry-office-application": registryApplicationName,
                    "registry-office-application-release-number": registryApplicationReleaseNumber,
                    "registry-office-address": registryApplicationAddress,
                    "registry-office-port": registryApplicationPort,
                    "relay-server-replacement-operation": relayServerReplacementOperationName
                }
            }else if (operationName.includes("v1/register-application")) {
                let registryOfficeApplicationName;
                let registryOfficeReleaseNumber;
                let registryOfficeTcpIpAddress;
                let registryOfficeTcpPort;
                let embeddingOperation;
                let clientUpdateOperation;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "application-name") {
                        registryOfficeApplicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "application-release-number") {
                        registryOfficeReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "application-address") {
                        registryOfficeTcpIpAddress = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "application-port") {
                        registryOfficeTcpPort = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "embedding-operation") {
                        embeddingOperation = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "client-update-operation") {
                        clientUpdateOperation = attributeList[i]["value"];
                    }
                }
                httpRequestBody = {
                    "application-name": registryOfficeApplicationName,
                    "application-release-number": registryOfficeReleaseNumber,
                    "application-address": registryOfficeTcpIpAddress,
                    "application-port": registryOfficeTcpPort,
                    "embedding-operation": embeddingOperation,
                    "client-update-operation": clientUpdateOperation
                }
            }else if (operationName.includes("v1/deregister-application")) {
                let registryOfficeApplicationName;
                let registryOfficeReleaseNumber;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "application-name") {
                        registryOfficeApplicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "application-release-number") {
                        registryOfficeReleaseNumber = attributeList[i]["value"];
                    } 
                }
                httpRequestBody = {
                    "application-name": registryOfficeApplicationName,
                    "application-release-number": registryOfficeReleaseNumber
                }
            }else if (operationName.includes("v1/notify-deregistrations") ||
            operationName.includes("/v1/notify-approvals") || 
            operationName.includes("/v1/notify-withdrawn-approvals")|| 
            operationName.includes("/v1/redirect-info-about-approval-status-changes")) {
                let subscriberApplicationName;
                let subscriberReleaseNumber;
                let subscriberTcpIpAddress;
                let subscriberTcpPort;
                let subscriberOperation;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "subscriber-application") {
                        subscriberApplicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "subscriber-release-number") {
                        subscriberReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "subscriber-address") {
                        subscriberTcpIpAddress = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "subscriber-port") {
                        subscriberTcpPort = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "subscriber-operation") {
                        subscriberOperation = attributeList[i]["value"];
                    } 
                }
                httpRequestBody = {
                    "subscriber-application": subscriberApplicationName,
                    "subscriber-release-number": subscriberReleaseNumber,
                    "subscriber-address": subscriberTcpIpAddress,
                    "subscriber-port": subscriberTcpPort,
                    "subscriber-operation": subscriberOperation
                }
            }else if (operationName.includes("v1/inquire-application-type-approvals")) {
                let approvalApplicationName;
                let approvalReleaseNumber;
                let approvalTcpIpAddress;
                let approvalTcpPort;
                let approvalOperation;
                for (let i = 0; i < attributeList.length; i++) {
                    if (attributeList[i]["name"] == "approval-application") {
                        approvalApplicationName = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "approval-application-release-number") {
                        approvalReleaseNumber = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "approval-application-address") {
                        approvalTcpIpAddress = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "approval-application-port") {
                        approvalTcpPort = attributeList[i]["value"];
                    } else if (attributeList[i]["name"] == "approval-operation") {
                        approvalOperation = attributeList[i]["value"];
                    } 
                }
                httpRequestBody = {
                    "approval-application": approvalApplicationName,
                    "approval-application-release-number": approvalReleaseNumber,
                    "approval-application-address": approvalTcpIpAddress,
                    "approval-application-port": approvalTcpPort,
                    "approval-operation": approvalOperation
                }
            }else if (operationName.includes("v1/update-ltp")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("v1/delete-ltp-and-dependents")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("v1/update-fc")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("v1/update-fc-port")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("v1/delete-fc-port")) {

                // need to update after getting ALT application 

            }
            resolve(httpRequestBody);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}