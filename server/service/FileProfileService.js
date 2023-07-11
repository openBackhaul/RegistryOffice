'use strict';
var fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');


/**
 * Returns the description of the file
 *
 * uuid String 
 * returns inline_response_200_17
 **/
exports.getFileProfileFileDescription = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:file-description": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Returns the identifier of the file
 *
 * uuid String 
 * returns inline_response_200_16
 **/
exports.getFileProfileFileIdentifier = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:file-identifier": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Returns the path of the file
 *
 * uuid String 
 * returns inline_response_200_18
 **/
exports.getFileProfileFilePath = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:file-path": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Returns the allowed operation on the file
 *
 * uuid String 
 * returns inline_response_200_21
 **/
exports.getFileProfileOperation = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:operation": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Returns the password for acccessing the file
 *
 * uuid String 
 * returns inline_response_200_20
 **/
exports.getFileProfilePassword = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:password": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Returns the user name for acccessing the file
 *
 * uuid String 
 * returns inline_response_200_19
 **/
exports.getFileProfileUserName = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "file-profile-1-0:user-name": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {}
    reject();
  });
}


/**
 * Configures path of the file
 *
 * body Fileprofileconfiguration_filepath_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileFilePath = function(body, url) {
  return new Promise(async function (resolve, reject) {
    try {
      await fileOperation.writeToDatabaseAsync(url, body, false);
      resolve();
    } catch (error) {}
    reject();
  });
}


/**
 * Configures the allowed operation on the file
 *
 * body Fileprofileconfiguration_operation_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileOperation = function(body, url) {
  return new Promise(async function (resolve, reject) {
    try {
      await fileOperation.writeToDatabaseAsync(url, body, false);
      resolve();
    } catch (error) {}
    reject();
  });
}


/**
 * Configures the password for acccessing the file
 *
 * body Fileprofileconfiguration_password_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfilePassword = function(body, url) {
  return new Promise(async function (resolve, reject) {
    try {
      await fileOperation.writeToDatabaseAsync(url, body, false);
      resolve();
    } catch (error) {}
    reject();
  });
}


/**
 * Configures the user name for acccessing the file
 *
 * body Fileprofileconfiguration_username_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileUserName = function(body, url) {
  return new Promise(async function (resolve, reject) {
    try {
      await fileOperation.writeToDatabaseAsync(url, body, false);
      resolve();
    } catch (error) {}
    reject();
  });
}

