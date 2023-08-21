namespace FudgeCore {
  /**
   * gl Transfer Format mesh import
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshLoaderGLTF extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: { gltfMesh: GLTF.Mesh; iPrimitive: number }): Promise<MeshImport> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_mesh.url.toString());
      const gltfMesh: GLTF.Mesh = _data.gltfMesh;
      const gltfPrimitive: GLTF.MeshPrimitive = gltfMesh.primitives[_data.iPrimitive];

      _mesh.name = _data.gltfMesh.name;

      let indices: Uint16Array;
      let vertices: Float32Array;
      let normalsVertex: Float32Array;
      let textureUVs: Float32Array;
      let colors: Float32Array;
      let iBones: Uint8Array;
      let weights: Float32Array;

      vertices = await loader.getFloat32Array(gltfPrimitive.attributes.POSITION);

      if (gltfPrimitive.indices != undefined)
        indices = await loader.getVertexIndices(gltfPrimitive.indices);

      if (gltfPrimitive.attributes.NORMAL != undefined)
        normalsVertex = await loader.getFloat32Array(gltfPrimitive.attributes.NORMAL);

      // TODO: add tangents to RenderMesh
      // if (meshGLTF.primitives[_data.iPrimitive].attributes.TANGENT)
      //   Reflect.set(renderMesh, "ƒtangents", await loader.getFloat32Array(meshGLTF.primitives[_data.iPrimitive].attributes.TANGENT));

      if (gltfPrimitive.attributes.TEXCOORD_0 != undefined)
        textureUVs = await loader.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_0);

      if (gltfPrimitive.attributes.COLOR_0 != undefined)
        colors = await loader.getVertexColors(gltfPrimitive.attributes.COLOR_0);

      if (gltfPrimitive.attributes.JOINTS_0 != undefined && gltfPrimitive.attributes.WEIGHTS_0 != undefined) {
        iBones = await loader.getBoneIndices(gltfPrimitive.attributes.JOINTS_0);
        weights = await loader.getFloat32Array(gltfPrimitive.attributes.WEIGHTS_0);
      }

      for (let iVertex: number = 0, iTextureUV: number = 0, iBoneEntry: number = 0; iVertex < vertices.length; iVertex += 3, iTextureUV += 2, iBoneEntry += 4) {
        _mesh.vertices.push(
          new Vertex(
            new Vector3(vertices[iVertex + 0], vertices[iVertex + 1], vertices[iVertex + 2]),
            textureUVs ?
              new Vector2(textureUVs[iTextureUV + 0], textureUVs[iTextureUV + 1]) :
              undefined,
            normalsVertex ?
              new Vector3(normalsVertex[iVertex + 0], normalsVertex[iVertex + 1], normalsVertex[iVertex + 2]) :
              undefined,
            colors ?
              new Color(colors[iVertex + 0], colors[iVertex + 1], colors[iVertex + 2], colors[iVertex + 3]) :
              undefined,
            iBones && weights ?
              [
                { index: iBones[iBoneEntry + 0], weight: weights[iBoneEntry + 0] },
                { index: iBones[iBoneEntry + 1], weight: weights[iBoneEntry + 1] },
                { index: iBones[iBoneEntry + 2], weight: weights[iBoneEntry + 2] },
                { index: iBones[iBoneEntry + 3], weight: weights[iBoneEntry + 3] }
              ] :
              undefined
          )
        );
      }

      for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < indices.length; iFaceVertexIndex += 3) {
        try {
          _mesh.faces.push(new Face(
            _mesh.vertices,
            indices[iFaceVertexIndex + 0],
            indices[iFaceVertexIndex + 1],
            indices[iFaceVertexIndex + 2]
          ));
        } catch (_e: unknown) {
          Debug.fudge("Face excluded", (<Error>_e).message);
        }
      }

      const renderMesh: RenderMesh = _mesh.renderMesh;
      renderMesh.indices = indices;
      renderMesh.vertices = vertices;
      renderMesh.normalsVertex = normalsVertex;
      renderMesh.textureUVs = textureUVs;
      renderMesh.colors = colors;
      renderMesh.iBones = iBones;
      renderMesh.weights = weights;

      return _mesh;
    }
  }
}