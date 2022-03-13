namespace FudgeCore {
  export enum PICK {
    RADIUS = "radius",
    CAMERA = "camera",
    PHYSICS = "physics"
  }


  /**
   * Base class for scripts the user writes
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentPick extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentPick);
    public pick: PICK = PICK.RADIUS;

    public pickAndDispatch(_ray: Ray, _event: PointerEvent): void {
      let cmpMesh: ComponentMesh = this.node.getComponent(ComponentMesh);
      let position: Vector3 = cmpMesh ? cmpMesh.mtxWorld.translation : this.node.mtxWorld.translation;

      switch (this.pick) {
        case PICK.RADIUS:
          // TODO: should only be node.radius. Adjustment needed, if mesh was transformed...
          if (_ray.getDistance(position).magnitude < this.node.radius) {
            this.node.dispatchEvent(_event);
          }
          break;
        case PICK.PHYSICS:
          let hitInfo: RayHitInfo = Physics.raycast(_ray.origin, _ray.direction, Vector3.DIFFERENCE(position, _ray.origin).magnitudeSquared);
          if (hitInfo.hit)
            this.node.dispatchEvent(_event);
          break;
      }
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.pick)
        types.pick = PICK;
      return types;
    }
  }
}