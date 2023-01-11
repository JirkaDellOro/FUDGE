namespace FudgeCore {
  /**
   * Filmbox mesh import
   * @author Matthias Roming, HFU, 2023
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
      // Create vertices and faces
      for (let iPolygonVertexIndex: number = 0, indices: number[] = [];
          iPolygonVertexIndex < geometryFBX.PolygonVertexIndex.length; iPolygonVertexIndex++) {
        // Check if polygon end is not yet reached
        // Each polygon in fbx ends with a binary negated index (-index - 1),
        // so poligons with more points than a triangle are possible
        if (geometryFBX.PolygonVertexIndex[iPolygonVertexIndex] >= 0)
          indices.push(geometryFBX.PolygonVertexIndex[iPolygonVertexIndex]);
        else {
          // Reached end of polygon
          indices.push(-(geometryFBX.PolygonVertexIndex[iPolygonVertexIndex] + 1));
          // To make ByPolygonVertex work properly, new vertices are created for each face,
          // instead of just copying the existing arrays (vertex, uv, normal)
          _mesh.vertices.push(...getVertices(geometryFBX, indices, _mesh.faces.length, iPolygonVertexIndex - indices.length + 1));
          _mesh.faces.push(...getFaces(indices, _mesh.vertices));
          indices.length = 0;
        }
      }
      if (_mesh instanceof MeshSkin) {
        const fbxDeformer: FBX.Deformer = geometryFBX.children[0];
        const skeleton: Skeleton = await loader.getSkeleton(fbxDeformer.children[0].children[0]); // Deformer.SubDeformer.LimbNode
        createBones(fbxDeformer, skeleton, _mesh.vertices);
      }
      return _mesh;
    }
  }

  function* getVertices(_geometryFBX: FBX.Geometry, _indices: number[], _iFace: number, _iFaceVertex: number): Generator<Vertex> {
    for (let i: number = 0; i < _indices.length; i++) {
      const position: Vector3 = new Vector3(
        _geometryFBX.Vertices[_indices[i] * 3 + 0],
        _geometryFBX.Vertices[_indices[i] * 3 + 1],
        _geometryFBX.Vertices[_indices[i] * 3 + 2]
      );
      if (position.magnitudeSquared < 1)
        console.log("vertex position equals zero");
      yield new Vertex(
        position,
        getVertexData(
          _geometryFBX.LayerElementUV instanceof Array ?
            _geometryFBX.LayerElementUV[0] :
            _geometryFBX.LayerElementUV,
          _indices[i], _iFace, _iFaceVertex + i
        ),
        getVertexData(_geometryFBX.LayerElementNormal, _indices[i], _iFace, _iFaceVertex + i)
      );
    }
  }

  function* getFaces(_indices: number[], _vertices: Vertices): Generator<Face> {
    if (_indices.length == 3)
        yield new Face(
          _vertices,
          _vertices.length - 3,
          _vertices.length - 2,
          _vertices.length - 1
        );
    else if (_indices.length == 4)
      for (const face of new Quad(
            _vertices,
            _vertices.length - 4,
            _vertices.length - 3,
            _vertices.length - 2,
            _vertices.length - 1,
            QUADSPLIT.AT_0
          ).faces)
        yield face;
    else
      for (let i: number = 2; i < _indices.length; i++) {
        yield new Face(
          _vertices,
          _vertices.length - _indices.length + i - 2,
          _vertices.length - _indices.length + i - 1,
          _vertices.length - _indices.length + i - 0
        );
      }
  }

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

  function createBones(_deformerFBX: FBX.Deformer, _skeleton: Skeleton, _vertices: Vertices): void {
    for (const fbxSubDeformer of _deformerFBX.children as FBX.SubDeformer[]) {
      fbxSubDeformer.load();
      if (fbxSubDeformer.Indexes)
        for (let iBoneInfluence: number = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
          const iVertex: number = fbxSubDeformer.Indexes[iBoneInfluence];
          if (_vertices[iVertex])
            (_vertices[iVertex].bones || (_vertices[iVertex].bones = [])).push({
              index: _skeleton.indexOfBone(fbxSubDeformer.children[0].name),
              weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
            });
        }
    }
  }
}
