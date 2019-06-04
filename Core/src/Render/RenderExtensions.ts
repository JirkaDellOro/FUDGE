///<reference path="../Coat/Coat.ts"/>
namespace Fudge {
    type CoatExtension = (this: Coat, _shaderInfo: ShaderInfo) => void;
    let coatExtensions: { [className: string]: CoatExtension } = {
        "CoatColored": extendCoatColored
    };

    export function decorateCoatWithRenderExtension(_constructor: Function): void {
        let coatExtension: CoatExtension = coatExtensions[_constructor.name];
        if (!coatExtension) {
            Debug.error("No extension decorator defined for " + _constructor.name);
        }
        Object.defineProperty(_constructor.prototype, "setRenderData", {
            value: coatExtension
        });
    }

    function extendCoatColored(this: Coat, _shaderInfo: ShaderInfo): void {
        let colorUniformLocation: WebGLUniformLocation = _shaderInfo.uniforms["u_color"];
        let c: Color = <Color>this.params.color;
        let color: Float32Array = new Float32Array([c.r, c.g, c.b, c.a]);
        RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
    }
}