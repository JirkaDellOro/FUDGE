namespace TestLib {
    export interface ShaderInfo {
        program: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }

    export interface Mesh {
        vertices: number[];
        indices: number[];
        getTextureUVs: () => number[];
    }

    export interface RenderInfo {
        shaderInfo: ShaderInfo;
        vao: WebGLVertexArrayObject;
        nIndices: number;
        material: TestLib.Material;
        textureBuffer?: WebGLBuffer;
    }
}