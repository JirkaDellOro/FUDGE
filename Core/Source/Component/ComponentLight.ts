///<reference path="../Light/Light.ts"/>
namespace FudgeCore {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */

    /**
     * Defines identifiers for the various types of light this component can provide.  
     */
    export enum LIGHT_TYPE {
        AMBIENT = "ambient",
        DIRECTIONAL = "directional",
        POINT = "point",
        SPOT = "spot"
    }

    export class ComponentLight extends Component {
        private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
        public pivot: Matrix4x4 = Matrix4x4.IDENTITY;
        private light: Light = null;
        private lightType: LIGHT_TYPE;

        constructor(_type: LIGHT_TYPE = LIGHT_TYPE.AMBIENT, _color: Color = new Color(1, 1, 1, 1)) {
            super();
            this.singleton = false;
            this.setType(_type);
            this.light.color = _color;
        }

        public getLight(): Light {
            return this.light;
        }

        public getType(): LIGHT_TYPE {
            return this.lightType;
        }

        public setType(_type: LIGHT_TYPE): void {
            let mtrOld: Mutator = {};
            if (this.light)
                mtrOld = this.light.getMutator();

            this.light = new ComponentLight.constructors[_type]();
            this.light.mutate(mtrOld);
            this.lightType = _type;
        }
    }
}
