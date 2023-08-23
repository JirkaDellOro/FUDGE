namespace FudgeCore {
    export abstract class ShaderAONormalFlat extends Shader {
        public static readonly iSubclass: number = Shader.registerSubclass(ShaderAONormalFlat);

        public static define: string[] = ["FLAT"];   
        
        public static getCoat(): typeof Coat { return CoatColored; }

        public static getVertexShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAONormal.vert"], this.define);
        }

        public static getFragmentShaderSource(): string {
            return this.insertDefines(shaderSources["ShaderAONormal.frag"], this.define);
        }
    }
}