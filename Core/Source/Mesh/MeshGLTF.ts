namespace FudgeCore {
  /**
   * Mesh loaded from a GLTF-file
   * @author Matthias Roming, HFU, 2022
   */
  export class MeshGLTF extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshGLTF);

    private uriGLTF: string;

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.uriGLTF = this.uriGLTF;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      const loader: GLTFLoader = await GLTFLoader.LOAD(_serialization.uriGLTF);
      await this.load(loader, loader.gltf.meshes.findIndex(gltfMesh => gltfMesh.name == this.name));
      return this;
    }

    public async load(_loader: GLTFLoader, _iMesh: number): Promise<MeshGLTF> {
      const gltfMesh: GLTF.Mesh = _loader.gltf.meshes[_iMesh];
      this.name = gltfMesh.name;

      this.renderMesh = new RenderMesh(this);
      Reflect.set(this.renderMesh, "ƒindices", await _loader.getUint16Array(gltfMesh.primitives[0].indices));
      Reflect.set(this.renderMesh, "ƒvertices", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.POSITION));
      Reflect.set(this.renderMesh, "ƒnormals", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.NORMAL)); 
      //Texture Array var here
      Reflect.set(this.renderMesh, "ƒtextureUVs", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.TEXCOORD_0));
      
      //Mit Verts anfangen (Je iteration ein Vertice (3er Schritte))
      let testVerts: Float32Array = this.renderMesh.vertices;
      let testUV: Float32Array = this.renderMesh.textureUVs;
      let testNormals: Float32Array = this.renderMesh.normalsVertex;
      let testIndices: Uint16Array = this.renderMesh.indices;
      let vertexTestArray: Vertex[] = [];
     
      //i = Verts/normals , j = texture coordinates, u = current queue for debug
      //Insert Verts, UV and Indices here
      //Evtl change vertex to vertices array
      for (let i: number = 0, j: number = 0, u: number = 0; i <= testVerts.length; i += 3, j += 2, u++) {
        let newVertex: Vertex = new Vertex(new Vector3(testVerts[i + 0], testVerts[i + 1], testVerts[i + 2]), new Vector2(testUV[j + 0], testUV[j + 1]), new Vector3(testNormals[i + 0], testNormals[i + 1], testNormals[i + 2] ));
        vertexTestArray.push(newVertex);
       // console.log("I am a vertex at position" + " " + u + " " + vertexTestArray[u].position + vertexTestArray[u].uv + vertexTestArray[u].normal);
      }
      //Add vertices Array
      this.vertices = new Vertices();
      for (let i: number = 0, j: number = 0, u: number = 0; i <= testVerts.length; i += 3, j += 2, u++) {
        let newVertex: Vertex = new Vertex(new Vector3(testVerts[i + 0], testVerts[i + 1], testVerts[i + 2]), new Vector2(testUV[j + 0], testUV[j + 1]), new Vector3(testNormals[i + 0], testNormals[i + 1], testNormals[i + 2] ));
        this.vertices.push(newVertex);
      }
      //WIP
      // Blender exporter ansehen bezüglich Flat rendering in gtlf --Ist Smooth
      //add indices here
      //check I and J
      this.faces = [];
      for (let i: number = 0,  j: number = 0; i <= testVerts.length; i += 3, j += 3) {
        let newFace: Face = new Face(this.vertices, testIndices[j + 0], testIndices[j + 1], testIndices[j + 2]);
        this.faces.push(newFace);
        console.log("This face is  " + newFace + "and the incides are " + newFace.indices + " and j is " + j);
      }
      console.log("Import completed");
      console.log(this.faces);
      
      // use getMesh vom GLTF Loader (Instanziert (LOAD-Methode))

      // let renderBuffers: RenderBuffers =  this.getRenderBuffers(ShaderFlat); // hotfix to create renderMesh

      this.uriGLTF = _loader.uri;
      return this;
    }

    // TODO: lazy-getter to retrieve the face normals. Initialize faces on call.
    
  }
}