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
            if (operationName.includes("disregard-application")) {
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
                    "release-number": releaseNumber
                }
            } else if (operationName.includes("regard-application")) {
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
                        "release-number": releaseNumber
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
            } else if (operationName.includes("update-client")) {
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
            } else if (operationName.includes("update-ltp")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("delete-ltp-and-dependents")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("update-fc")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("update-fc-port")) {

                // need to update after getting ALT application 

            } else if (operationName.includes("delete-fc-port")) {

                // need to update after getting ALT application 

            }
            resolve(httpRequestBody);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}