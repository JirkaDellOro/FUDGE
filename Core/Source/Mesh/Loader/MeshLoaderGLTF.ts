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
      let tangents: Float32Array;
      let textureUVs: Float32Array;
      let colors: Float32Array;
      let bones: Uint8Array;
      let weights: Float32Array;

      if (gltfPrimitive.indices != undefined) {
        indices = await loader.getVertexIndices(gltfPrimitive.indices);
        for (let i: number = 0; i < indices.length; i += 3) {
          const temp: number = indices[i + 2];
          indices[i + 2] = indices[i + 0];
          indices[i + 0] = indices[i + 1];
          indices[i + 1] = temp;
        }
      } else {
        Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has no indices. FUDGE does not support non-indexed meshes.`);
      }

      if (gltfPrimitive.attributes.POSITION != undefined)
        vertices = await loader.getFloat32Array(gltfPrimitive.attributes.POSITION);
      else
        Debug.warn(`${loader}: Mesh with index ${_data.iMesh} primitive ${_data.iPrimitive} has no position attribute. Primitive will be ignored.`);

      if (gltfPrimitive.attributes.NORMAL != undefined)
        normals = await loader.getFloat32Array(gltfPrimitive.attributes.NORMAL);

      if (gltfPrimitive.attributes.TANGENT != undefined)
        tangents = await loader.getFloat32Array(gltfPrimitive.attributes.TANGENT);

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

      for (let iVector2: number = 0, iVector3: number = 0, iVector4: number = 0; iVector3 < vertices?.length; iVector2 += 2, iVector3 += 3, iVector4 += 4) {
        _mesh.vertices.push(
          new Vertex(
            new Vector3(vertices[iVector3 + 0], vertices[iVector3 + 1], vertices[iVector3 + 2]),
            textureUVs ?
              new Vector2(textureUVs[iVector2 + 0], textureUVs[iVector2 + 1]) :
              undefined,
            normals ?
              new Vector3(normals[iVector3 + 0], normals[iVector3 + 1], normals[iVector3 + 2]) :
              undefined,
            tangents ?
              new Vector4(tangents[iVector4 + 0], tangents[iVector4 + 1], tangents[iVector4 + 2], tangents[iVector4 + 3]) :
              undefined,
            colors ?
              new Color(colors[iVector4 + 0], colors[iVector4 + 1], colors[iVector4 + 2], colors[iVector4 + 3]) :
              undefined,
            bones && weights ?
              [
                { index: bones[iVector4 + 0], weight: weights[iVector4 + 0] },
                { index: bones[iVector4 + 1], weight: weights[iVector4 + 1] },
                { index: bones[iVector4 + 2], weight: weights[iVector4 + 2] },
                { index: bones[iVector4 + 3], weight: weights[iVector4 + 3] }
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
      renderMesh.tangents = tangents;
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