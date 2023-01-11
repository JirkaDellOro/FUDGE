namespace FudgeCore {
  /**
   * Mesh loaded from a GLTF-file
   * @author Matthias Roming, HFU, 2022
   */
  export class MeshImport extends Mesh {

    private uri: string;
    private filetype: string;
    private uid?: number;

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.uri = this.uri;
      serialization.filetype = this.filetype;
      if (this.filetype == "FBX")
        serialization.uid = this.uid;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      if (_serialization.filetype == "glTF")
        this.deserializeGLTF(_serialization);
      else if (_serialization.filetype == "FBX")
        this.deserializeFBX(_serialization);
      return this;
    }

    public async loadFromGLTF(_loader: GLTFLoader, _gltfMesh: GLTF.Mesh): Promise<MeshImport> {
      this.name = _gltfMesh.name;
      this.renderMesh = new RenderMesh(this);
      Reflect.set(this.renderMesh, "ƒindices", await _loader.getUint16Array(_gltfMesh.primitives[0].indices));
      Reflect.set(this.renderMesh, "ƒvertices", await _loader.getFloat32Array(_gltfMesh.primitives[0].attributes.POSITION));
      Reflect.set(this.renderMesh, "ƒnormalsVertex", await _loader.getFloat32Array(_gltfMesh.primitives[0].attributes.NORMAL));
      Reflect.set(this.renderMesh, "ƒtextureUVs", await _loader.getFloat32Array(_gltfMesh.primitives[0].attributes.TEXCOORD_0));
      this.createVerticesFromRenderMesh();
      this.createFacesFromRenderMesh();
      this.uri = _loader.uri;
      this.filetype = "glTF";
      return this;
    }

    public async loadFromFBX(_loader: FBXLoader, _fbxMesh: FBX.Geometry): Promise<MeshImport> {
      this.name = _fbxMesh.name;
      this.renderMesh = new RenderMesh(this);
      _fbxMesh.load();

      function getVertexData<T extends Vector2 | Vector3>(_layerElemet: FBX.LayerElementUV | FBX.LayerElementNormal, _iVertex: number, _iFace: number, _iFaceVertex: number): T {
        const index: number =
          _layerElemet.MappingInformationType == "ByPolygon" ?
            _iFace :
          _layerElemet.MappingInformationType == "ByVertex" ?
            _iVertex :
            _iFaceVertex;
        return (_layerElemet as FBX.LayerElementUV)?.UV ?
          new Vector2(
            (_layerElemet as FBX.LayerElementUV).UV[
              _layerElemet.MappingInformationType == "Direct" ?
                index * 2 + 0 :
                (_layerElemet as FBX.LayerElementUV).UVIndex[index * 2 + 0]
            ],
            (_layerElemet as FBX.LayerElementUV).UV[
              _layerElemet.MappingInformationType == "Direct" ?
                index * 2 + 1 :
                (_layerElemet as FBX.LayerElementUV).UVIndex[index * 2 + 1]
            ]
          ) as T :
        new Vector3(
          (_layerElemet as FBX.LayerElementNormal).Normals[index * 3 + 0],
          (_layerElemet as FBX.LayerElementNormal).Normals[index * 3 + 1],
          (_layerElemet as FBX.LayerElementNormal).Normals[index * 3 + 2]
        ) as T;
      }

      // To make ByPolygonVertex work properly, new vertices are created for each face,
      // instead of just copying the existing arrays (vertex, uv, normal)
      function createVertices(_mesh: Mesh, _indices: number[], _iFaceVertex: number): void {
        for (let i: number = 0; i < _indices.length; i++) {
          const position: Vector3 = new Vector3(
            _fbxMesh.Vertices[_indices[i] * 3 + 0],
            _fbxMesh.Vertices[_indices[i] * 3 + 1],
            _fbxMesh.Vertices[_indices[i] * 3 + 2]
          );
          if (position.magnitudeSquared < 1)
            console.log("vertex position equals zero");
          _mesh.vertices.push(new Vertex(
            position,
            getVertexData(
              _fbxMesh.LayerElementUV instanceof Array ?
                _fbxMesh.LayerElementUV[0] :
                _fbxMesh.LayerElementUV,
              _indices[i], _mesh.faces.length, _iFaceVertex + i
            ),
            getVertexData(_fbxMesh.LayerElementNormal, _indices[i], _mesh.faces.length, _iFaceVertex + i)
          ));
        }
      }

      for (let iFaceVertexIndex: number = 0, indices: number[] = [];
          iFaceVertexIndex < _fbxMesh.PolygonVertexIndex.length; iFaceVertexIndex++) {
        // Check if polygon end is not yet reached
        // Each polygon in fbx ends with a binary negated index (-index - 1),
        // so poligons with more points than a triangle are possible
        if (_fbxMesh.PolygonVertexIndex[iFaceVertexIndex] >= 0)
          indices.push(_fbxMesh.PolygonVertexIndex[iFaceVertexIndex]);
        else {
          // Reached end of polygon
          indices.push(-(_fbxMesh.PolygonVertexIndex[iFaceVertexIndex] + 1));
          createVertices(this, indices, iFaceVertexIndex - indices.length + 1);
          this.faces.push(
            ...indices.length == 3 ?
              [new Face(
                this.vertices,
                this.vertices.length - 3,
                this.vertices.length - 2,
                this.vertices.length - 1
              )] :
            indices.length == 4 ?
              new Quad(
                this.vertices,
                this.vertices.length - 4,
                this.vertices.length - 3,
                this.vertices.length - 2,
                this.vertices.length - 1,
                QUADSPLIT.AT_0
              ).faces :
            indices.reduce( // create n-gon
              (_faces, _index, _iIndex) => {
                if (_iIndex >= 2)
                  _faces.push(new Face(
                    this.vertices,
                    this.vertices.length - indices.length + _iIndex - 2,
                    this.vertices.length - indices.length + _iIndex - 1,
                    this.vertices.length - indices.length + _iIndex - 0
                  ));
                return _faces;
              },
              [] as Face[]
            )
          );
          indices.length = 0;
        }
      }

      this.uri = _loader.uri;
      this.filetype = "FBX";
      this.uid = _fbxMesh.uid;
      return this;
    }

    private async deserializeGLTF(_serialization: Serialization): Promise<void> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_serialization.uri);
      await this.loadFromGLTF(loader, loader.gltf.meshes.find(gltfMesh => gltfMesh.name == this.name));
    }

    private async deserializeFBX(_serialization: Serialization): Promise<void> {
      const loader: FBXLoader = await FBXLoader.LOAD(_serialization.uri);
      await this.loadFromFBX(loader, loader.fbx.objects.geometries.find(object => object.uid == _serialization.uid));
    }

    private createVerticesFromRenderMesh(): void {
      for (let iVertex: number = 0, iTextureUV: number = 0; iVertex < this.renderMesh.vertices.length;
           iVertex += 3, iTextureUV += 2) {
        this.vertices.push(new Vertex(
          new Vector3(
            this.renderMesh.vertices[iVertex + 0],
            this.renderMesh.vertices[iVertex + 1],
            this.renderMesh.vertices[iVertex + 2]
          ),
          new Vector2(
            this.renderMesh.textureUVs[iTextureUV + 0],
            this.renderMesh.textureUVs[iTextureUV + 1]
          ),
          new Vector3(
            this.renderMesh.normalsVertex[iVertex + 0],
            this.renderMesh.normalsVertex[iVertex + 1],
            this.renderMesh.normalsVertex[iVertex + 2]
          )
        ));
      }
    }

    private createFacesFromRenderMesh(): void {
      for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < this.renderMesh.indices.length; iFaceVertexIndex += 3) {
        this.faces.push(new Face(
          this.vertices,
          this.renderMesh.indices[iFaceVertexIndex + 0],
          this.renderMesh.indices[iFaceVertexIndex + 1],
          this.renderMesh.indices[iFaceVertexIndex + 2]
        ));
      }
    }
    
  }
}