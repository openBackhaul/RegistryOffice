module.exports.individualServicesOperationsMapping =
{
    "/v1/register-application": {
        "embedding-operation": {
          "api-segment": "im",
          "sequence": "000"
        },
        "client-update-operation": {
          "api-segment": "im",
          "sequence": "001"
        },
        "operation-client-update-operation": {
          "api-segment": "im",
          "sequence": "002"
        }
      },
      "/v1/inquire-application-type-approvals": {
        "approval-operation": {
          "api-segment": "im",
          "sequence": "003"
        }
      },
      "/v1/notify-deregistrations": {
        "subscriber-operation": {
          "api-segment": "im",
          "sequence": "004"
        }
      },
      "/v1/notify-approvals": {
        "subscriber-operation": {
          "api-segment": "im",
          "sequence": "003"
        }
      }
}