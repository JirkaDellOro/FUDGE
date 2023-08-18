namespace FudgeCore {
    export abstract class ShaderUpsample extends Shader {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderUpsample);

        public static define: string[] = [];

        public static getCoat(): typeof Coat { return CoatWebGlTextured; }

        public static getVertexShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderUpsample.vert"], this.define);
        }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderUpsample.frag"], this.define);
        }
    }
}