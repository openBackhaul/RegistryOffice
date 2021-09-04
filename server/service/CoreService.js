'use strict';


/**
 * Returns entire data tree
 *
 * returns inline_response_200_8
 **/
exports.getControlConstruct = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "core-model-1-4:control-construct" : {
    "profile-collection" : {
      "profile" : [ ]
    },
    "logical-termination-point" : [ {
      "uuid" : "ro-0-0-1-op-s-0002",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-service-requests"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-0003",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-oam-requests"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-0004",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/end-subscription"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-0005",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/inquire-oam-request-approvals"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-2000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/start-application-in-generic-representation"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "n.a."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-2001",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/inform-about-application"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "n.a."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-2002",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/inform-about-application-in-generic-representation"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "n.a."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-2003",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/inform-about-release-history"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "n.a."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-2004",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/inform-about-release-history-in-generic-representation"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "n.a."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/register-application"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3001",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/deregister-application"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3002",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/update-approval-status"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3003",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/list-applications"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3004",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/list-applications-in-generic-representation"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3005",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-registrations"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3006",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-deregistrations"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3007",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-approvals"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-s-3008",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-server-interface-1-0:operation-server-interface-pac" : {
          "operation-server-interface-capability" : {
            "operation-name" : "/v1/notify-withdrawn-approvals"
          },
          "operation-server-interface-configuration" : {
            "life-cycle-state" : "operation-server-interface-1-0:LIFE_CYCLE_STATE_TYPE_EXPERIMENTAL",
            "operation-key" : "Operation key not yet provided."
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-s-0000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ "ro-0-0-1-op-s-0002", "ro-0-0-1-op-s-0003" ],
      "server-ltp" : [ "ro-0-0-1-tcp-s-0000" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-server-interface-1-0:http-server-interface-pac" : {
          "http-server-interface-capability" : {
            "application-name" : "RegistryOffice",
            "release-number" : "0.0.1",
            "application-purpose" : "All applications being part of the MBH SDN must be register here.",
            "data-update-period" : "http-server-interface-1-0:DATA_UPDATE_PERIOD_TYPE_REAL_TIME",
            "owner-name" : "Thorsten Heinze",
            "owner-email-address" : "Thorsten.Heinze@telefonica.com",
            "release-list" : [ {
              "release-number" : "0.0.1",
              "release-date" : "16.07.2021",
              "changes" : "Initial version."
            } ]
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-s-0000",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SOURCE",
      "client-ltp" : [ "ro-0-0-1-http-s-0000" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-server-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-server-interface-1-0:tcp-server-interface-pac" : {
          "tcp-server-interface-configuration" : {
            "local-address" : {
              "ipv-4-address" : "10.118.125.157"
            },
            "local-port" : 1000
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3010",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3010" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3011",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3010" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/regard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3012",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3010" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/disregard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-3010",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-3010", "ro-0-0-1-op-c-3011" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-3010" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "TypeApprovalRegister"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_APPROVED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-3010",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-3010" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.157",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 1001
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-0020",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0020" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/record-service-request",
            "operation-key" : "Operation key not yet provided.",
            "detailed-logging-is-on" : "false"
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3020",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0020" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3021",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0020" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/regard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3022",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0020" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/disregard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-0020",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-0020", "ro-0-0-1-op-c-3020" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-0020" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "ExecutionAndTraceLog"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_APPROVED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-0020",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-0020" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.157",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 1002
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-0030",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0030" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/record-oam-request",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3030",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0030" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3031",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0030" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/regard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3032",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0030" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/disregard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-0030",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-0030", "ro-0-0-1-op-c-3030" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-0030" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "OamLog"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_APPROVED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-0030",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-0030" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.157",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 1003
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-0040",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0040" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/approve-oam-request",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3040",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0040" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3041",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0040" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/regard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3042",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-0040" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/disregard-application",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-0040",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-0040", "ro-0-0-1-op-c-3040" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-0040" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "AdministratorAdministration"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_APPROVED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-0040",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-0040" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.157",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 1004
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3300",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3300" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-3300",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-3300" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-3300" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "CurrentController"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.6"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_APPROVED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-3300",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-3300" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.186",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 2000
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3310",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3310" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-3310",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-3310" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-3310" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "Resolver"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_REGISTERED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-3310",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-3310" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.186",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 2001
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-3320",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-3320" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-3320",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-3320" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-3320" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "Connector2LtpUuid"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_REGISTERED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-3320",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-3320" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.186",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 2002
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-op-c-9990",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ ],
      "server-ltp" : [ "ro-0-0-1-http-c-9990" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "operation-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_OPERATION_LAYER",
        "operation-client-interface-1-0:operation-client-interface-pac" : {
          "operation-client-interface-configuration" : {
            "operation-name" : "/v1/embed-yourself",
            "operation-key" : "Operation key not yet provided."
          },
          "operation-client-interface-status" : {
            "operational-state" : "operation-client-interface-1-0:OPERATIONAL_STATE_TYPE_NOT_YET_DEFINED",
            "life-cycle-state" : "operation-client-interface-1-0:LIFE_CYCLE_STATE_TYPE_NOT_YET_DEFINED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-http-c-9990",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-op-c-9990" ],
      "server-ltp" : [ "ro-0-0-1-tcp-c-9990" ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "http-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_HTTP_LAYER",
        "http-client-interface-1-0:http-client-interface-pac" : {
          "http-client-interface-capability" : {
            "application-name" : "BadApplication"
          },
          "http-client-interface-configuration" : {
            "release-number" : "0.0.1"
          },
          "http-client-interface-status" : {
            "approval-status" : "http-client-interface-1-0:APPROVAL_STATUS_TYPE_BARRED"
          }
        }
      } ]
    }, {
      "uuid" : "ro-0-0-1-tcp-c-9990",
      "ltp-direction" : "core-model-1-4:TERMINATION_DIRECTION_SINK",
      "client-ltp" : [ "ro-0-0-1-http-c-9990" ],
      "server-ltp" : [ ],
      "layer-protocol" : [ {
        "local-id" : "0",
        "layer-protocol-name" : "tcp-client-interface-1-0:LAYER_PROTOCOL_NAME_TYPE_TCP_LAYER",
        "tcp-client-interface-1-0:tcp-client-interface-pac" : {
          "tcp-client-interface-configuration" : {
            "remote-address" : {
              "ip-address" : {
                "ipv-4-address" : "10.118.125.186",
                "ipv-6-address" : "0:0:0:0:0:0:0:0"
              },
              "domain-name" : "Not yet defined."
            },
            "remote-port" : 9999
          }
        }
      } ]
    } ]
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

