namespace TestColor {
    export abstract class Material {
        public abstract setRenderData(_gl: WebGL2RenderingContext, _shaderInfo: ShaderInfo): void;
    }
    
    export class MaterialColor extends Material {
        public color: Float32Array;
        constructor(_r: number, _g: number, _b: number, _a: number) {
            super();
            this.color = new Float32Array([_r, _g, _b, _a]);
        }

        public setRenderData(_gl: WebGL2RenderingContext, _shaderInfo: ShaderInfo): void {
            let uLoc: WebGLUniformLocation = _shaderInfo.uniforms["uColor"];
            _gl.uniform4fv(uLoc, this.color);
        }
    }
}