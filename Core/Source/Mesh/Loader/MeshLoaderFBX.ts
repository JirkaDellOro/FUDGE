namespace FudgeCore {
  /**
   * Filmbox mesh import
   * @authors Matthias Roming, HFU, 2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshLoaderFBX extends MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data: FBX.Geometry): Promise<MeshImport> {
      const loader: FBXLoader = await FBXLoader.LOAD(_mesh.url.toString());
      const geometryFBX: FBX.Geometry = (
        _data ||
        loader.fbx.objects.geometries.find(object => object.name == _mesh.name) ||
        loader.fbx.objects.models.find(object => object.name == _mesh.name && object.subtype == "Mesh").children[0]
      ).load();
      if (_data)
        _mesh.name = _data.name.length > 0 ? _data.name : _data.parents[0].name;
      
      let positions: Vector3[] = [];
      let vertexBuffer: Float32Array = geometryFBX.Vertices;
      for (let iVertex: number = 0; iVertex < vertexBuffer.length; iVertex += 3) {
        positions.push(new Vector3(vertexBuffer[iVertex + 0], vertexBuffer[iVertex + 1], vertexBuffer[iVertex + 2]));
      }

      let uvs: Vector2[] = [];
      if (geometryFBX.LayerElementUV) {
        let uvBuffer: Float32Array = geometryFBX.LayerElementUV.UV;
        for (let iuv: number = 0; iuv < uvBuffer.length; iuv += 2) {
          uvs.push(new Vector2(uvBuffer[iuv], 1 - uvBuffer[iuv + 1]));
        }
      }

      let normals: Vector3[] = [];
      if (geometryFBX.LayerElementNormal) {
        let normalBuffer: Float32Array = geometryFBX.LayerElementNormal.Normals;
        for (let iNormal: number = 0; iNormal < normalBuffer.length; iNormal += 3) {
          normals.push(new Vector3(normalBuffer[iNormal], normalBuffer[iNormal + 1], normalBuffer[iNormal + 2]));
        }
      }

      let mapVertexToIndex: Map<string, number> = new Map();
      let newVertexIndices: number[][] = [];
      let iPolygon = 0;
      let isEndOfPolygon: boolean = false;
      let polygon: number[] = [];

      geometryFBX.PolygonVertexIndex.forEach((_iVertex, _iPolygonVertex) => {
        if (_iVertex < 0) {
          _iVertex = _iVertex ^ - 1;
          isEndOfPolygon = true;
        }

        let position: Vector3 = positions[_iVertex];
        let uv: Vector2 = uvs[getDataIndex(geometryFBX.LayerElementUV, _iVertex, iPolygon, _iPolygonVertex)];

        let vertexKey = position.toString() + uv.toString();
        if (!mapVertexToIndex.has(vertexKey)) {
          let normal: Vector3 = normals[getDataIndex(geometryFBX.LayerElementNormal, _iVertex, iPolygon, _iPolygonVertex)];
        
          _mesh.vertices.push(new Vertex(position, uv, normal));
          mapVertexToIndex.set(vertexKey, _mesh.vertices.length - 1);
          if (!newVertexIndices[_iVertex])
            newVertexIndices[_iVertex] = [];
          newVertexIndices[_iVertex].push(_mesh.vertices.length - 1);
        }
        polygon.push(mapVertexToIndex.get(vertexKey));
        
        if (isEndOfPolygon) {
          if (polygon.length == 3) {
            _mesh.faces.push(new Face(_mesh.vertices, polygon[0], polygon[1], polygon[2]));
          } else if (polygon.length == 4) {
            let quad: Quad = new Quad(_mesh.vertices, polygon[0], polygon[1], polygon[2], polygon[3], QUADSPLIT.AT_0);
            _mesh.faces.push(...quad.faces);
          } else {
            // could add proper triangulation here
            console.warn(`${MeshLoaderFBX.name}: Polygons with more than 4 vertices are not supported.`)
          }
          polygon = [];
          isEndOfPolygon = false;
          iPolygon++;
        }        
      })

      if (_mesh instanceof MeshSkin) {
        const fbxDeformer: FBX.Deformer = geometryFBX.children[0];
        const skeleton: Skeleton = await loader.getSkeleton(fbxDeformer.children[0].children[0]); // Deformer.SubDeformer.LimbNode
        createBones(fbxDeformer, skeleton, _mesh.vertices, newVertexIndices);
      }
      return _mesh;
    }
  }

  function getDataIndex(_layerElement: FBX.LayerElementUV | FBX.LayerElementNormal, _iVertex: number, _iPolygon: number, _iPolygonVertex: number): number {
    let index: number =
      _layerElement.MappingInformationType == "ByVertex" ?
        _iVertex :
      _layerElement.MappingInformationType == "ByPolygon" ?
        _iPolygon :
        _iPolygonVertex;
    
    if (_layerElement.ReferenceInformationType === 'IndexToDirect' ) {
      let indices: Uint16Array = (_layerElement as FBX.LayerElementUV).UVIndex || (_layerElement as FBX.LayerElementNormal).NormalsIndex;
      index = indices[index];
    }

    return index;
  }

  function createBones(_deformerFBX: FBX.Deformer, _skeleton: Skeleton, _vertices: Vertices, _newVertexIndices?: number[][]): void {
    for (const fbxSubDeformer of _deformerFBX.children as FBX.SubDeformer[]) {
      fbxSubDeformer.load();
      if (fbxSubDeformer.Indexes)
        for (let iBoneInfluence: number = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
          const iVertex: number = fbxSubDeformer.Indexes[iBoneInfluence];
          for (const iVertexNew of _newVertexIndices ? _newVertexIndices[iVertex] : [iVertex]) {
            (_vertices[iVertexNew].bones || (_vertices[iVertexNew].bones = [])).push({
              index: _skeleton.indexOfBone(fbxSubDeformer.children[0].name),
              weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
            });
          }

        }
    }
  }
}