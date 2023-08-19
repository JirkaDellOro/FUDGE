namespace FudgeCore {
    export abstract class ShaderAONormal extends Shader {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderAONormal);

        public static define: string[] = [];

        public static getCoat(): typeof Coat { return CoatColored; }

        public static getVertexShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAONormal.vert"], this.define);
        }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAONormal.frag"], this.define);
        }
    }
}