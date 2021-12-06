/**
 * @file This class provides a stub to instantiate and generate a JSONObject for a OperationServerInterface layer protocol.<br>
 * This class is a sub class for LayerProtocol <br>
 * @author      prathiba.jeevan.external@telefonica.com
 * @since       07.08.2021
 * @version     1.0
 * @copyright   Telefónica Germany GmbH & Co. OHG
 **/

'use strict';
const coreModel = require('../CoreModel');
const layerProtocol = require('../LayerProtocol');

/** 
 * @extends layerProtocol
 */
class OperationServerInterface extends layerProtocol {

    static OperationServerInterfacePac = class OperationServerInterfacePac {
        operationServerInterfaceCapability;
        operationServerInterfaceConfiguration;
        static layerProtocolName = layerProtocol.layerProtocolNameEnum.OPERATION_SERVER;

        static OperationServerInterfaceCapability = class OperationServerInterfaceCapability {
            operationName;

            /**
             * constructor 
             * @param {string} operationName name of the operation..
             */
            constructor(operationName) {
                this.operationName = operationName;
            }
        };
        static OperationServerInterfaceConfiguration = class OperationServerInterfaceConfiguration {
            lifeCycleState;
            operationKey;
            static lifeCycleStateEnum = {
                EXPERIMENTAL: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
                OPERATIONAL: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_OPERATIONAL",
                DEPRICATED: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_DEPRICATED",
                OBSOLETE: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_OBSOLETE",
                UNKNOWN: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_UNKNOWN",
                NOT_YET_DEFINED: "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
            };

            /**
             * constructor 
             * @param {string} operationState operation state of the operation server<br>
             * @param {string} lifeCycleState life cycle state of the operation server<br>
             */
            constructor(lifeCycleState, operationKey) {
                this.lifeCycleState = lifeCycleState;
                this.operationKey = operationKey;
            }
        };

        /**
         * constructor 
         * @param {String} operationName name of the operation.
         */
        constructor(operationName) {
            this.operationServerInterfaceCapability = new OperationServerInterfacePac.OperationServerInterfaceCapability(operationName);
            this.operationServerInterfaceConfiguration = new OperationServerInterfacePac.OperationServerInterfaceConfiguration();
        }
    }

    /**
     * constructor 
     * @param {String} operationName name of the operation.
     */
    constructor(operationName) {
        super(0, OperationServerInterface.OperationServerInterfacePac.layerProtocolName);
        this["operation-server-interface-1-0:operation-server-interface-pac"] = new OperationServerInterface.OperationServerInterfacePac(operationName);
    }

    /**
     * @description This function returns the operation name for the given operation server uuid.<br>
     * @param {String} operationServerUuid uuid of the operation server instance<br>
     * @returns {promise} returns operation name of the operation server instance<br>
     * <b><u>Procedure :</u></b><br>
     * <b>step 1 :</b> Get the logical-termination-point instance for the provided uuid <br>
     * <b>step 2 :</b> Get the operation name from the operation server capability<br>
     **/
    static getOperationName(operationServerUuid) {
        return new Promise(async function (resolve, reject) {
            let operationName;
            try {
                let operationServerLogicalTerminationPointInstance = await coreModel.getLogicalTerminationPointForTheUuid(operationServerUuid);
                operationName = operationServerLogicalTerminationPointInstance["layer-protocol"][0]["operation-server-interface-1-0:operation-server-interface-pac"]
                        ["operation-server-interface-capability"]["operation-name"];
                resolve(operationName);
            } catch (error) {
                resolve(undefined);
            }
        });
    }

    /**
     * @description This function returns the life-cycle-state for the given operation server uuid.<br>
     * @param {String} operationServerUuid uuid of the operation server instance<br>
     * @returns {promise} returns life-cycle-state of the operation server instance<br>
     * <b><u>Procedure :</u></b><br>
     * <b>step 1 :</b> Get the logical-termination-point instance for the provided uuid <br>
     * <b>step 2 :</b> Get the life-cycle-state from the operation server capability<br>
     **/
     static getLifeCycleState(operationServerUuid) {
        return new Promise(async function (resolve, reject) {
            let lifeCycleState;
            try {
                let operationServerLogicalTerminationPointInstance = await coreModel.getLogicalTerminationPointForTheUuid(operationServerUuid);
                lifeCycleState = operationServerLogicalTerminationPointInstance["layer-protocol"][0]["operation-server-interface-1-0:operation-server-interface-pac"]
                        ["operation-server-interface-configuration"]["life-cycle-state"];
                resolve(lifeCycleState);
            } catch (error) {
                resolve(undefined);
            }
        });
    }

    /**
     * @description This function returns the operation server uuid for the given operation name<br>
     * @param {String} operationName operation name of the operation server<br>
     * @returns {promise} returns operation server uuid.<br>
     * <b><u>Procedure :</u></b><br>
     * <b>step 1 :</b> Get the logical-termination-point instance list for the layer protocol operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER<br>
     * <b>step 2 :</b> Iterate through the list and filter the uuids for the required operation name<br>
     **/
    static getOperationServerUuidForTheOperationName(operationName) {
        return new Promise(async function (resolve, reject) {
            let operationServerUuid = undefined;
            try {
                let operationLogicalTerminationPointInstanceList = await coreModel.getLogicalTerminationPointListByProtocol(layerProtocol.layerProtocolNameEnum.OPERATION_SERVER);
                if (operationLogicalTerminationPointInstanceList != undefined) {
                    for (let i = 0; i < operationLogicalTerminationPointInstanceList.length; i++) {
                        let operationLogicalTerminationPointInstance = operationLogicalTerminationPointInstanceList[i];
                        let operationServerOperationName = operationLogicalTerminationPointInstance["layer-protocol"][0]["operation-server-interface-1-0:operation-server-interface-pac"]
                        ["operation-server-interface-capability"]["operation-name"];
                        if (operationServerOperationName != undefined && operationServerOperationName == operationName) {
                            operationServerUuid = operationLogicalTerminationPointInstance["uuid"];
                        }
                    }
                }
                resolve(operationServerUuid);
            } catch (error) {
                resolve(undefined);
            }
        });
    }
}
module.exports = OperationServerInterface;