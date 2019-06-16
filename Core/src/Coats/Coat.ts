/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
namespace Fudge {
    // interface ShaderParameters {
    //     [key: string]: number | Color;
    // }

    export class Coat extends Mutable {
        public name: string = "Coat";
        protected renderData: {[key: string]: unknown};

        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }

        public useRenderData(_renderShader: RenderShader): void {/* injected by RenderExtender*/ }
        protected reduceMutator(): void { /**/ }
    }


    @RenderInjector.decorateCoat
    export class CoatColored extends Coat {
        public color: Color;

        constructor(_color?: Color) {
            super();
            this.color = _color || new Color(0.5, 0.5, 0.5, 1);
        }
    }

    @RenderInjector.decorateCoat
    export class CoatTextured extends Coat {
        public texture: TextureImage = null;
        // just ideas so far
        public tilingX: number;
        public tilingY: number;
        public repetition: boolean;
    }
}