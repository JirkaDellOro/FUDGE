///<reference path="MeshExtrusion.ts"/>
namespace FudgeCore {
  /**
   * Generates a prism which is a simple extrusion of a polygon
   * ```plaintext
   *             _______ 
   * Polygon  → ╱ ╲_____╲ ← Polygon
   *            ╲_╱_____╱
   *            Z-Length = 1
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshPrism extends MeshExtrusion {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshPrism);

    public constructor(_name: string = "MeshPrism", _vertices: Vector2[] = MeshPolygon.verticesDefault, _fitMesh: boolean = true, _fitTexture: boolean = true) {
      super(_name, _vertices, MeshExtrusion.transformsDefault, _fitMesh, _fitTexture);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      delete serialization.transforms;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      delete _serialization.transforms;
      await super.deserialize(_serialization);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.transforms;
    }
    //#endregion
  }
}