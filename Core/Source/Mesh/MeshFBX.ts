namespace FudgeCore {

  /**
   * A mesh loaded from an FBX-File.
   * @authors Matthias Roming, HFU, 2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshFBX extends mixinSerializableResourceExternal(Mesh) {
    // public url: RequestInfo;
    public iMesh: number;
    public async load(_url: RequestInfo = this.url, _iMesh: number = this.iMesh): Promise<MeshFBX> {
      this.clear();
      this.url = _url;
      this.iMesh = _iMesh;
      const loader: FBXLoader = await FBXLoader.LOAD(this.url.toString());
      const geometryFBX: FBX.Geometry = (
        loader.fbx.objects.geometries[_iMesh] ||
        loader.fbx.objects.geometries.find(_object => _object.name == this.name) ||
        loader.fbx.objects.models.find(_object => _object.name == this.name && _object.subtype == "Mesh").children[0]
      ).load();
      if (geometryFBX)
        this.name = geometryFBX.name.length > 0 ? geometryFBX.name : geometryFBX.parents[0].name;

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
      let iPolygon: number = 0;
      let isEndOfPolygon: boolean = false;
      let polygon: number[] = [];

      geometryFBX.PolygonVertexIndex.forEach((_iVertex, _iPolygonVertex) => {
        if (_iVertex < 0) {
          _iVertex = _iVertex ^ - 1;
          isEndOfPolygon = true;
        }

        let position: Vector3 = positions[_iVertex];
        let uv: Vector2 = uvs[this.getDataIndex(geometryFBX.LayerElementUV, _iVertex, iPolygon, _iPolygonVertex)];

        let vertexKey: string = position.toString() + uv.toString();
        if (!mapVertexToIndex.has(vertexKey)) {
          let normal: Vector3 = normals[this.getDataIndex(geometryFBX.LayerElementNormal, _iVertex, iPolygon, _iPolygonVertex)];

          this.vertices.push(new Vertex(position, uv, normal));
          mapVertexToIndex.set(vertexKey, this.vertices.length - 1);
          if (!newVertexIndices[_iVertex])
            newVertexIndices[_iVertex] = [];
          newVertexIndices[_iVertex].push(this.vertices.length - 1);
        }
        polygon.push(mapVertexToIndex.get(vertexKey));

        if (isEndOfPolygon) {
          if (polygon.length == 3) {
            this.faces.push(new Face(this.vertices, polygon[0], polygon[1], polygon[2]));
          } else if (polygon.length == 4) {
            let quad: Quad = new Quad(this.vertices, polygon[0], polygon[1], polygon[2], polygon[3]);
            this.faces.push(...quad.faces);
          } else {
            for (let i: number = 2; i < polygon.length; i++)
              this.faces.push(new Face(this.vertices, polygon[0], polygon[i - 1], polygon[i - 0]));
            // console.warn(`${MeshLoaderFBX.name}: Polygons with more than 4 vertices are not supported.`);
          }
          polygon = [];
          isEndOfPolygon = false;
          iPolygon++;
        }
      });

      if (geometryFBX.children?.[0].type == "Deformer") {
        const fbxDeformer: FBX.Deformer = geometryFBX.children[0];
        const skeleton: ComponentSkeleton = await loader.getSkeleton(fbxDeformer.children[0].children[0]); // Deformer.SubDeformer.LimbNode
        this.createBones(fbxDeformer, skeleton, this.vertices, newVertexIndices);
      }
      return this;
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.iMesh = this.iMesh;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.iMesh = _serialization.iMesh;
      return super.deserialize(_serialization);
    }

    private getDataIndex(_layerElement: FBX.LayerElementUV | FBX.LayerElementNormal, _iVertex: number, _iPolygon: number, _iPolygonVertex: number): number {
      let index: number =
        _layerElement.MappingInformationType == "ByVertex" ?
          _iVertex :
          _layerElement.MappingInformationType == "ByPolygon" ?
            _iPolygon :
            _iPolygonVertex;

      if (_layerElement.ReferenceInformationType === 'IndexToDirect') {
        let indices: Uint16Array = (_layerElement as FBX.LayerElementUV).UVIndex || (_layerElement as FBX.LayerElementNormal).NormalsIndex;
        index = indices[index];
      }

      return index;
    }

    private createBones(_deformerFBX: FBX.Deformer, _skeleton: ComponentSkeleton, _vertices: Vertices, _newVertexIndices?: number[][]): void {
      for (const fbxSubDeformer of _deformerFBX.children as FBX.SubDeformer[]) {
        fbxSubDeformer.load();
        if (fbxSubDeformer.Indexes)
          for (let iBoneInfluence: number = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
            const iVertex: number = fbxSubDeformer.Indexes[iBoneInfluence];
            for (const iVertexNew of _newVertexIndices ? _newVertexIndices[iVertex] : [iVertex]) {
              (_vertices[iVertexNew].bones || (_vertices[iVertexNew].bones = [])).push({
                index: _skeleton.indexOf(fbxSubDeformer.children[0].name),
                weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
              });
            }

          }
      }
    }
  }
}
