///<reference path="../Light/Light.ts"/>
namespace FudgeCore {

  /**
   * Defines identifiers for the various types of light this component can provide.  
   */
  // export let LIGHT_TYPE: { [type: string]: string } = {
  export enum LIGHT_TYPE {
    AMBIENT = "LightAmbient",
    DIRECTIONAL = "LightDirectional",
    POINT = "LightPoint",
    SPOT = "LightSpot"
  }
  /**
    * Attaches a {@link Light} to the node
    * The pivot matrix has different effects depending on the type of the {@link Light}. See there for details.
    * @authors Jirka Dell'Oro-Friedl, HFU, 2019
    */
  export class ComponentLight extends Component implements Gizmo {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentLight);

    // private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();
    public light: Light = null;
    //TODO: since there is almost no functionality left in Light, eliminate it and put all in the component as with the camera...

    public constructor(_light: Light = new LightAmbient()) {
      super();
      this.singleton = false;
      this.light = _light;
    }

    // TODO: use TypeOfLight as return type?
    /**
     * Set the type of {@link Light} used by this component.
     */
    public setType<T extends Light>(_class: new () => T): void {
      let mtrOld: Mutator = {};
      if (this.light)
        mtrOld = this.light.getMutator();

      this.light = new _class();
      this.light.mutate(mtrOld);
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        pivot: this.mtxPivot.serialize(),
        light: Serializer.serialize(this.light)
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      await this.mtxPivot.deserialize(_serialization.pivot);
      this.light = await <Promise<Light>>Serializer.deserialize(_serialization.light);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.type = this.light.getType().name;
      return mutator;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.type)
        types.type = LIGHT_TYPE;
      return types;
    }

    public async mutate(_mutator: Mutator, _selection: string[] = null, _dispatchMutate: boolean = true): Promise<void> {
      let type: string = _mutator.type;
      if (typeof (type) !== "undefined" && type != this.light.constructor.name)
        this.setType(Serializer.getConstructor<Light>(type));
      delete (_mutator.type); // exclude light type from further mutation
      super.mutate(_mutator, _selection, _dispatchMutate);
      _mutator.type = type; // reconstruct mutator
    }

    public drawGizmos(): void {
      let mtxShape: Matrix4x4 = Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
      mtxShape.scaling = new Vector3(0.5, 0.5, 0.5);
      Gizmos.drawIcon(TextureDefault.iconLight, mtxShape, this.light.color);
      Recycler.store(mtxShape);
    };

    public drawGizmosSelected(): void {
      let mtxShape: Matrix4x4 = Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
      let color: Color = Color.CSS("yellow");

      switch (this.light.getType()) {
        case LightDirectional:
          const radius: number = 0.5;
          Gizmos.drawWireCircle(mtxShape, color);
          const lines: Vector3[] = new Array(10).fill(null).map(() => Recycler.get(Vector3));
          lines[0].set(0, 0, 0); lines[1].set(0, 0, 1);
          lines[2].set(0, radius, 0); lines[3].set(0, radius, 1);
          lines[6].set(0, -radius, 0); lines[7].set(0, -radius, 1);
          lines[4].set(radius, 0, 0); lines[5].set(radius, 0, 1);
          lines[8].set(-radius, 0, 0); lines[9].set(-radius, 0, 1);
          Gizmos.drawLines(lines, mtxShape, color);
          Recycler.storeMultiple(...lines);
          break;
        case LightPoint:
          mtxShape.scale(new Vector3(2, 2, 2));
          Gizmos.drawWireSphere(mtxShape, color);
          break;
        case LightSpot:
          Gizmos.drawWireCone(mtxShape, color);
          break;
      }

      Recycler.storeMultiple(mtxShape, color);
    }
  }
}