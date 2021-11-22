namespace FudgeCore {

  /**Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
   * static LOAD Method. Currently only works with triangulated Meshes
   * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
   * @todo UVs, Load Materials, Support Quads
   * @authors Simon Storl-Schulke 2021 | Luis Keck, HFU, 2021 */
  export class MeshObj extends Mesh {

    protected verts: number[] = [];
    protected uvs: number[] = [];
    protected inds: number[] = [];
    protected facenormals: number[] = [];
    protected facecrossproducts: number[] = [];

    public constructor(objString: string) {
      super();
      this.parseObj(objString);
      this.splitVertices();
    }

    /** Loads an obj file from the given source url and a returns a complete Node from it. 
    * Multiple Objects are treated as a single Mesh. If no material is given, uses a default flat white material. */
    public static LOAD(
      src: string,
      name: string = "ObjNode",
      material: Material = new Material("MaterialRed", ShaderFlat, new CoatColored(new Color(0.8, 0.8, 0.8, 1)))
    ): Node {
      let xmlhttp: XMLHttpRequest = new XMLHttpRequest();
      let fileContent: string = "";
      let nodeObj: Node = new Node(name);
      nodeObj.addComponent(new ComponentTransform());

      xmlhttp.onreadystatechange = async function (): Promise<void> {

        if (this.readyState == 4 && this.status == 200) {
          fileContent = this.responseText;
          let meshObj: Mesh = new MeshObj(fileContent);
          nodeObj.addComponent(new ComponentMesh(meshObj));
          nodeObj.addComponent(new ComponentMaterial(material));
          //TODO: New Node for each Object and return Parent Node
        }
      };

      xmlhttp.open("GET", src, true);
      xmlhttp.send();

      return nodeObj;
    }

    public static LOAD_MESH(src: string): Mesh {

      let xmlhttp: XMLHttpRequest = new XMLHttpRequest();
      let fileContent: string = "";
      let mesh: Mesh;

      xmlhttp.onreadystatechange = async function (): Promise<void> {

        if (this.readyState == 4 && this.status == 200) {
          fileContent = this.responseText;
          mesh = new MeshObj(fileContent);
        }
      };

      xmlhttp.open("GET", src, true);
      xmlhttp.send();

      return mesh;
    }

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

    /** Splits up the obj string into separate arrays for each datatype */
    protected parseObj(data: string): void {
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
      return new Float32Array(this.faceCrossProducts);
    }
    protected createFaceNormals(): Float32Array {
      return new Float32Array(this.facenormals);
    }

    /*Luis Keck: Calculates vertex normals for smooth shading.
    New function needed because faces do not share vertices currently */
    protected createVertexNormals(): Float32Array {
      let vertexNormals: number[] = [];

      //goes through all vertices
      for (let i: number = 0; i < this.vertices.length; i += 3) {
        let vertex: Vector3 = new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);
        let samePosVerts: number[] = [];

        //finds vertices that share position with the vertex of current iteration
        for (let j: number = 0; j < this.vertices.length; j += 3) {
          if (this.vertices[j] == vertex.x && this.vertices[j + 1] == vertex.y && this.vertices[j + 2] == vertex.z)
            samePosVerts.push(j);
        }

        let sum: Vector3 = Vector3.ZERO();
        //adds the face normals of all faces that would share these vertices
        for (let z: number = 0; z < samePosVerts.length; z++)
          sum = Vector3.SUM(sum, new Vector3(
            this.faceCrossProducts[samePosVerts[z] + 0],
            this.faceCrossProducts[samePosVerts[z] + 1],
            this.faceCrossProducts[samePosVerts[z] + 2]
          ));

        if (sum.magnitude != 0)
          sum = Vector3.NORMALIZATION(sum);

        vertexNormals.push(sum.x, sum.y, sum.z);
      }
      return new Float32Array(vertexNormals);
    }
  }
}