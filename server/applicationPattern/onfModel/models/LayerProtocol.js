/**
 * @file The projection of an LTP into each technology specific layer is represented by a LayerProtocol (LP) instance.<br>
 * This class provides a stub to instantiate and generate a JSONObject for a LayerProtocol.
 * @author      prathiba.jeevan.external@telefonica.com
 * @since       07.08.2021
 * @version     1.0
 * @copyright   Telefónica Germany GmbH & Co. OHG* 
 **/

'use strict';

class LayerProtocol {

    localId;
    layerProtocolName;

    static layerProtocolNameEnum = {
        OPERATION_CLIENT: "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        HTTP_CLIENT: "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        TCP_CLIENT: "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        OPERATION_SERVER: "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        HTTP_SERVER: "http-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        TCP_SERVER: "tcp-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER"
    }

    /**
     * @constructor 
     * @param {String} localId local identifier for the layerProtocol.
     * @param {String} layerProtocolName name of the layer protocol(it can be tcp-server,tcp-client,http-server,http-client,operation-server,operation-client).
     **/
    constructor(localId, layerProtocolName) {
        this.localId = localId;
        this.layerProtocolName = layerProtocolName;
    }
}

module.exports = LayerProtocol;