namespace FudgeCore {
  /**
   * Simple Wavefront OBJ import. Takes a wavefront obj string. To Load from a file url, use the
   * static LOAD Method. Currently only works with triangulated Meshes
   * (activate 'Geomentry → Triangulate Faces' in Blenders obj exporter)
   * @todo UVs, Load Materials, Support Quads
   * @authors Simon Storl-Schulke 2021 | Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021-2022 | Matthias Roming, HFU, 2023
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

    let positions: Vector3[] = [];
    let uvs: Vector2[] = [];
    let normals: Vector3[] = [];
    let faceInfo: FaceInfo[] = [];

    for (let line of lines) {
      line = line.trim();

      if (!line || line.startsWith("#"))
        continue;

      const parts: string[] = line.split(" ");
      parts.shift();

      //Vertex - example: v 0.70 -0.45 -0.52
      if (line.startsWith("v "))
        positions.push(new Vector3(...parts.map(_value => +_value)));

      //Normal - example: vn 0.00 0.00 1.00
      if (line.startsWith("vn "))
        normals.push(new Vector3(...parts.map(_value => +_value)));

      //Texcoord - example: vt 0.545454 0.472382
      else if (line.startsWith("vt "))
        uvs.push(new Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));

      /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
      vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
      else if (line.startsWith("f "))
        for (let i: number = 0; i < 3; i++) {
          const indices: string[] = parts[i].split("/");
          faceInfo.push({
            iPosition: +indices[0] - 1,
            iUV: +indices[1] - 1,
            iNormal: +indices[2] - 1
          });
        }
    }

    _mesh.vertices = new Vertices();
    for (let i: number = 0; i < faceInfo.length; i += 3) {
      let indices: number[] = [];
      for (let v: number = 0; v < 3; v++) {
        let info: FaceInfo = faceInfo[i + v];
        // A lot of vertices with duplicate positions are (probably) created here,
        // since in obj files the face defines the connectivity of the vertices, UV coordinates, and normals (see above).
        // However, in Fudge, each vertex has its own UV coordinates and normals directley associated with it.
        _mesh.vertices.push(new Vertex(positions[info.iPosition], uvs[info.iUV], normals[info.iNormal]));
        indices.push(_mesh.vertices.length - 1);
      }
      try {
        _mesh.faces.push(new Face(_mesh.vertices, indices[0], indices[1], indices[2]));
      } catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
    }
  }

  interface FaceInfo {
    iPosition: number;
    iUV: number;
    iNormal: number;
  }
}