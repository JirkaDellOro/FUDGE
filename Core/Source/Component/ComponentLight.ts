// /<reference path="../Light/Light.ts"/>
namespace FudgeCore {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */

    /**
     * Defines identifiers for the various types of light this component can provide.  
     */
    // export enum LIGHT_TYPE {
    //     AMBIENT = "ambient",
    //     DIRECTIONAL = "directional",
    //     POINT = "point",
    //     SPOT = "spot"
    // }

    export class ComponentLight extends Component {
      public static readonly iSubclass: number = Component.registerSubclass(ComponentLight);
        // private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
        public pivot: Matrix4x4 = Matrix4x4.IDENTITY();
        public light: Light = null;

        constructor(_light: Light = new LightAmbient()) {
            super();
            this.singleton = false;
            this.light = _light;
        }

        public setType<T extends Light>(_class: new () => T): void {
            let mtrOld: Mutator = {};
            if (this.light)
                mtrOld = this.light.getMutator();

            this.light = new _class();
            this.light.mutate(mtrOld);
        }

        public serialize(): Serialization {
          let serialization: Serialization = {
            pivot: this.pivot.serialize(),
            light: Serializer.serialize(this.light)
          };
          return serialization;
        }
    
        public async deserialize(_serialization: Serialization): Promise<Serializable> {
          this.pivot.deserialize(_serialization.pivot);
          this.light = await <Promise<Light>>Serializer.deserialize(_serialization.light);
          return this;
        }
    
    }
}
