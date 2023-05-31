namespace FudgeCore {
  /**
   * gl Transfer Format mesh import
   * @author Matthias Roming, HFU, 2022-2023
   */
  export class MeshLoaderGLTF extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: GLTF.Mesh): Promise<MeshImport> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_mesh.url.toString());
      const meshGLTF: GLTF.Mesh = _data || loader.gltf.meshes.find(gltfMesh => gltfMesh.name == _mesh.name);
      const renderMesh: RenderMesh = Reflect.get(_mesh, "renderMesh");
      _mesh.name = _data.name;
      Reflect.set(renderMesh, "ƒindices", await loader.getUint16Array(meshGLTF.primitives[0].indices));
      Reflect.set(renderMesh, "ƒvertices", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.POSITION));
      if (meshGLTF.primitives[0].attributes.NORMAL)
        Reflect.set(renderMesh, "ƒnormalsVertex", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.NORMAL));
      if (meshGLTF.primitives[0].attributes.TEXCOORD_0)
        Reflect.set(renderMesh, "ƒtextureUVs", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.TEXCOORD_0));
      _mesh.vertices.push(...getVertices(renderMesh));
      _mesh.faces.push(...getFaces(renderMesh, _mesh.vertices));
      if (_mesh instanceof MeshSkin) {
        Reflect.set(renderMesh, "ƒiBones", await loader.getUint8Array(meshGLTF.primitives[0].attributes.JOINTS_0));
        Reflect.set(renderMesh, "ƒweights", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.WEIGHTS_0));
        createBones(renderMesh, _mesh.vertices);
      }
      return _mesh;
    }
  }

  function* getVertices(_renderMesh: RenderMesh): Generator<Vertex> {
    for (let iVertex: number = 0, iTextureUV: number = 0; iVertex < _renderMesh.vertices.length;
      iVertex += 3, iTextureUV += 2) {
      yield new Vertex(
        new Vector3(
          _renderMesh.vertices[iVertex + 0],
          _renderMesh.vertices[iVertex + 1],
          _renderMesh.vertices[iVertex + 2]
        ),
        new Vector2(
          _renderMesh.textureUVs[iTextureUV + 0],
          _renderMesh.textureUVs[iTextureUV + 1]
        ),
        new Vector3(
          _renderMesh.normalsVertex[iVertex + 0],
          _renderMesh.normalsVertex[iVertex + 1],
          _renderMesh.normalsVertex[iVertex + 2]
        )
      );
    }
  }

  function* getFaces(_renderMesh: RenderMesh, _vertices: Vertices): Generator<Face> {
    for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < _renderMesh.indices.length; iFaceVertexIndex += 3) {
      yield new Face(
        _vertices,
        _renderMesh.indices[iFaceVertexIndex + 0],
        _renderMesh.indices[iFaceVertexIndex + 1],
        _renderMesh.indices[iFaceVertexIndex + 2]
      );
    }
  }

  function createBones(_renderMesh: RenderMesh, _vertices: Vertices): void {
    for (let iVertex: number = 0, iBoneEntry: number = 0; iVertex < _vertices.length; iVertex++) {
      _vertices[iVertex].bones = [];
      for (let i: number = 0; i < 4; i++, iBoneEntry++) {
        _vertices[iVertex].bones.push({
          index: _renderMesh.iBones[iBoneEntry],
          weight: _renderMesh.weights[iBoneEntry]
        });
      }
    }
  }
}