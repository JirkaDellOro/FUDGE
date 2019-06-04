/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderExtensions.ts"/>
namespace Fudge {
    interface ShaderParameters {
        [key: string]: number | Color;
    }

    export class Coat extends Mutable {
        public name: string = "Coat";
        public params: ShaderParameters = {};
        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }

        public setRenderData(_shaderInfo: ShaderInfo): void {/**/ }
        reduceMutator(): void { /**/ }
    }


    @decorateCoatWithRenderExtension
    export class CoatColored extends Coat {
        public params: ShaderParameters = {
            color: new Color(0.5, 0.5, 0.5, 1)
        };
        
        reduceMutator(): void { /**/ }
    }
}