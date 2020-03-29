namespace TreeControl {
  export interface TreeEntry {
    display: string;
    children?: TreeEntry[];
    cssClasses?: string[];
    data?: Object;
  }

  export let data: TreeEntry[] = [
    {
      display: "root", children: [
        {
          display: "L0", children: [
            { display: "L0.0" },
            { display: "L0.1" },
            {
              display: "L0.2", children: [
                { display: "L0.2.0" },
                { display: "L0.2.1" },
                { display: "L0.2.2" }
              ]
            }]
        },
        {
          display: "L1", children: [
            { display: "L1.0" },
            {
              display: "L1.1", children: [
                { display: "L1.1.0" },
                { display: "L1.1.1" },
                { display: "L1.1.2" }
              ]
            },
            { display: "L1.2" }
          ]
        },
        {
          display: "L2", children: [
            {
              display: "L2.0", children: [
                { display: "L2.0.0" },
                { display: "L2.0.1" },
                { display: "L2.0.2" }
              ]
            },
            { display: "L2.1" },
            { display: "L2.2" }
          ]
        }
      ]
    }
  ];
}
