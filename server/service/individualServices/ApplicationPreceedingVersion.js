/**
 * @file This module provides functionality to to include a application preceeding information to the load file
 * @module MonitorTypeApprovalChannel
 **/


const fs = require('fs');
const fileProfileOperation = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/FileProfile')
/**
 * @description This method adds an entry to the preceeding-application-information list
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
exports.addEntryToPreceedingVersionList = async function (preceedingApplicationName, preceedingReleaseNumber, futureApplicationName, futureReleaseNumber) {
    return new Promise(async function (resolve, reject) {
        let isfutureApplicationInformationExist = false;
        let isUpdated = false;
        try {
            if (futureApplicationName != undefined && futureReleaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let preceedingApplicationInformationList = applicationData["preceeding-application-information"];
                for (let i = 0; i < preceedingApplicationInformationList.length; i++) {
                    let preceedingApplicationInformation = preceedingApplicationInformationList[i];
                    let _preceedingApplicationName = preceedingApplicationInformation["preceeding-application-name"];
                    let _preceedingReleaseNumber = preceedingApplicationInformation["preceeding-release-number"];
                    let _futureApplicationName = preceedingApplicationInformation["future-application-name"];
                    let _futureReleaseNumber = preceedingApplicationInformation["future-release-number"];
                    if (_futureApplicationName == futureApplicationName && _futureReleaseNumber == futureReleaseNumber) {
                        isfutureApplicationInformationExist = true;
                        if(preceedingApplicationName==undefined){ 
                            delete preceedingApplicationInformation["preceeding-application-name"];
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }
                        else if (_preceedingApplicationName != preceedingApplicationName) {
                            preceedingApplicationInformation["preceeding-application-name"] = preceedingApplicationName;
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }

                        if(preceedingReleaseNumber==undefined){ 
                            delete preceedingApplicationInformation["preceeding-release-number"];
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }
                        if (_preceedingReleaseNumber != preceedingReleaseNumber) {
                            preceedingApplicationInformation["preceeding-release-number"] = preceedingReleaseNumber;
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }
                    }
                }
                if (isfutureApplicationInformationExist == false) {
                    let preceedingApplicationInformation = {
                        "future-application-name": futureApplicationName,
                        "future-release-number": futureReleaseNumber
                    };
                    if(preceedingApplicationName != undefined){
                        preceedingApplicationInformation["preceeding-application-name"] = preceedingApplicationName;
                    }

                    if(preceedingReleaseNumber != undefined){
                        preceedingApplicationInformation["preceeding-release-number"] = preceedingReleaseNumber;
                    }
                    preceedingApplicationInformationList.push(preceedingApplicationInformation);
                    fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                    isUpdated = true;
                }
            }
        
            resolve(isUpdated);
        } catch (error) {
            reject(error);
        }
    });
}


/**
 * @description This method adds an entry to the preceeding-application-information list
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
exports.getPreceedingApplicationInformation = async function (futureApplicationName, futureReleaseNumber) {
    return new Promise(async function (resolve, reject) {
        let preceedingApplication;
        try {
            if (futureApplicationName != undefined && futureReleaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let preceedingApplicationInformationList = applicationData["preceeding-application-information"];
                for (let i = 0; i < preceedingApplicationInformationList.length; i++) {
                    let preceedingApplicationInformation = preceedingApplicationInformationList[i];
                    let _preceedingApplicationName = preceedingApplicationInformation["preceeding-application-name"];
                    let _preceedingReleaseNumber = preceedingApplicationInformation["preceeding-release-number"];
                    let _futureApplicationName = preceedingApplicationInformation["future-application-name"];
                    let _futureReleaseNumber = preceedingApplicationInformation["future-release-number"];
                    if (_futureApplicationName == futureApplicationName && _futureReleaseNumber == futureReleaseNumber) {
                        preceedingApplication = {};
                        preceedingApplication.preceedingApplicationName = _preceedingApplicationName;
                        preceedingApplication.preceedingReleaseNumber = _preceedingReleaseNumber;
                    }
                }
            }
        
            resolve(preceedingApplication);
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
exports.removePreceedingApplicationInformation = async function (preceedingApplicationName, preceedingReleaseNumber) {
    return new Promise(async function (resolve, reject) {
        let operationStatus = false;
        try {
            if (preceedingApplicationName != undefined && preceedingReleaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let preceedingApplicationInformationList = applicationData["preceeding-application-information"];
                for (let i = 0; i < preceedingApplicationInformationList.length; i++) {
                    let preceedingApplicationInformation = preceedingApplicationInformationList[i];
                    let _preceedingApplicationName = preceedingApplicationInformation["preceeding-application-name"];
                    let _preceedingReleaseNumber = preceedingApplicationInformation["preceeding-release-number"];
                    if (_preceedingApplicationName == preceedingApplicationName && _preceedingReleaseNumber == preceedingReleaseNumber) {
                        preceedingApplicationInformationList.splice(i, 1);
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
 * @description This method removed an entry from the preceeding application list
 * @param {string} applicationName name of the application
 * @param {string} releaseNumber release number of the application  
 */
exports.removeEntryFromPrecedingVersionList = async function (applicationName, releaseNumber) {
    return new Promise(async function (resolve, reject) {
        let operationStatus = false;
        try {
            if (applicationName != undefined && releaseNumber != undefined) {
                let applicationDataFile = await fileProfileOperation.getApplicationDataFileContent()
                let applicationData = JSON.parse(fs.readFileSync(applicationDataFile, 'utf8'));
                let preceedingApplicationInformationList = applicationData["preceeding-application-information"];
                for (let i = 0; i < preceedingApplicationInformationList.length; i++) {
                    let preceedingApplicationInformation = preceedingApplicationInformationList[i];
                    let preceedingApplicationName = preceedingApplicationInformation["future-application-name"];
                    let preceedingReleaseNumber = preceedingApplicationInformation["future-release-number"];
                    if (preceedingApplicationName == applicationName && preceedingReleaseNumber == releaseNumber) {
                        preceedingApplicationInformationList.splice(i, 1);
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