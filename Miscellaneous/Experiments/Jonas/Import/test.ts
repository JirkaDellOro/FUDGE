namespace Import {
  export interface ParticleData {
    // tslint:disable
    [key: string]: any;
  }

  // export let data: ParticleData = {
  //   "x-coordinate": {
  //     "operation": "addition",
  //     "arguments": [
  //       {
  //         "operation": "linear",
  //         "arguments": [
  //           "time",
  //           0,
  //           2,
  //           2,
  //           4
  //         ]
  //       },
  //       {
  //         "operation": "random",
  //         "arguments": [
  //           "index"
  //         ]
  //       }
  //     ]
  //   }
  // }

  export let data: ParticleData = {
    "x-coordinate": {
      "operation": "multiplication",
      "arguments": [
        {
          "operation": "polynomial3",
          "arguments": [
            {
              "operation": "modulo",
              "arguments": [
                {
                  "operation": "addition",
                  "arguments": [
                    {
                      "operation": "multiplication",
                      "arguments": [
                        "index",
                        {
                          "operation": "division",
                          "arguments": [
                            1,
                            "size"
                          ]
                        }
                      ]
                    },
                    {
                      "operation": "modulo",
                      "arguments": [
                        "time",
                        1
                      ]
                    }
                  ]
                },
                1
              ]
            },
            1,
            1,
            1,
            0
          ]
        },
        {
          "operation": "random",
          "arguments": [
            "index"
          ]
        }
      ]
    },
    "y-coordinate": {
      // "operation": "addition",
      // "arguments": [
      //   {
      "operation": "modulo",
      "arguments": [
        {
          "operation": "addition",
          "arguments": [
            {
              "operation": "multiplication",
              "arguments": [
                "index",
                {
                  "operation": "division",
                  "arguments": [
                    1,
                    "size"
                  ]
                }
              ]
            },
            {
              "operation": "modulo",
              "arguments": [
                "time",
                1
              ]
            }
          ]
        },
        1
      ]
    },
    // // {
    // //   "operation": "parabola",
    // //   "arguments": [
    // //     9.81,
    // //     "time"
    // //   ],
    // //   "global": true
    // // }
    // // ]
    // // }
  };
}