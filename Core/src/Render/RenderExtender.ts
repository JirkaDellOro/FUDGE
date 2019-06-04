///<reference path="../Coat/Coat.ts"/>
namespace Fudge {
    type CoatExtension = (this: Coat, _shaderInfo: ShaderInfo) => void;
    export class RenderExtender {
        private static coatExtensions: { [className: string]: CoatExtension } = {
            "CoatColored": RenderExtender.extendCoatColored
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
            let c: Color = <Color>this.params.color;
            let color: Float32Array = new Float32Array([c.r, c.g, c.b, c.a]);
            RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }
    }
}