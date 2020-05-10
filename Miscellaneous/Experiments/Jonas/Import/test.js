"use strict";
var Import;
(function (Import) {
    Import.data = {
        "particle": {
            "store": {
                "inNormTime": {
                    "operation": "modulo",
                    "arguments": [
                        "time",
                        1
                    ]
                }
            },
            "translation": {
                "x": {
                    "operation": "multiplication",
                    "arguments": [
                        "inNormTime",
                        1
                    ]
                },
                "y": {
                    "operation": "multiplication",
                    "arguments": [
                        "inNormTime",
                        2
                    ]
                }
            }
        }
    };
    // export let data: ParticleData = {
    //   "translation": {
    //     "x-coordinate": {
    //       "operation": "multiplication",
    //       "arguments": [
    //         {
    //           "operation": "polynomial3",
    //           "arguments": [
    //             {
    //               "operation": "modulo",
    //               "arguments": [
    //                 {
    //                   "operation": "addition",
    //                   "arguments": [
    //                     {
    //                       "operation": "multiplication",
    //                       "arguments": [
    //                         "index",
    //                         {
    //                           "operation": "division",
    //                           "arguments": [
    //                             1,
    //                             "size"
    //                           ]
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "operation": "modulo",
    //                       "arguments": [
    //                         "time",
    //                         1
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 1
    //               ]
    //             },
    //             1,
    //             1,
    //             1,
    //             0
    //           ]
    //         },
    //         {
    //           "operation": "random",
    //           "arguments": [
    //             "index"
    //           ]
    //         }
    //       ]
    //     },
    //     "y-coordinate": {
    //       "operation": "modulo",
    //       "arguments": [
    //         {
    //           "operation": "addition",
    //           "arguments": [
    //             {
    //               "operation": "multiplication",
    //               "arguments": [
    //                 "index",
    //                 {
    //                   "operation": "division",
    //                   "arguments": [
    //                     1,
    //                     "size"
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "operation": "modulo",
    //               "arguments": [
    //                 "time",
    //                 1
    //               ]
    //             }
    //           ]
    //         },
    //         1
    //       ]
    //     }
    //   }
    // };
})(Import || (Import = {}));
//# sourceMappingURL=test.js.map