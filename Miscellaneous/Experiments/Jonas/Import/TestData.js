"use strict";
var Import;
(function (Import) {
    Import.data = {
        "storage": {
            "inNormTime": {
                "function": "modulo",
                "parameters": [
                    "time",
                    1
                ]
            },
            "inNormTime-1": {
                "function": "multiplication",
                "parameters": [
                    {
                        "function": "addition",
                        "parameters": [
                            "inNormTime",
                            -1
                        ]
                    },
                    0.1
                ]
            }
        },
        "translation": {
            "y": {
                "function": "multiplication",
                "parameters": [
                    {
                        "function": "random",
                        "parameters": [
                            "index"
                        ]
                    },
                    {
                        "function": "linear",
                        "parameters": [
                            "inNormTime",
                            0,
                            1,
                            0,
                            1
                        ]
                    }
                ]
            }
        },
        "rotation": {
            "z": {
                "function": "multiplication",
                "parameters": [
                    {
                        "function": "random",
                        "parameters": [
                            {
                                "function": "addition",
                                "parameters": [
                                    "index",
                                    1
                                ]
                            }
                        ]
                    },
                    360
                ]
            }
        },
        "translationWorld": {
            "y": {
                "function": "polynomial",
                "parameters": [
                    "inNormTime",
                    0,
                    -2.5,
                    0,
                    0
                ]
            }
        },
        "scaling": {
            "x": {
                "function": "identity",
                "parameters": [
                    "inNormTime-1"
                ]
            },
            "y": {
                "function": "identity",
                "parameters": [
                    "inNormTime-1"
                ]
            },
            "z": {
                "function": "identity",
                "parameters": [
                    "inNormTime-1"
                ]
            }
        }
    };
    // export let data: ParticleEffectData = {
    //   "storage": {
    //     "inNormParticleTime": {
    //       "function": "modulo",
    //       "parameters": [
    //         {
    //           "function": "addition",
    //           "parameters": [
    //             {
    //               "function": "multiplication",
    //               "parameters": [
    //                 "index",
    //                 {
    //                   "function": "division",
    //                   "parameters": [
    //                     1,
    //                     "size"
    //                   ],
    //                   "preEvaluate": true
    //                 }
    //               ]
    //             },
    //             {
    //               "function": "modulo",
    //               "parameters": [
    //                 "time",
    //                 1
    //               ]
    //             }
    //           ]
    //         },
    //         1
    //       ]
    //     }
    //   },
    //   "translation": {
    //     "x": {
    //       "function": "multiplication",
    //       "parameters": [
    //         {
    //           "function": "polynomial",
    //           "parameters": [
    //             "inNormParticleTime",
    //             -2,
    //             -1,
    //             0.5,
    //             0.5
    //           ]
    //         },
    //         {
    //           "function": "random",
    //           "parameters": [
    //             "index"
    //           ]
    //         }
    //       ]
    //     },
    //     "y": {
    //       "function": "linear",
    //       "parameters": [
    //         "inNormParticleTime",
    //         0,
    //         1,
    //         0,
    //         1
    //       ]
    //     }
    //   }
    // };
    // export let data: ParticleEffectData = {
    //   "storage": {
    //     "inNormTime": {
    //       "function": "modulo",
    //       "parameters": [
    //         "time",
    //         1
    //       ]
    //     }
    //   },
    //   "translation": {
    //     "x": {
    //       "function": "multiplication",
    //       "parameters": [
    //         "inNormTime",
    //         1
    //       ]
    //     },
    //     "y": {
    //       "function": "multiplication",
    //       "parameters": [
    //         {
    //           "function": "division",
    //           "parameters": [
    //             1,
    //             "size"
    //           ],
    //           "preEvaluate": true
    //         },
    //         2
    //       ]
    //     }
    //   },
    //   "rotation": {
    //     "x": {
    //       "function": "addition",
    //       "parameters": [
    //         "time",
    //         3
    //       ]
    //     }
    //   },
    //   "translationWorld": {
    //     "y": {
    //       "function": "linear",
    //       "parameters": [
    //         "time",
    //         0,
    //         1,
    //         0,
    //         -1
    //       ]
    //     }
    //   }
    // };
    // export let data: ParticleData = {
    //   "translation": {
    //     "x": {
    //       "function": "multiplication",
    //       "parameters": [
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
    //     "y": {
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
//# sourceMappingURL=TestData.js.map