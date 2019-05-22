namespace Fudge {
    interface ShaderParameters {
        [key: string]: number | Color;
    }

    abstract class Coat extends Mutable {
        public name: string = "Coat";
        public params: ShaderParameters = {};
    }
    export class CoatColored extends Coat {
        public params: ShaderParameters = {
            color: new Color(0.5, 0.5, 0.5, 1)
        };

        reduceMutator(): void { /**/ }
    }


}