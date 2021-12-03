namespace FudgeCore {

  /**Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
   * static LOAD Method. Currently only works with triangulated Meshes
   * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
   * @todo UVs, Load Materials, Support Quads
   * @authors Simon Storl-Schulke 2021 | Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021 */
  export class MeshObj extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshObj);
    public url: RequestInfo;

    protected verts: number[] = [];
    protected uvs: number[] = [];
    protected inds: number[] = [];
    protected facenormals: number[] = [];
    protected facecrossproducts: number[] = [];

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
      const lines: string[] = data.split("\n");

      for (let line of lines) {
        line = line.trim();

        if (!line || line.startsWith("#"))
          continue;

        const parts: string[] = line.split(" ");
        parts.shift();

        //Vertex - example: v 0.70 -0.45 -0.52
        if (!line || line.startsWith("v ")) this.verts.push(...parts.map(x => +x));

        //Texcoord - example: vt 0.545454 0.472382
        else if (!line || line.startsWith("vt ")) this.uvs.push(...parts.map(x => +x));

        /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
        vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
        else if (!line || line.startsWith("f ")) {
          this.inds.push(
            +parts[0].split("/")[0] - 1,
            +parts[1].split("/")[0] - 1,
            +parts[2].split("/")[0] - 1
          );
        }
      }

      this.splitVertices();
      this.clear();
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
      this.load(_mutator.url);
    }
    //#endregion
    /** Creates three Vertices from each face. Although inefficient, this has to be done for now - see Issue 244 */
    protected splitVertices(): void {
      let vertsNew: number[] = [];
      //let uvsNew: number[] = [];
      let indicesNew: number[] = [];
      let faceNormalsNew: number[] = [];
      let faceCrossProductsNew: number[] = [];

      // For each face
      for (let i: number = 0; i < this.inds.length; i += 3) {

        // Get its 3 vertices
        let v1: Vector3 = new Vector3(
          this.verts[this.inds[i + 0] * 3 + 0],
          this.verts[this.inds[i + 0] * 3 + 1],
          this.verts[this.inds[i + 0] * 3 + 2]
        );

        let v2: Vector3 = new Vector3(
          this.verts[this.inds[i + 1] * 3 + 0],
          this.verts[this.inds[i + 1] * 3 + 1],
          this.verts[this.inds[i + 1] * 3 + 2]
        );

        let v3: Vector3 = new Vector3(
          this.verts[this.inds[i + 2] * 3 + 0],
          this.verts[this.inds[i + 2] * 3 + 1],
          this.verts[this.inds[i + 2] * 3 + 2]
        );

        // Calculate Normal by three face vertices
        let normal: Vector3 = Vector3.CROSS(Vector3.DIFFERENCE(v2, v1), Vector3.DIFFERENCE(v3, v1));

        faceCrossProductsNew.push(
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z);

        normal.normalize();

        // Use same Normal for all three face verices
        faceNormalsNew.push(
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z,
          normal.x, normal.y, normal.z);

        vertsNew.push(
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
          v3.x, v3.y, v3.z);

        indicesNew.push(i, i + 1, i + 2);
      }

      this.verts = vertsNew;
      // this.uvs = uvsNew;
      this.inds = indicesNew;
      this.facenormals = faceNormalsNew;
      this.facecrossproducts = faceCrossProductsNew;
    }

    protected createVertices(): Float32Array {
      return new Float32Array(this.verts);
    }

    protected createTextureUVs(): Float32Array {
      //TODO: not working yet
      return new Float32Array(this.uvs);
    }

    protected createIndices(): Uint16Array {
      return new Uint16Array(this.inds);
    }

    protected calculateFaceCrossProducts(): Float32Array {
      return new Float32Array(this.facecrossproducts);
    }

    protected createFaceNormals(): Float32Array {
      return new Float32Array(this.facenormals);
    }
  }
}