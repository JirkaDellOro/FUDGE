namespace TestLib {
    export let square: Mesh = {
        vertices: [
            -0.9, 0.9, 0,
            -0.9, 0.1, 0,
            -0.1, 0.1, 0,
            -0.1, 0.9, 0
        ],
        indices: [0, 1, 2, 0, 2, 3],
        getTextureUVs: function (): number[] { return calcTextureUVs(this); }
    };
    export let triangle: Mesh = {
        vertices: [
            0.1, 0.1, 0,
            0.5, 0.9, 0,
            0.9, 0.1, 0
        ],
        indices: [0, 1, 2],
        getTextureUVs: function (): number[] { return calcTextureUVs(this); }
    };
    export let penta: Mesh = {
        vertices: [
            -0.5, -0.1, 0,
            -0.9, -0.45, 0,
            -0.7, -0.9, 0,
            -0.3, -0.9, 0,
            -0.1, -0.45, 0
        ],
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4],
        getTextureUVs: function (): number[] { return calcTextureUVs(this); }
    };
    export let hexa: Mesh = {
        vertices: [
            0.7, -0.1, 0,
            0.3, -0.1, 0,
            0.1, -0.5, 0,
            0.3, -0.9, 0,
            0.7, -0.9, 0,
            0.9, -0.5, 0
        ],
        indices: [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5],
        getTextureUVs: function (): number[] { return calcTextureUVs(this); }
    };

    export function calcTextureUVs(_mesh: Mesh): number[] {
        console.log(_mesh);
        let result: number[] = [];
        for (let i: number = 0; i < _mesh.vertices.length; i += 3) {
            result.push((_mesh.vertices[i] + 1) % 1);
            result.push((_mesh.vertices[i + 1] + 1) % 1);
        }
        return result;
    }
}