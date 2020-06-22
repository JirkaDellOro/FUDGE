namespace Import {
  export interface ParticleEffectData {
    // storage?: ParticleStorageData;
    system?: ParticleStorageData;
    update?: ParticleStorageData;
    particle?: ParticleStorageData;
    translation?: ParticleVectorData;
    rotation?: ParticleVectorData;
    translationWorld?: ParticleVectorData;
    scaling?: ParticleVectorData;
    color?: ParticleColorData;
  }

  // export interface ParticleStorageData {
  //   system?: ParticleData;
  //   update?: ParticleData;
  //   particle?: ParticleData;
  // }

  export interface ParticleStorageData {
    [key: string]: ClosureData;
  }

  export interface ParticleVectorData {
    x?: ClosureData;
    y?: ClosureData;
    z?: ClosureData;
  }

  export interface ParticleColorData {
    r?: ClosureData;
    g?: ClosureData;
    b?: ClosureData;
    a?: ClosureData;
  }

  export interface ClosureDataFunction {
    function: string;
    parameters: ClosureData[];
    // preEvaluate?: boolean;
  }

  export type ClosureData = ClosureDataFunction | string | number;


  // export let data: ParticleEffectData = {
  //   "translation": {
  //     "x": 1,
  //     "y": "index",
  //     "z": {
  //       "function": "modulo",
  //       "parameters": [
  //         "time",
  //         1
  //       ]
  //     }
  //   }
  // };

  export let data: ParticleEffectData = {
    "update": {
      "inNormTime": {
        "function": "modulo",
        "parameters": [
          "time",
          1
        ]
      },
      "inNormTime-1":
      {
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
      "z":
      {
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
      "x": 0.1,
      "y": 0.1,
      "z": 0.1
    },
    "color": {
      "r": 1,
      "g": 0.2,
      "b": 0.1
      // "a": {
      //   "function": "addition",
      //   "parameters": [
      //     1,
      //     {
      //       "function": "multiplication",
      //       "parameters": [-1, "inNormTime"]
      //     }]
      // }
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
}