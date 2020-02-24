
namespace FudgeCore {

    //Refactor to separate file eventually
    export function calculateFaceNormals(_mesh: Mesh): Float32Array {
        let normals: number[] = [];
        let vertices: Vector3[] = [];

        for (let v: number = 0; v < _mesh.vertices.length; v += 3)
            vertices.push(new Vector3(_mesh.vertices[v], _mesh.vertices[v + 1], _mesh.vertices[v + 2]));


        for (let i: number = 0; i < _mesh.indices.length; i += 3) {
                let vertex: number[] = [_mesh.indices[i], _mesh.indices[i + 1], _mesh.indices[i + 2]];
                
                let v0: Vector3 = Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[1]]);
                let v1: Vector3 = Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[2]]);
                let normal: Vector3 = Vector3.NORMALIZATION(Vector3.CROSS(v0, v1));
                let index: number = vertex[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
            }
        return new Float32Array(normals);
    }
}