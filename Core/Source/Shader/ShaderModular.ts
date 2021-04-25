namespace FudgeCore {
    @RenderInjectorShader.decorate
    export class ShaderModular extends Shader {

        public vertexShaderSource: string;
        public fragmentShaderSource: string;

        constructor(_vertexShaderSource: string, _fragmentShaderSource: string) {
            super();
            this.vertexShaderSource = _vertexShaderSource;
            this.fragmentShaderSource = _fragmentShaderSource;
        }

        public getVertexShaderSource(): string {
            return this.vertexShaderSource;
        }

        public getFragmentShaderSource(): string {
            return this.fragmentShaderSource;
        }

        public getCoat(): typeof Coat {
            return CoatColored;
        }
    }
}