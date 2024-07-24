'use strict';

const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const OnfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const RestRequestBuilder = require('onf-core-model-ap/applicationPattern/rest/client/RequestBuilder');
const ExecutionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const restClient = require('onf-core-model-ap/applicationPattern/rest/client/Client');
const Qs = require('qs');
const createHttpError = require('http-errors');

/**
 * This function formulates the request body based on the operation name and application 
 * @param {String} operationClientUuid uuid of the client operation that needs to be addressed
 * @param {object} httpRequestBody request body for the operation
 * @param {String} user username of the request initiator. 
 * @param {String} xCorrelator UUID for the service execution flow that allows to correlate requests and responses. 
 * @param {String} traceIndicator Sequence number of the request. 
 * @param {String} customerJourney Holds information supporting customer’s journey to which the execution applies.
 * @param {String} httpMethod method of the request if undefined defaults to POST
 * @param {Object} params path and query parameters
 */
exports.dispatchEvent = async function (operationClientUuid, httpRequestBody, user, xCorrelator, traceIndicator, customerJourney, httpMethod, params) {
    let response = {};
    let operationKey = await OperationClientInterface.getOperationKeyAsync(
        operationClientUuid);
    let operationName = await OperationClientInterface.getOperationNameAsync(
        operationClientUuid);

    let httpClientUuid = await LogicalTerminationPoint.getServerLtpListAsync(operationClientUuid);
    let serverApplicationName = await HttpClientInterface.getApplicationNameAsync(httpClientUuid[0]);
    let serverApplicationReleaseNumber = await HttpClientInterface.getReleaseNumberAsync(httpClientUuid[0]);
    let originator = await HttpServerInterface.getApplicationNameAsync();

    let httpRequestHeader = new RequestHeader(
        user,
        originator,
        xCorrelator,
        traceIndicator,
        customerJourney,
        operationKey
    );
    httpRequestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeader);

    let responseReceived = await RestRequestBuilder.BuildAndTriggerRestRequest(
        operationClientUuid,
        httpMethod,
        httpRequestHeader,
        httpRequestBody,
        params
    );
    response.code = responseReceived.status;
    if (response.code.toString().startsWith("2")) {
        response.data = responseReceived.data;
    } else {
        ExecutionAndTraceService.recordServiceRequestFromClient(
            serverApplicationName, 
            serverApplicationReleaseNumber, 
            xCorrelator, 
            traceIndicator, 
            user, 
            originator, 
            operationName, 
            response.code, 
            httpRequestBody, 
            response.data)
            .catch((error) => console.log(`record service request ${JSON.stringify({
                xCorrelator,
                traceIndicator,
                user,
                originator,
                serverApplicationName,
                serverApplicationReleaseNumber,
                operationName,
                resCode : response.code,
                reqBody: httpRequestBody,
                resBody: response.data
            })} failed with error: ${error.message}`));
    }
    return response;
}

/**
 * This function Builds and trigger request to the requestor 
 * @param {String} requestorProtocol protocol to address the requestor
 * @param {String} requestorAddress address of the requestor
 * @param {String} requestorPort port to address the requestor 
 * @param {String} requestorReceiveOperation operation name to address the requestor. 
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc. 
 * @param {Object} requestBody request body for the operation
 * @param {String} method method of the request
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @param {Object} params object of pathParams<Map> and queryParams<Object> 
 *                 (Example :  params = {"query" : {},"path" : new Map()})
 **/
exports.BuildAndTriggerRestRequestToRequestor = async function (requestorProtocol, requestorAddress, requestorPort, requestorReceiveOperation, requestHeaders, requestBody, method, traceIndicatorIncrementer, params) {
    try {
        let queryParams;
        let pathParams;
        if (requestorReceiveOperation.indexOf("/") !== 0) {
            requestorReceiveOperation = "/" + requestorReceiveOperation;
        }
        let url = requestorProtocol.toLowerCase() + "://" + requestorAddress + ":" + requestorPort +
            requestorReceiveOperation;
        if (params) {
            queryParams = params.query;
            pathParams = params.path;
            if (pathParams) {
                pathParams.forEach((value, param) => {
                    requestorReceiveOperation = requestorReceiveOperation.replace(param, value)
                });
            }
        }
        /******************************************************************************************************************
         *  Fetching of Operation key to be updated based on the decision made on issue
         *  https://github.com/openBackhaul/AirInterfacePowerSaver/issues/114
         *****************************************************************************************************************/

        let operationUuid = await OperationServerInterface.getOperationServerUuidAsync(requestorReceiveOperation);
        let operationKey = await OperationServerInterface.getOperationKeyAsync(operationUuid);
        let originator = await HttpServerInterface.getApplicationNameAsync();
        let requestHeader = new RequestHeader(
            requestHeaders.user,
            originator,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            operationKey
        );
        requestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestHeader);
        let request = {
            params: queryParams,
            method: method,
            url: url,
            headers: requestHeader,
            data: requestBody,
            paramsSerializer: function (params) {
                return Qs.stringify(params, {
                    arrayFormat: 'brackets'
                })
            }
        }
        let response = await restClient.post(request);
        console.log("\n callback : " + method + " " + url + " header :" + JSON.stringify(requestHeader) +
            "body :" + JSON.stringify(requestBody) + "response code:" + response.status);
        return response;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else if (error.request) {
            console.log(`Request errored with ${error}`);
            return new createHttpError.RequestTimeout();
        }
        console.log(`Unknown request error: ${error}`);
        return new createHttpError.InternalServerError();
    }
}