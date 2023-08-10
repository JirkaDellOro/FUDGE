namespace FudgeCore {
  /**
   * gl Transfer Format mesh import
   * @author Matthias Roming, HFU, 2022-2023
   */
  export class MeshLoaderGLTF extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: { mesh: GLTF.Mesh; iPrimitive: number }): Promise<MeshImport> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_mesh.url.toString());
      const meshGLTF: GLTF.Mesh = _data.mesh || loader.gltf.meshes.find(_gltfMesh => _gltfMesh.name == _mesh.name);
      const renderMesh: RenderMesh = Reflect.get(_mesh, "renderMesh");
      _mesh.name = _data.mesh.name;
      if (meshGLTF.primitives[_data.iPrimitive].indices)
        Reflect.set(renderMesh, "ƒindices", await loader.getVertexIndices(meshGLTF.primitives[_data.iPrimitive].indices));
      Reflect.set(renderMesh, "ƒvertices", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.POSITION));
      if (meshGLTF.primitives[_data.iPrimitive].attributes.NORMAL)
        Reflect.set(renderMesh, "ƒnormalsVertex", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.NORMAL));
      if (meshGLTF.primitives[_data.iPrimitive].attributes.TEXCOORD_0)
        Reflect.set(renderMesh, "ƒtextureUVs", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.TEXCOORD_0));
      if (meshGLTF.primitives[_data.iPrimitive].attributes.COLOR_0)
        Reflect.set(renderMesh, "ƒcolors", await loader.getVertexColors(meshGLTF.primitives[_data.iPrimitive].attributes.COLOR_0));
      // TODO: check if these lines are needed, also spread operator will cause problems with too many vertices/faces
      // _mesh.vertices.push(...getVertices(renderMesh));
      // _mesh.faces.push(...getFaces(renderMesh, _mesh.vertices));
      if (_mesh instanceof MeshSkin) {
        Reflect.set(renderMesh, "ƒiBones", await loader.getUint8Array(meshGLTF.primitives[_data.iPrimitive].attributes.JOINTS_0));
        Reflect.set(renderMesh, "ƒweights", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.WEIGHTS_0));
        createBones(renderMesh, _mesh.vertices);
      }
      return _mesh;
    }
  }

  // function* getVertices(_renderMesh: RenderMesh): Generator<Vertex> {
  //   for (let iVertex: number = 0, iTextureUV: number = 0; iVertex < _renderMesh.vertices.length;
  //     iVertex += 3, iTextureUV += 2) {
  //     yield new Vertex(
  //       new Vector3(
  //         _renderMesh.vertices[iVertex + 0],
  //         _renderMesh.vertices[iVertex + 1],
  //         _renderMesh.vertices[iVertex + 2]
  //       ),
  //       new Vector2(
  //         _renderMesh.textureUVs[iTextureUV + 0],
  //         _renderMesh.textureUVs[iTextureUV + 1]
  //       ),
  //       new Vector3(
  //         _renderMesh.normalsVertex[iVertex + 0],
  //         _renderMesh.normalsVertex[iVertex + 1],
  //         _renderMesh.normalsVertex[iVertex + 2]
  //       )
  //     );
  //   }
  // }

  // function* getFaces(_renderMesh: RenderMesh, _vertices: Vertices): Generator<Face> {
  //   for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < _renderMesh.indices.length; iFaceVertexIndex += 3) {
  //     try {
  //       yield new Face(
  //         _vertices,
  //         _renderMesh.indices[iFaceVertexIndex + 0],
  //         _renderMesh.indices[iFaceVertexIndex + 1],
  //         _renderMesh.indices[iFaceVertexIndex + 2]
  //       );
  //     } catch (_e: unknown) {
  //       Debug.fudge("Face excluded", (<Error>_e).message);
  //     }
  //   }
  // }

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