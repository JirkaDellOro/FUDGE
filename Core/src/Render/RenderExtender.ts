///<reference path="../Coat/Coat.ts"/>
namespace Fudge {
    type CoatExtension = (this: Coat, _shaderInfo: ShaderInfo) => void;
    export class RenderExtender {
        private static coatExtensions: { [className: string]: CoatExtension } = {
            "CoatColored": RenderExtender.extendCoatColored,
            "CoatTextured": RenderExtender.extendCoatTextured
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

        private static extendCoatColored(this: Coat, _shaderInfo: ShaderInfo): void {
            let colorUniformLocation: WebGLUniformLocation = _shaderInfo.uniforms["u_color"];
            let { r, g, b, a } = (<CoatColored>this).color;
            let color: Float32Array = new Float32Array([r, g, b, a]);
            RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }

        private static extendCoatTextured(this: Coat, _shaderInfo: ShaderInfo): void {
            let textureBufferSpecification = { size: 2, dataType: WebGLRenderingContext.FLOAT, normalize: true, stride: 0, offset: 0 };
            let textureCoordinateAtributeLocation = RenderManager.assert<number>(_shaderInfo.attributes["a_textureCoordinate"]);
        }
    }
}