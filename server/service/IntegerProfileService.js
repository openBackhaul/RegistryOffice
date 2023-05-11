'use strict';
var fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const IntegerProfile = require('onf-core-model-ap/applicationPattern/onfModel/models/profile/IntegerProfile');


/**
 * Returns the name of the Integer
 *
 * uuid String 
 * returns inline_response_200_22
 **/
exports.getIntegerProfileIntegerName = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "integer-profile-1-0:integer-name": value
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
 * Returns the configured value of the Integer
 *
 * uuid String 
 * returns inline_response_200_26
 **/
exports.getIntegerProfileIntegerValue = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "integer-profile-1-0:integer-value": value
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
 * Returns the maximum value of the Integer
 *
 * uuid String 
 * returns inline_response_200_25
 **/
exports.getIntegerProfileMaximum = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "integer-profile-1-0:maximum": value
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
 * Returns the minimum value of the Integer
 *
 * uuid String 
 * returns inline_response_200_24
 **/
exports.getIntegerProfileMinimum = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "integer-profile-1-0:minimum": value
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
 * Returns the unit of the Integer
 *
 * uuid String 
 * returns inline_response_200_23
 **/
exports.getIntegerProfileUnit = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "integer-profile-1-0:unit": value
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
 * Configures value of the Integer
 *
 * body Integerprofileconfiguration_integervalue_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putIntegerProfileIntegerValue = function(body, url, uuid) {
  return new Promise(async function (resolve, reject) {
    try {
      let maximumIntegerValue = await IntegerProfile.getMaximumAsync(uuid);
      let minimumIntegerValue = await IntegerProfile.getMinimumAsync(uuid);
      let value = body["integer-profile-1-0:integer-value"];
      if(value <= maximumIntegerValue && value >= minimumIntegerValue){
        await fileOperation.writeToDatabaseAsync(url, body, false);
      } 
      else{
        throw new Error("Integer value must between maximum and minimun value")
      }     
      resolve();
    } catch (error) {
      reject(error.message);
    }
  });
}
