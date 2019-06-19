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
        material: TestLib.Material;
        renderMesh?: RenderMesh;
    }

    export interface RenderMesh {
        vertices: WebGLBuffer;
        indices: WebGLBuffer;
        nIndices: number;
        textureUVs: WebGLBuffer;
    }
}