/**
 * @file This module provides functionality to monitor the whether the registered application are approved within the required time.
 * @module MonitorTypeApprovalChannel
 **/


const fs = require('fs');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const IntegerProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/IntegerProfile');
const eventDispatcher = require('onf-core-model-ap/applicationPattern/rest/client/eventDispatcher');
const Profile = require('onf-core-model-ap/applicationPattern/onfModel/models/Profile');
const fileProfileOperation = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/FileProfile')
const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');

/**
 * @description This method adds an entry to the monitoring list
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
exports.AddEntryToMonitorApprovalStatusChannel = async function (applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let operationStatus = false;
        try {
            if (applicationName != undefined && releaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let registeredApplicationList = applicationData["application-registration-time"];
                for (let i = 0; i < registeredApplicationList.length; i++) {
                    let registeredApplication = registeredApplicationList[i];
                    let registeredApplicationName = registeredApplication["application-name"];
                    let registeredReleaseNumber = registeredApplication["release-number"];
                    if (registeredApplicationName == applicationName && registeredReleaseNumber == releaseNumber) {
                        registeredApplication["registered-time-stamp"] = new Date().getTime() / 1000;
                        fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                        operationStatus = true;
                    }
                }
                if (operationStatus == false) {
                    let registeredApplicationInstance = {
                        "application-name": applicationName,
                        "release-number": releaseNumber,
                        "registered-time-stamp": new Date().getTime() / 1000
                    };
                    registeredApplicationList.push(registeredApplicationInstance);
                    fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                    operationStatus = true;
                }
            }
        
            resolve(operationStatus);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * @description This method removed an entry from the monitoring list
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
exports.removeEntryFromMonitorApprovalStatusChannel = async function (applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let operationStatus = false;
        try {
            if (applicationName != undefined && releaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let registeredApplicationList = applicationData["application-registration-time"];
                for (let i = 0; i < registeredApplicationList.length; i++) {
                    let registeredApplication = registeredApplicationList[i];
                    let registeredApplicationName = registeredApplication["application-name"];
                    let registeredReleaseNumber = registeredApplication["release-number"];
                    if (registeredApplicationName == applicationName && registeredReleaseNumber == releaseNumber) {
                        registeredApplicationList.splice(i, 1);
                        fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                        operationStatus = true;
                    }
                }
            }
        
            resolve(operationStatus);
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * This method monitors the type approval channel continuously in an infinite loop
 * Recommended to trigger this monitoring job during the application startup
 */
exports.MonitorApprovalStatusChannel = async function () {
    try {

        let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
            let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
            let registeredApplicationList = applicationData["application-registration-time"];
            for (let i = 0; i < registeredApplicationList.length; i++) {
                await CyclicMonitoringProcess(registeredApplicationList[i]);
            }
        
    } catch (error) {
        console.log(error);
    }
}

/**
 * This method monitors the type approval channel continuously and deregister an application if it is not approved within the expected time configured in the integer-profile ro-*-*-*-integer-p-000 <br>
 * The following are the list of forwarding-construct that will be automated to transfer the data from this current release to next release
 * 1. Starts the monitoring if there is not_yet_approved applications available in the list
 * 2. For every application in the list , checks whether a fc-port is available in the forwarding-construct ServerReplacementBroadcast
 * 2.1 If not , then if the current time is greater than summation of {"the not_yet_approved application's registration time"  + "integer-value of the waitTimeToApprove"
 * 2.1.1 A deregistration application will be triggered for the not_yet_approved application 
 * 2.2 If yes , removes the data of the approved application from the not_yet_approved list
 */
async function CyclicMonitoringProcess(registeredApplication) {
    return new Promise(async function (resolve, reject) {
        try {
            let registeredApplicationName = registeredApplication["application-name"];
            let registeredReleaseNumber = registeredApplication["release-number"];
            if (registeredApplicationName != undefined && registeredReleaseNumber != undefined) {
                let httpClientUuid = await HttpClientInterface.getHttpClientUuidAsync(registeredApplicationName, registeredReleaseNumber);
                if (httpClientUuid != undefined) {
                    let clientLTPs = await LogicalTerminationPoint.getClientLtpListAsync(httpClientUuid);
                    if (clientLTPs.length > 0) {
                        let forwardingConstruct = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync("ServerReplacementBroadcast");
                        let fcPortList = forwardingConstruct["fc-port"];
                        let fcPort = fcPortList.filter(fcport => clientLTPs.includes(fcport["logical-termination-point"]));
                        if (fcPort != undefined && fcPort.length > 0) {
                            console.log("application approved");
                            await exports.removeEntryFromMonitorApprovalStatusChannel(registeredApplicationName, registeredReleaseNumber);
                        } else {
                            let waitTimeToApprove = await IntegerProfile.getIntegerValueAsync("ro-2-0-0-integer-p-000");
                            let registeredTime = registeredApplication["registered-time-stamp"];
                            let isTimeExceeded = (waitTimeToApprove + registeredTime) < new Date().getTime() / 1000 ? true : false;
                            if (isTimeExceeded) {
                                console.log("time exceeded");
                                triggerDeregistration(registeredApplicationName, registeredReleaseNumber);
                                await exports.removeEntryFromMonitorApprovalStatusChannel(registeredApplicationName, registeredReleaseNumber);
                            } else {
                                console.log("time nottt exceeded");
                            }
                        }
                    }
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * @description This method triggers deregistration of the unapproved application
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
async function triggerDeregistration(applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        try {
            /***********************************************************************************
             * /v1/deregister-application
             ************************************************************************************/
            let response = await eventDispatcher.dispatchEvent(
                "ro-2-0-0-op-c-bm-ro-1-0-0-002", {
                "application-name": applicationName,
                "application-release-number": releaseNumber
            }
            );
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });
}

exports.getWaitTimeApproveValue = async function() {
    let integerProfiles = await ProfileCollection.getProfileListForProfileNameAsync(Profile.profileNameEnum.INTEGER_PROFILE);
    let config = integerProfiles[0][onfAttributes.INTEGER_PROFILE.PAC][onfAttributes.INTEGER_PROFILE.CONFIGURATION];
    return config[onfAttributes.INTEGER_PROFILE.INTEGER_VALUE];
 }
