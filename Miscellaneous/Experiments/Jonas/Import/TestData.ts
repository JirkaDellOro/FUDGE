namespace Import {
  export interface ParticleEffectData {
    storage?: ParticleData;
    translation?: ParticleData;
    rotation?: ParticleData;
    translationWorld?: ParticleData;
  }

  export interface ParticleData {
    [key: string]: ClosureData;
  }

  export interface ClosureData {
    function: string;
    parameters: (ClosureData | string | number)[];
    preEvaluate?: boolean;
  }

  export let data: ParticleEffectData = {
    "storage": {
      "inNormTime": {
        "function": "modulo",
        "parameters": [
          "time",
          1
        ]
      }
    },
    "translation": {
      "x": {
        "function": "multiplication",
        "parameters": [
          "inNormTime",
          1
        ]
      },
      "y": {
        "function": "multiplication",
        "parameters": [
          {
            "function": "division",
            "parameters": [
              1,
              "size"
            ],
            "preEvaluate": true
          },
          2
        ]
      }
    },
    "translationWorld": {
      "y": {
        "function": "linear",
        "parameters": [
          "time",
          0,
          1,
          0,
          -1
        ]
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
}