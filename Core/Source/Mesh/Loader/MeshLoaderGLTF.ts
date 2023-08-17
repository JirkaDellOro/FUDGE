namespace FudgeCore {
  /**
   * gl Transfer Format mesh import
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshLoaderGLTF extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: { mesh: GLTF.Mesh; iPrimitive: number }): Promise<MeshImport> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_mesh.url.toString());
      const gltfMesh: GLTF.Mesh = _data.mesh;
      const gltfPrimitive: GLTF.MeshPrimitive = gltfMesh.primitives[_data.iPrimitive];
      const renderMesh: RenderMesh = Reflect.get(_mesh, "renderMesh");
      _mesh.name = _data.mesh.name;

      if (gltfPrimitive.indices)
        Reflect.set(renderMesh, "ƒindices", await loader.getVertexIndices(gltfPrimitive.indices));

      Reflect.set(renderMesh, "ƒvertices", await loader.getFloat32Array(gltfPrimitive.attributes.POSITION));

      if (gltfPrimitive.attributes.NORMAL)
        Reflect.set(renderMesh, "ƒnormalsVertex", await loader.getFloat32Array(gltfPrimitive.attributes.NORMAL));

      // TODO: add tangents to RenderMesh
      // if (meshGLTF.primitives[_data.iPrimitive].attributes.TANGENT)
      //   Reflect.set(renderMesh, "ƒtangents", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.TANGENT));

      if (gltfPrimitive.attributes.TEXCOORD_0)
        Reflect.set(renderMesh, "ƒtextureUVs", await loader.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_0));

      if (gltfPrimitive.attributes.COLOR_0)
        Reflect.set(renderMesh, "ƒcolors", await loader.getVertexColors(gltfPrimitive.attributes.COLOR_0));
      else
        Reflect.set(renderMesh, "ƒcolors", new Float32Array(renderMesh.vertices.length * 4).fill(1));

      // TODO: check if these lines are needed, also spread operator will cause problems with too many vertices/faces
      _mesh.vertices.push(...getVertices(renderMesh));
      _mesh.faces.push(...getFaces(renderMesh, _mesh.vertices));

      if (_mesh instanceof MeshSkin) {
        Reflect.set(renderMesh, "ƒiBones", await loader.getBoneIndices(gltfPrimitive.attributes.JOINTS_0));
        Reflect.set(renderMesh, "ƒweights", await loader.getFloat32Array(gltfPrimitive.attributes.WEIGHTS_0));
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
        Reflect.get(_renderMesh, "ƒnormalsVertex") ?
          new Vector3(
            _renderMesh.normalsVertex[iVertex + 0],
            _renderMesh.normalsVertex[iVertex + 1],
            _renderMesh.normalsVertex[iVertex + 2]
          ) :
          undefined,
        new Color(
          _renderMesh.colors[iVertex + 0],
          _renderMesh.colors[iVertex + 1],
          _renderMesh.colors[iVertex + 2],
          _renderMesh.colors[iVertex + 3]
        )
      );
    }
  }

  function* getFaces(_renderMesh: RenderMesh, _vertices: Vertices): Generator<Face> {
    for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < _renderMesh.indices.length; iFaceVertexIndex += 3) {
      try {
        yield new Face(
          _vertices,
          _renderMesh.indices[iFaceVertexIndex + 0],
          _renderMesh.indices[iFaceVertexIndex + 1],
          _renderMesh.indices[iFaceVertexIndex + 2]
        );
      } catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
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