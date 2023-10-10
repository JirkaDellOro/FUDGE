namespace FudgeCore {
    export abstract class ShaderBloom extends Shader {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderBloom);

        public static define: string[] = [];

        public static getCoat(): typeof Coat { return CoatColored; }

        public static getVertexShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderBloom.vert"], this.define);
        }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderBloom.frag"], this.define);
        }
    }
}