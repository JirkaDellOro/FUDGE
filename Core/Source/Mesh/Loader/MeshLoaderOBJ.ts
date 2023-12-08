namespace FudgeCore {
  /**
   * Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
   * static LOAD Method. Currently only works with triangulated Meshes
   * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
   * @todo Load Materials, Support Quads
   * @authors Simon Storl-Schulke 2021 | Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021-2022 | Matthias Roming, HFU, 2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshLoaderOBJ extends MeshLoader {
    public static async load(_mesh: MeshImport): Promise<MeshImport> {
      let url: string = new URL(_mesh.url.toString(), Project.baseURL).toString();
      let data: string = await (await fetch(url)).text();
      _mesh.name = url.split("/").pop();
      parseObj(data, _mesh);
      return _mesh;
    }
  }

  /** Splits up the obj string into separate arrays for each datatype */
  function parseObj(_data: string, _mesh: MeshImport): void {
    const lines: string[] = _data.split("\n");

    const indices: number[] = [];
    const positions: Vector3[] = [];
    const uvs: Vector2[] = [];
    const normals: Vector3[] = [];
    const norms: number[] = [];

    const vertices: Vertices = new Vertices();
    const faces: Face[] = [];
    const mapPositionUVNormalToIndex: { [key: string]: number } = {};
    const mapPositionNormalToIndex: { [key: string]: number } = {};

    // TODO: think about creating the needed buffers for rendermesh here already...
    for (let line of lines) {
      const parts: string[] = line.trim().split(" ");
      switch (parts.shift()) {
        case "v": //Vertex - example: v 0.70 -0.45 -0.52         
          positions.push(new Vector3(...parts.map(_value => +_value)));
          break;
        case "vn": //Normal - example: vn 0.00 0.00 1.00
          normals.push(new Vector3(...parts.map(_value => +_value)));
          break;
        case "vt": //Texcoord - example: vt 0.545454 0.472382
          uvs.push(new Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));
          break;
        case "f": /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 --> vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
          for (let i: number = 0; i < 3; i++) {
            let key: string = parts[i];
            let index: number | undefined = mapPositionUVNormalToIndex[key];
            if (index === undefined) {
              index = vertices.length;
              const vertexInfo: string[] = parts[i].split("/");
              let position: Vector3 = positions[+vertexInfo[0] - 1]; // obj uses 1-based indices
              let uv: Vector2 = uvs[+vertexInfo[1] - 1] ?? undefined;
              let normal: Vector3 = normals[+vertexInfo[2] - 1] ?? undefined;

              if (normal)
                norms.push(normal.x, normal.y, normal.z);

              let keyPosNorm: string = `${vertexInfo[0]}/${vertexInfo[2]}`;
              vertices.push(new Vertex(mapPositionNormalToIndex[keyPosNorm] ?? position, uv, normal));
              mapPositionUVNormalToIndex[key] = index;
              if (mapPositionNormalToIndex[keyPosNorm] == undefined)
                mapPositionNormalToIndex[keyPosNorm] = index;
            }
            indices.push(index);
          }
          try {
            faces.push(new Face(vertices, indices[indices.length - 2] , indices[indices.length - 1], indices[indices.length - 3]));
          } catch (_e: unknown) {
            Debug.fudge("Face excluded", (<Error>_e).message);
          }
          break;
      }
    }
    _mesh.vertices = vertices;
    _mesh.faces = faces;
    if (norms.length > 0) // TODO: rendermesh should be able to handle undefined normals correctly, i.e. calculate them only if they are not present in the vertices
      _mesh.renderMesh.normals = new Float32Array(norms);
    // _mesh.renderMesh.indices = new Uint16Array(indices); // doens't seem to affect scene loading time...
  }
}