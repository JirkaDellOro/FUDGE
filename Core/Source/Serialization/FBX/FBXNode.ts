namespace FudgeCore.FBX {

  export class Node {
    public name: string;

    #children: Node[];
    #properties: NodeProperty[];
    private loadProperties: () => NodeProperty[];
    private loadChildren: () => Node[];

    public constructor(_name: string, _loadProperties: () => NodeProperty[], _loadChildren: () => Node[]) {
      this.name = _name;
      this.loadProperties = _loadProperties;
      this.loadChildren = _loadChildren;
    }

    public get properties(): NodeProperty[] {
      return this.#properties || (this.#properties = this.loadProperties());
    }

    public get children(): Node[] {
      return this.#children || (this.#children = this.loadChildren());
    }
  }

  export type Property70 = boolean | number | string | Vector3;

  export type NodeProperty = boolean | number | string | Uint8Array | Uint16Array | Float32Array;

  export enum ArrayEncoding {
    UNCOMPRESSED, COMPRESSED
  }
  
}