/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
namespace FudgeCore {
    /**
     * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].  
     * [[Material]]s reference [[Coat]] and [[Shader]].   
     * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
     */
    export class Coat extends Mutable implements Serializable {
        public name: string = "Coat";
        protected renderData: {[key: string]: unknown};

        public mutate(_mutator: Mutator): void {
            super.mutate(_mutator);
        }

        public useRenderData(_renderShader: RenderShader): void {/* injected by RenderExtender*/ }
        
        //#region Transfer
        public serialize(): Serialization {
            let serialization: Serialization = this.getMutator(); 
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.mutate(_serialization);
            return this;
        }

        protected reduceMutator(): void { /**/ }
        //#endregion
    }

    /**
     * The simplest [[Coat]] providing just a color
     */
    @RenderInjector.decorateCoat
    export class CoatColored extends Coat {
        public color: Color;

        constructor(_color?: Color) {
            super();
            this.color = _color || new Color(0.5, 0.5, 0.5, 1);
        }
    }

    /**
     * A [[Coat]] providing a texture and additional data for texturing
     */
    @RenderInjector.decorateCoat
    export class CoatTextured extends Coat {
        public texture: TextureImage = null;
        // just ideas so far
        public tilingX: number;
        public tilingY: number;
        public repetition: boolean;
    }
}