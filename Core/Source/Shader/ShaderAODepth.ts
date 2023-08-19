namespace FudgeCore {
    export abstract class ShaderAODepth extends Shader {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderAODepth);

        public static define: string[] = [];

        public static getCoat(): typeof Coat { return CoatColored; }

        public static getVertexShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAODepth.vert"], this.define);
        }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAODepth.frag"], this.define);
        }
    }
}