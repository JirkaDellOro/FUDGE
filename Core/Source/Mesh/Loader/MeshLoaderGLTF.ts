namespace FudgeCore {
  /**
   * gl Transfer Format mesh import
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshLoaderGLTF extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: { iMesh: number; iPrimitive: number }): Promise<MeshImport> {
      const loader: GLTFLoader = await GLTFLoader.LOAD(_mesh.url.toString());
      const gltfMesh: GLTF.Mesh = loader.gltf.meshes[_data.iMesh];
      const gltfPrimitive: GLTF.MeshPrimitive = gltfMesh.primitives[_data.iPrimitive];

      if (gltfPrimitive.indices == undefined)
        Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has no indices. FUDGE does not support non-indexed meshes.`);

      if (gltfPrimitive.attributes.POSITION == undefined)
        Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has no position attribute. Primitive will be ignored.`);

      if (gltfPrimitive.mode != undefined && gltfPrimitive.mode != GLTF.MESH_PRIMITIVE_MODE.TRIANGLES)
        Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has topology type mode ${GLTF.MESH_PRIMITIVE_MODE[gltfPrimitive.mode]}. FUDGE only supports ${GLTF.MESH_PRIMITIVE_MODE[4]}.`);

      checkMaxSupport(gltfPrimitive.attributes, "TEXCOORD", 2);
      checkMaxSupport(gltfPrimitive.attributes, "COLOR", 1);
      checkMaxSupport(gltfPrimitive.attributes, "JOINTS", 1);
      checkMaxSupport(gltfPrimitive.attributes, "WEIGHTS", 1);

      _mesh.name = gltfMesh.name;

      let indices: Uint16Array;
      let vertices: Float32Array;
      let normals: Float32Array;
      // let tangents: Float32Array;
      let textureUVs: Float32Array;
      let colors: Float32Array;
      let bones: Uint8Array;
      let weights: Float32Array;

      if (gltfPrimitive.indices != undefined)
        indices = await loader.getVertexIndices(gltfPrimitive.indices); // maybe throw error instead

      if (gltfPrimitive.attributes.POSITION != undefined)
        vertices = await loader.getFloat32Array(gltfPrimitive.attributes.POSITION); // maybe throw error instead

      if (gltfPrimitive.attributes.NORMAL != undefined)
        normals = await loader.getFloat32Array(gltfPrimitive.attributes.NORMAL);

      // TODO: add tangents to RenderMesh
      // if (gltfPrimitive.attributes.TANGENT)
      //   tangents = await loader.getFloat32Array(gltfPrimitive.attributes.TANGENT);

      if (gltfPrimitive.attributes.TEXCOORD_1 != undefined)
        textureUVs = await loader.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_1);
      else if (gltfPrimitive.attributes.TEXCOORD_0 != undefined)
        textureUVs = await loader.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_0);

      if (gltfPrimitive.attributes.COLOR_0 != undefined)
        colors = await loader.getVertexColors(gltfPrimitive.attributes.COLOR_0);

      if (gltfPrimitive.attributes.JOINTS_0 != undefined && gltfPrimitive.attributes.WEIGHTS_0 != undefined) {
        bones = await loader.getBoneIndices(gltfPrimitive.attributes.JOINTS_0);
        weights = await loader.getFloat32Array(gltfPrimitive.attributes.WEIGHTS_0);
      }

      for (let iVertex: number = 0, iColor: number = 0, iTextureUV: number = 0, iBoneEntry: number = 0; iVertex < vertices?.length; iVertex += 3, iColor += 4, iTextureUV += 2, iBoneEntry += 4) {
        _mesh.vertices.push(
          new Vertex(
            new Vector3(vertices[iVertex + 0], vertices[iVertex + 1], vertices[iVertex + 2]),
            textureUVs ?
              new Vector2(textureUVs[iTextureUV + 0], textureUVs[iTextureUV + 1]) :
              undefined,
            normals ?
              new Vector3(normals[iVertex + 0], normals[iVertex + 1], normals[iVertex + 2]) :
              undefined,
            colors ?
              new Color(colors[iColor + 0], colors[iColor + 1], colors[iColor + 2], colors[iColor + 3]) :
              undefined,
            bones && weights ?
              [
                { index: bones[iBoneEntry + 0], weight: weights[iBoneEntry + 0] },
                { index: bones[iBoneEntry + 1], weight: weights[iBoneEntry + 1] },
                { index: bones[iBoneEntry + 2], weight: weights[iBoneEntry + 2] },
                { index: bones[iBoneEntry + 3], weight: weights[iBoneEntry + 3] }
              ] :
              undefined
          )
        );
      }

      for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < indices?.length; iFaceVertexIndex += 3) {
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
      renderMesh.normals = normals;
      // renderMesh.tangents = tangents;
      renderMesh.textureUVs = textureUVs;
      renderMesh.colors = colors;
      renderMesh.bones = bones;
      renderMesh.weights = weights;

      return _mesh;

      function checkMaxSupport(_gltfAttributes: GLTF.MeshPrimitive["attributes"], _check: string, _max: number): void {
        if (Object.keys(gltfPrimitive.attributes).filter((_key: string) => _key.startsWith(_check)).length > _max)
          Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has more than ${_max} sets of '${_check}' associated with it. FUGDE only supports up to ${_max} ${_check} sets per primitve.`);
      }
    }
  }
}