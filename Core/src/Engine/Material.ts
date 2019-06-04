namespace Fudge {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Material {
        public name: string; // The name to call the Material by.
        private shaderType: typeof Shader; // The shader program used by this BaseMaterial
        private coat: Coat;

        public constructor(_name: string, _shader?: typeof Shader, _coat?: Coat) {
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
        }

        public createCoatMatchingShader(): Coat {
            let coat: Coat = new (this.shaderType.getCoat())();
            return coat;
        }

        public setCoat(_coat: Coat): void {
            if (_coat.constructor != this.shaderType.getCoat())
                throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }

        public getCoat(): Coat {
            return this.coat;
        }

        public setShader(_shaderType: typeof Shader): void {
            this.shaderType = _shaderType;
            let coat: Coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
        }

        public getShader(): typeof Shader {
            return this.shaderType;
        }
    }
}