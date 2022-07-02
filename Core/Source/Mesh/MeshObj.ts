namespace FudgeCore {

  /**Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
   * static LOAD Method. Currently only works with triangulated Meshes
   * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
   * @todo UVs, Load Materials, Support Quads
   * @authors Simon Storl-Schulke 2021 | Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021-2022 */

  interface FaceInfo {
    iPosition: number;
    iUV: number;
    iNormal: number;
  }

  export class MeshObj extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshObj);
    public url: RequestInfo;

    // protected verts: number[] = [];
    // protected uvs: number[] = [];
    // protected inds: number[] = [];
    // protected facenormals: number[] = [];
    // protected facecrossproducts: number[] = [];

    public constructor(_name?: string, _url?: RequestInfo) {
      super(_name); {
        if (_url) {
          this.load(_url);
          if (!_name)
            _name = _url.toString().split("/").pop();
        }
        if (!_name)
          _name = "MeshObj";

        this.name = _name;
      }
    }

    /**
         * Asynchronously loads the image from the given url
         */
    public async load(_url: RequestInfo): Promise<void> {
      this.url = _url;
      let url: string = new URL(this.url.toString(), Project.baseURL).toString();
      let data: string = await (await fetch(url)).text();
      this.parseObj(data);
    }

    /** Splits up the obj string into separate arrays for each datatype */
    public parseObj(data: string): void {
      this.clear();
      const lines: string[] = data.split("\n");

      let positions: Vector3[] = [];
      let uvs: Vector2[] = [];
      let faceInfo: FaceInfo[] = [];

      for (let line of lines) {
        line = line.trim();

        if (!line || line.startsWith("#"))
          continue;

        const parts: string[] = line.split(" ");
        parts.shift();

        //Vertex - example: v 0.70 -0.45 -0.52
        if (line.startsWith("v "))
          positions.push(new Vector3(...parts.map(_value => +_value)));

        //Texcoord - example: vt 0.545454 0.472382
        else if (line.startsWith("vt "))
          uvs.push(new Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));

        /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
        vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
        else if (line.startsWith("f "))
          for (let i: number = 0; i < 3; i++) {
            faceInfo.push({
              iPosition: +parts[i].split("/")[0] - 1,
              iUV: +parts[i].split("/")[1] - 1,
              iNormal: +parts[i].split("/")[2] - 1
            });
          }
      }

      this.vertices = new Vertices(...positions.map((_p: Vector3) => new Vertex(_p)));
      for (let i: number = 0; i < faceInfo.length; i += 3) {
        let indices: number[] = [];
        for (let v: number = 0; v < 3; v++) {
          let info: FaceInfo = faceInfo[i + v];
          let index: number = info.iPosition;
          if (this.vertices[index].uv) {
            index = this.vertices.length;
            this.vertices.push(new Vertex(info.iPosition));
          }
          this.vertices[index].uv = uvs[info.iUV];
          indices.push(index);
        }
        this.faces.push(new Face(this.vertices, indices[0], indices[1], indices[2]));
      }
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.url = this.url;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.load(_serialization.url);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      if (typeof (_mutator.url) !== "undefined")
        this.load(_mutator.url);
    }
    //#endregion
  }
}