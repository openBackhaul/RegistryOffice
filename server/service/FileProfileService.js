'use strict';
const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns the description of the file
 *
 * uuid String 
 * returns inline_response_200_17
 **/
exports.getFileProfileFileDescription = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:file-description": value
  };
}

/**
 * Returns the identifier of the file
 *
 * uuid String 
 * returns inline_response_200_16
 **/
exports.getFileProfileFileIdentifier = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:file-identifier": value
  };
}

/**
 * Returns the path of the file
 *
 * uuid String 
 * returns inline_response_200_18
 **/
exports.getFileProfileFilePath = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:file-path": value
  };
}

/**
 * Returns the allowed operation on the file
 *
 * uuid String 
 * returns inline_response_200_21
 **/
exports.getFileProfileOperation = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:operation": value
  };
}

/**
 * Returns the password for acccessing the file
 *
 * uuid String 
 * returns inline_response_200_20
 **/
exports.getFileProfilePassword = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:password": value
  };
}

/**
 * Returns the user name for acccessing the file
 *
 * uuid String 
 * returns inline_response_200_19
 **/
exports.getFileProfileUserName = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "file-profile-1-0:user-name": value
  };
}

/**
 * Configures path of the file
 *
 * body Fileprofileconfiguration_filepath_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileFilePath = async function(body, url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

/**
 * Configures the allowed operation on the file
 *
 * body Fileprofileconfiguration_operation_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileOperation = async function(body, url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

/**
 * Configures the password for acccessing the file
 *
 * body Fileprofileconfiguration_password_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfilePassword = async function(body, url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}

/**
 * Configures the user name for acccessing the file
 *
 * body Fileprofileconfiguration_username_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileUserName = async function(body, url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}
