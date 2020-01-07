namespace FudgeCore {

    export enum MeshFormat {
        OBJ,
        GLTF,
    }

    /** Returns a Mesh from given string (human readable file formats) */
    export function importMesh(meshformat: MeshFormat, _data: string): Mesh {
        let mesh: Mesh = new MeshPoly();

        let vertStrings: string[] = [];
        let normalStrings: string[] = [];
        let texUVStrings: string[] = [];
        let indiceStrings: string[] = [];

        //Parse datastring depending on Meshformat
        switch (meshformat) {
            case MeshFormat.OBJ:
                parseWavefrontOBJ();
                break;
            case MeshFormat.GLTF:
                parseGLTF();
            default:
                throw new Error("Mesh Format unknown");
        }

        //Create Arrays
        mesh.vertices = new Float32Array(vertStrings.length);
        mesh.indices = new Uint16Array(indiceStrings.length);
        mesh.normalsFace = new Float32Array(normalStrings.length);

        //Convert stringarrays into usable formats

        for (let i = 0; i < vertStrings.length; i++) mesh.vertices[i] = +vertStrings[i];

        //Take first element of each part (vertex/texcoord/normal - we want vertex -> [0] here)
        for (let i = 0; i < indiceStrings.length; i++) mesh.indices[i] = +indiceStrings[i].split("/")[0] - 1;

        let len: number = indiceStrings.length;
        for (let i = -1; i < len; i++) mesh.normalsFace[i] = +normalStrings[i];

        return mesh;

        /** parse Wavefront OBJ */
        function parseWavefrontOBJ() {

            //TODO: Exception handling!

            const lines: string[] = _data.split("\n");
            mesh = new MeshCube();
            for (let line of lines) {
                line = line.trim();

                //ignore comments and empty lines
                if (!line || line.startsWith("#")) continue;

                //split line into parts
                const parts = line.split(" ");
                parts.shift();

                //Vertex - example: v 0.70 -0.45 -0.52
                if (!line || line.startsWith("v ")) vertStrings.push(...parts)

                //Normal - example: vn 0.30 -0.18 -0.92
                else if (!line || line.startsWith("vn ")) normalStrings.push(...parts)

                //Texcoord - example: vt 0.545454 0.472382
                else if (!line || line.startsWith("vt ")) texUVStrings.push(...parts)

                /*Face Indices - example: f 1/1/1 2/2/1 3/3/1 -->
                vertex1/texcoord1/normal1 vertex2/texcoord2/normal2 vertex3/texcoord3/normal3*/
                else if (!line || line.startsWith("f ")) indiceStrings.push(...parts)
            }
        }

        /** parse GLTF */
        function parseGLTF() {
            //TODO
            throw new Error("GLTF Import not yet implemented");
        }

    }


}