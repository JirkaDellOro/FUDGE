///<reference path="../Coat/Coat.ts"/>
namespace Fudge {
    type CoatExtension = (this: Coat, _shaderInfo: ShaderInfo) => void;
    export class RenderExtender {
        private static coatExtensions: { [className: string]: CoatExtension } = {
            "CoatColored": RenderExtender.setRenderDataForCoatColored,
            "CoatTextured": RenderExtender.setRenderDataForCoatTextured
        };

        public static decorateCoat(_constructor: Function): void {
            let coatExtension: CoatExtension = RenderExtender.coatExtensions[_constructor.name];
            if (!coatExtension) {
                Debug.error("No extension decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "setRenderData", {
                value: coatExtension
            });
        }

        private static setRenderDataForCoatColored(this: Coat, _shaderInfo: ShaderInfo): void {
            let colorUniformLocation: WebGLUniformLocation = _shaderInfo.uniforms["u_color"];
            let { r, g, b, a } = (<CoatColored>this).color;
            let color: Float32Array = new Float32Array([r, g, b, a]);
            RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }

        private static setRenderDataForCoatTextured(this: Coat, _shaderInfo: ShaderInfo): void {
            let crc3: WebGLRenderingContext = RenderOperator.getRenderingContext();
            let textureBufferSpecification: BufferSpecification = { size: 2, dataType: WebGLRenderingContext.FLOAT, normalize: true, stride: 0, offset: 0 };
            let textureCoordinateAttributeLocation: number = RenderManager.assert<number>(_shaderInfo.attributes["a_textureCoordinate"]);
            crc3.enableVertexAttribArray(textureCoordinateAttributeLocation);
            RenderOperator.attributePointer(textureCoordinateAttributeLocation, textureBufferSpecification);
            let texture: WebGLTexture = RenderManager.assert<WebGLTexture>(crc3.createTexture());
            crc3.bindTexture(crc3.TEXTURE_2D, texture);
            try {
                crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, (<CoatTextured>this).texture.image);
            } catch (_e) {
                Debug.error(_e);
            }
            crc3.generateMipmap(crc3.TEXTURE_2D);
            Object.defineProperty(this, "txtBuffer", { value: texture });
        }
    }
}