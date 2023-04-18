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
  function parseObj(data: string, _mesh: MeshImport): void {
    const lines: string[] = data.split("\n");

    let positions: Vector3[] = [];
    let uvs: Vector2[] = [];
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

      //Texcoord - example: vt 0.545454 0.472382
      else if (line.startsWith("vt "))
        uvs.push(new Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));

      /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
      vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
      else if (line.startsWith("f "))
        for (let i: number = 0; i < 3; i++) {
          faceInfo.push({
            iPosition: +parts[i].split("/")[0] - 1,
            iUV: +parts[i].split("/")[1] - 1,
            iNormal: +parts[i].split("/")[2] - 1
          });
        }

      _mesh.vertices = new Vertices(...positions.map((_p: Vector3) => new Vertex(_p)));
      for (let i: number = 0; i < faceInfo.length; i += 3) {
        let indices: number[] = [];
        for (let v: number = 0; v < 3; v++) {
          let info: FaceInfo = faceInfo[i + v];
          let index: number = info.iPosition;
          if (_mesh.vertices[index].uv) {
            index = _mesh.vertices.length;
            _mesh.vertices.push(new Vertex(info.iPosition));
          }
          _mesh.vertices[index].uv = uvs[info.iUV];
          indices.push(index);
        }
        _mesh.faces.push(new Face(_mesh.vertices, indices[0], indices[1], indices[2]));
      }
    }
  }

  interface FaceInfo {
    iPosition: number;
    iUV: number;
    iNormal: number;
  }
}