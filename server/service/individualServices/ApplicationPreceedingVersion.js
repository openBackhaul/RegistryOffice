/**
 * @file This module provides functionality to to include a application preceeding information to the load file
 * @module MonitorTypeApprovalChannel
 **/


const fs = require('fs');
global.applicationDataFile;

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
                            preceedingApplicationInformation["preceeding-application-name"] = futureApplicationName;
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }
                        else if (_preceedingApplicationName != preceedingApplicationName) {
                            preceedingApplicationInformation["preceeding-application-name"] = preceedingApplicationName;
                            fs.writeFileSync(applicationDataFile, JSON.stringify(applicationData));
                            isUpdated = true;
                        }

                        if(preceedingReleaseNumber==undefined){ 
                            preceedingApplicationInformation["preceeding-release-number"] = futureReleaseNumber;
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
                        "preceeding-application-name": preceedingApplicationName,
                        "preceeding-release-number": preceedingReleaseNumber,
                        "future-application-name": futureApplicationName,
                        "future-release-number": futureReleaseNumber
                    };
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
