namespace Import {
  export interface SystemData {
    particle: Particle;
  }

  export interface Particle {
    store: ParticleData;
    translation: ParticleData;
  }

  export interface ParticleData {
    [key: string]: ParticleClosure;
  }

  export interface ParticleClosure {
    operation: string;
    arguments: (ParticleClosure | string | number)[];
  }

  export let data: SystemData = {
    "particle": {
      "store": {
        "inNormTime": {
          "operation": "modulo",
          "arguments": [
            "time",
            1
          ]
        },
        "zz": {
          "operation": "random",
          "arguments": [
            "index"
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
  }

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