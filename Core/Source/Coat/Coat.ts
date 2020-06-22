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

        public useRenderData(_shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {/* injected by RenderInjector*/ }
        
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
    @RenderInjectorCoat.decorate
    export class CoatColored extends Coat {
        public color: Color;

        constructor(_color?: Color) {
            super();
            this.color = _color || new Color(0.5, 0.5, 0.5, 1);
        }
    }

    /**
     * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral). Set shadeSmooth to 1 for smooth shading.
     */
    @RenderInjectorCoat.decorate
    export class CoatMatCap extends Coat {
        public texture: TextureImage = null;
        public color: Color = new Color(0.5, 0.5, 0.5, 1);
        public shadeSmooth: number;

        constructor(_texture?: TextureImage, _color?: Color, _shadeSmooth?: number) {
            super();
            this.texture = _texture || new TextureImage();
            this.color = _color || new Color(0.5, 0.5, 0.5, 1);
            this.shadeSmooth = _shadeSmooth || 0;
        }
    }
}