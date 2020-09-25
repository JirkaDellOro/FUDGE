namespace TableControl {
  export interface DATA {
    name: string;
    type: string;
    id: number;
  }

  export let data: DATA[] = [
    { name: "A", type: "Mesh", id: 0 },
    { name: "B", type: "Mesh", id: 1 },
    { name: "B", type: "Material", id: 2 }
  ];

  export let assoc: {[index: string]: DATA} = {
    data1: { name: "A", type: "Mesh", id: 0 },
    data2: { name: "B", type: "Mesh", id: 1 },
    data3: { name: "B", type: "Material", id: 2 }
  }
}
