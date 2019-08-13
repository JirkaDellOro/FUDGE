namespace TestLib {
    export abstract class Material {
        protected renderData: Object;
        public abstract useRenderData(_gl: WebGL2RenderingContext, _shaderInfo: TestLib.ShaderInfo): void;
    }

    export class MaterialColor extends Material {
        public color: Float32Array;
        constructor(_r: number, _g: number, _b: number, _a: number) {
            super();
            this.color = new Float32Array([_r, _g, _b, _a]);
        }

        public useRenderData(_gl: WebGL2RenderingContext, _shaderInfo: ShaderInfo): void {
            let uLoc: WebGLUniformLocation = _shaderInfo.uniforms["uColor"];
            _gl.uniform4fv(uLoc, this.color);
        }
    }

    export class MaterialTexture extends Material {
        public image: HTMLImageElement;
        constructor(_img: HTMLImageElement) {
            super();
            this.image = _img;
        }

        public useRenderData(_gl: WebGL2RenderingContext, _shaderInfo: ShaderInfo): void {
            if (this.renderData) {
                // buffers exist
                _gl.activeTexture(WebGL2RenderingContext.TEXTURE0);
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture"]);
                _gl.uniform1i(_shaderInfo.uniforms["uSampler"], 0);
            }
            else {
                this.renderData = {};

                const texture: WebGLTexture = _gl.createTexture();
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                _gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.image);
                _gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                _gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                _gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

                this.renderData["texture"] = texture;
                this.useRenderData(_gl, _shaderInfo);
            }
        }
    }
}