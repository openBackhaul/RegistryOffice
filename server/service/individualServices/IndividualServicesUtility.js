'use strict';

const eventDispatcher = require('onf-core-model-ap/applicationPattern/rest/client/eventDispatcher');

/**
 * @description This function returns list of registered application information application-name , release-number, application-address, application-port.
 * @return {Promise} return the list of application information
 * <b><u>Procedure :</u></b><br>
 * <b>step 1 :</b> Get forwarding-construct based on ForwardingName
 * <b>step 2 :</b> Get forwarding-construct UUID
 * <b>step 3 :</b> Get fc-port list using forwarding-construct UUID
 * <b>step 4 :</b> Fetch http-client-list using logical-termination-point uuid from fc-port
 * <b>step 5 :</b> get the application name, release number and server-ltp<br>
 * <b>step 6 :</b> get the ipaddress and port name of each associated tcp-client <br>
 **/
exports.getAllRegisteredApplicationList = function (protocol) {
    return new Promise(async function (resolve, reject) {
        let clientApplicationList = [];
        const forwardingName = "ApprovingApplicationCausesPreparingTheEmbedding.RequestForEmbedding";
        try {

            /** 
             * This class instantiate objects that holds the application name , release number, 
             * IpAddress and port information of the registered client applications
             */
            let clientApplicationInformation = class ClientApplicationInformation {

                /**
                 * @constructor 
                 * @param {String} applicationName name of the client application.
                 * @param {String} applicationReleaseNumber release number of the application.
                 * @param {String} applicationAddress ip address of the application.
                 * @param {String} applicationPort port of the application.
                 **/
                constructor(applicationName, applicationReleaseNumber, applicationAddress, applicationPort) {
                    this.applicationName = applicationName;
                    this.releaseNumber = applicationReleaseNumber;
                    if (applicationAddress != undefined) {
                        this.address = applicationAddress;
                    }
                    if (applicationPort != undefined) {
                        this.port = applicationPort;
                    }
                }
            };
            let forwardingConstructForTheForwardingName = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingName);
            let forwardingConstructUuid = forwardingConstructForTheForwardingName[onfAttributes.GLOBAL_CLASS.UUID];
            let fcPortList = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructUuid);
            let httpClientUuidList = []

            for (let fcPort of fcPortList) {
                let serverLtpList = await logicalTerminationPoint.getServerLtpListAsync(fcPort[onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT])
                httpClientUuidList = httpClientUuidList.concat(serverLtpList)
            }

            for (let i = 0; i < httpClientUuidList.length; i++) {
                let httpClientUuid = httpClientUuidList[i];
                let applicationName = await httpClientInterface.getApplicationNameAsync(httpClientUuid);
                let applicationReleaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientUuid);
                if (protocol == undefined) {
                    let clientApplication = new clientApplicationInformation(applicationName, applicationReleaseNumber);
                    clientApplicationList.push(clientApplication);
                } else {
                    let tcpClientUuidList = await logicalTerminationPoint.getServerLtpListAsync(httpClientUuid);
                    for (let i = 0; i < tcpClientUuidList.length; i++) {
                        let tcpClientUuid = tcpClientUuidList[i];
                        let tcpClientProtocol = await tcpClientInterface.getRemoteProtocolAsync(tcpClientUuid);
                        if (tcpClientProtocol.toLowerCase() == protocol.toLowerCase()) {
                            let address = await tcpClientInterface.getRemoteAddressAsync(tcpClientUuid);
                            let applicationAddress = "domain-name" in address ? address["domain-name"] : address["ip-address"]["ipv-4-address"];
                            let applicationPort = await tcpClientInterface.getRemotePortAsync(tcpClientUuid);
                            let clientApplication = new clientApplicationInformation(applicationName, applicationReleaseNumber, applicationAddress, applicationPort);
                            clientApplicationList.push(clientApplication);
                        }
                    }
                }
            }
            resolve(clientApplicationList);
        } catch (error) {
            reject();
        }
    });
}

/**
 * @description This function includes a new response profile if not exists for a registered application
 * @return {Promise} return true if operation is successful
 **/
exports.includeGenericResponseProfile = function (applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let isUpdated = true;
        try {
            let httpClientUuid = await HttpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
            if (httpClientUuid != undefined) {
                let applicationNameReference = onfPaths.HTTP_CLIENT_APPLICATION_NAME.replace("{uuid}", httpClientUuid);
                let isResponseProfileAlreadyExist = await ResponseProfile.findProfileUuidForFieldNameReferenceAsync(applicationNameReference);
                if (!isResponseProfileAlreadyExist) {
                    let releaseNumberReference = onfPaths.HTTP_CLIENT_RELEASE_NUMBER.replace("{uuid}", httpClientUuid);
                    let operationName = "/v1/list-applications-in-generic-representation";
                    let description = "List of registered application names and release numbers";
                    let datatype = "string";
                    let responseProfile = await ResponseProfile.createProfileAsync(operationName,
                        applicationNameReference,
                        description,
                        datatype,
                        releaseNumberReference);
                    isUpdated = await ProfileCollection.addProfileAsync(responseProfile);
                }
            }
            resolve(isUpdated);
        } catch (error) {
            reject();
        }
    });
}

/**
 * @description This function excludes an existing response profile if not exists for a registered application
 * @return {Promise} return true if operation is successful
 **/
exports.excludeGenericResponseProfile = function (applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let isUpdated = true;
        try {
            let httpClientUuid = await HttpClientInterface.getHttpClientUuidAsync(applicationName, releaseNumber);
            if (httpClientUuid != undefined) {
                let applicationNameReference = onfPaths.HTTP_CLIENT_APPLICATION_NAME.replace("{uuid}", httpClientUuid);
                let responseProfileUuid = await ResponseProfile.findProfileUuidForFieldNameReferenceAsync(applicationNameReference);
                if (responseProfileUuid) {
                    isUpdated = await ProfileCollection.deleteProfileAsync(responseProfileUuid);
                }
            }
            resolve(isUpdated);
        } catch (error) {
            reject();
        }
    });
}

/**
* @description This function helps to get the APISegment of the operationClient uuid
* @return {Promise} returns the APISegment
**/
exports.getApiSegmentOfOperationClient = function (operationClientUuid) {
    let APISegment;
    try {
        APISegment = operationClientUuid.split("-")[6];
    } catch (error) {
        console.log("error in extracting the APISegment");
    }
    return APISegment;
}

exports.resolveApplicationNameAndHttpClientLtpUuidFromForwardingNameOfTypeSubscription = async function (forwardingName, applicationName, releaseNumber) {
    let httpClientUuidOfTheSubscribedApplication = undefined;
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

    if (fcPortOutputDirectionLogicalTerminationPointList.length == 0) {
        return null;
    }

    for (let i = 0; i < fcPortOutputDirectionLogicalTerminationPointList.length; i++) {
        const opLtpUuid = fcPortOutputDirectionLogicalTerminationPointList[i];
        const httpLtpUuidList = await LogicalTerminationPoint.getServerLtpListAsync(opLtpUuid);
        const httpClientLtpUuid = httpLtpUuidList[0];
        const _applicationName = await httpClientInterface.getApplicationNameAsync(httpClientLtpUuid);
        const _releaseNumber = await httpClientInterface.getReleaseNumberAsync(httpClientLtpUuid);
        if (_applicationName == applicationName && _releaseNumber == releaseNumber) {
            httpClientUuidOfTheSubscribedApplication = httpClientLtpUuid;
        }
    }
    return httpClientUuidOfTheSubscribedApplication;
}

/**
 * @description This function automates the forwarding construct by calling the appropriate call back operations based on the fcPort input and output directions.
 * @param {String} forwardingKindName Name of forwarding which has to be triggered
 * @param {list}   attributeList list of attributes required during forwarding construct automation(to send in the request body)
 * @param {String} user user who initiates this request
 * @param {string} originator originator of the request
 * @param {string} xCorrelator flow id of this request
 * @param {string} traceIndicator trace indicator of the request
 * @param {string} customerJourney customer journey of the request
 **/
exports.forwardRequest = function (forwardingKindName, attributeList, user, xCorrelator, traceIndicator, customerJourney) {
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
