namespace FudgeCore {

  export class MeshNail extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshNail);

    private shaftLength: number = 0;

    
    public constructor(_name: string = "MeshNail", _shaftLength: number= 0) {
      super(_name); 
      this.create(_shaftLength);
      
    }
       
    public create(_shaftLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
          new Vertex(new Vector3(-0.029675, 0.952079 + (this.shaftLength/2), 0.029675), new Vector2(0.019988, 0.098473)),
          new Vertex(new Vector3(-0.029675, 0.952079 + (this.shaftLength/2), -0.029675), new Vector2(0.109933, 0.098473)),
          new Vertex(new Vector3(0.029675, 0.952079 + (this.shaftLength/2), 0.029675), new Vector2(0.064960, 0.098473)),
          new Vertex(new Vector3(0.029675, 0.952079 + (this.shaftLength/2), -0.029675), new Vector2(0.154906, 0.098473)),
          new Vertex(new Vector3(0.000000, 0.952079 + (this.shaftLength/2), -0.044512), new Vector2(0.134918, 0.098473)),
          new Vertex(new Vector3(0.000000, 0.952079 + (this.shaftLength/2), 0.044512), new Vector2(0.134918, 0.096966)),
          new Vertex(new Vector3(-0.044512, 0.952079 + (this.shaftLength/2), -0.000000), new Vector2(0.000000, 0.096966)),
          new Vertex(new Vector3(0.044512, 0.952079 + (this.shaftLength/2), -0.000000), new Vector2(0.089945, 0.098473)),
          new Vertex(new Vector3(-0.029675, -0.275171, 0.029675), new Vector2(0.089945, 0.096966)),
          new Vertex(new Vector3(-0.029675, -0.275171, -0.029675), new Vector2(0.044973, 0.098473)),
          new Vertex(new Vector3(0.029675, -0.275171, 0.029675), new Vector2(0.044973, 0.096966)),
          new Vertex(new Vector3(0.029675, -0.275171, -0.029675), new Vector2(0.179891, 0.098473)),
          new Vertex(new Vector3(0.000000, -0.275171, -0.044512), new Vector2(0.243339, 0.083436)),
          new Vertex(new Vector3(0.000000, -0.275171, 0.044512), new Vector2(0.203363, 0.063448)),
          new Vertex(new Vector3(-0.044512, -0.275171, -0.000000), new Vector2(0.263327, 0.043460)),
          new Vertex(new Vector3(0.044512, -0.275171, -0.000000), new Vector2(0.223351, 0.023473)),
          new Vertex(new Vector3(0.000000, -0.275171, -0.000000), new Vector2(0.203363, 0.038463)),
          new Vertex(new Vector3(-0.029675, -0.251138, -0.029675), new Vector2(0.263327, 0.068445)),
          new Vertex(new Vector3(0.000000, -0.251138, -0.044512), new Vector2(0.218354, 0.083436)),
          new Vertex(new Vector3(0.029675, -0.251138, 0.029675), new Vector2(0.248336, 0.023472)),
          new Vertex(new Vector3(0.000000, -0.251138, 0.044512), new Vector2(0.233345, 0.053454)),
          new Vertex(new Vector3(0.044512, -0.251138, -0.000000), new Vector2(0.223351, 0.130381)),
          new Vertex(new Vector3(-0.044512, -0.251138, -0.000000), new Vector2(0.109933, 1.000000)),
          new Vertex(new Vector3(-0.029675, -0.251138, 0.029675), new Vector2(0.134918, 0.998493)),
          new Vertex(new Vector3(0.029675, -0.251138, -0.029675), new Vector2(0.134918, 1.000000)),
          new Vertex(new Vector3(0.000000, -0.251138, -0.079360), new Vector2(0.203363, 0.145372)),
          new Vertex(new Vector3(0.000000, -0.275171, -0.079360), new Vector2(0.064960, 1.000000)),
          new Vertex(new Vector3(0.000000, -0.251138, 0.079360), new Vector2(0.243339, 0.190344)),
          new Vertex(new Vector3(0.000000, -0.275171, 0.079360), new Vector2(0.263327, 0.175354)),
          new Vertex(new Vector3(-0.079360, -0.275171, 0.000000), new Vector2(0.000000, 0.998493)),
          new Vertex(new Vector3(-0.052907, -0.275171, 0.052907), new Vector2(0.089945, 1.000000)),
          new Vertex(new Vector3(-0.052907, -0.275171, -0.052907), new Vector2(0.179891, 1.000000)),
          new Vertex(new Vector3(0.079360, -0.275171, 0.000000), new Vector2(0.044973, 0.998493)),
          new Vertex(new Vector3(0.052907, -0.275171, -0.052907), new Vector2(0.218354, 0.190344)),
          new Vertex(new Vector3(0.052907, -0.275171, 0.052907), new Vector2(0.089945, 0.998493)),
          new Vertex(new Vector3(-0.079360, -0.251138, 0.000000), new Vector2(0.044973, 1.000000)),
          new Vertex(new Vector3(-0.052907, -0.251138, -0.052907), new Vector2(0.248336, 0.130381)),
          new Vertex(new Vector3(0.052907, -0.251138, 0.052907), new Vector2(0.019988, 1.000000)),
          new Vertex(new Vector3(0.079360, -0.251138, 0.000000), new Vector2(0.263327, 0.150369)),
          new Vertex(new Vector3(-0.052907, -0.251138, 0.052907), new Vector2(0.154906, 1.000000)),
          new Vertex(new Vector3(0.052907, -0.251138, -0.052907), new Vector2(0.203363, 0.170357)),
          new Vertex(new Vector3(0.000000, 1.079486 + (this.shaftLength/2), -0.000000), new Vector2(0.199378, 0.294043))
        
      );
        this.faces = [
          new Face(this.vertices, 18, 36, 17),
          new Face(this.vertices, 20, 37, 19),
          new Face(this.vertices, 13, 30, 8),
          new Face(this.vertices, 22, 36, 35),
          new Face(this.vertices, 16, 10, 13),
          new Face(this.vertices, 16, 8, 14),
          new Face(this.vertices, 9, 16, 14),
          new Face(this.vertices, 11, 16, 12),
          new Face(this.vertices, 12, 33, 11),
          new Face(this.vertices, 21, 40, 24),
          new Face(this.vertices, 13, 34, 28),
          new Face(this.vertices, 20, 39, 27),
          new Face(this.vertices, 3, 18, 4),
          new Face(this.vertices, 0, 20, 5),
          new Face(this.vertices, 7, 24, 3),
          new Face(this.vertices, 1, 22, 6),
          new Face(this.vertices, 5, 19, 2),
          new Face(this.vertices, 4, 17, 1),
          new Face(this.vertices, 2, 21, 7),
          new Face(this.vertices, 6, 23, 0),
          new Face(this.vertices, 35, 30, 39),
          new Face(this.vertices, 37, 32, 38),
          new Face(this.vertices, 25, 31, 36),
          new Face(this.vertices, 27, 34, 37),
          new Face(this.vertices, 36, 29, 35),
          new Face(this.vertices, 38, 33, 40),
          new Face(this.vertices, 39, 28, 27),
          new Face(this.vertices, 40, 26, 25),
          new Face(this.vertices, 14, 31, 9),
          new Face(this.vertices, 14, 30, 29),
          new Face(this.vertices, 21, 37, 38),
          new Face(this.vertices, 15, 34, 10),
          new Face(this.vertices, 12, 31, 26),
          new Face(this.vertices, 22, 39, 23),
          new Face(this.vertices, 18, 40, 25),
          new Face(this.vertices, 15, 33, 32),
          new Face(this.vertices, 1, 6, 41),
          new Face(this.vertices, 0, 5, 41),
          new Face(this.vertices, 5, 2, 41),
          new Face(this.vertices, 4, 1, 41),
          new Face(this.vertices, 2, 7, 41),
          new Face(this.vertices, 3, 4, 41),
          new Face(this.vertices, 7, 3, 41),
          new Face(this.vertices, 6, 0, 41),
          new Face(this.vertices, 18, 25, 36),
          new Face(this.vertices, 20, 27, 37),
          new Face(this.vertices, 13, 28, 30),
          new Face(this.vertices, 22, 17, 36),
          new Face(this.vertices, 16, 15, 10),
          new Face(this.vertices, 16, 13, 8),
          new Face(this.vertices, 9, 12, 16),
          new Face(this.vertices, 11, 15, 16),
          new Face(this.vertices, 12, 26, 33),
          new Face(this.vertices, 21, 38, 40),
          new Face(this.vertices, 13, 10, 34),
          new Face(this.vertices, 20, 23, 39),
          new Face(this.vertices, 3, 24, 18),
          new Face(this.vertices, 0, 23, 20),
          new Face(this.vertices, 7, 21, 24),
          new Face(this.vertices, 1, 17, 22),
          new Face(this.vertices, 5, 20, 19),
          new Face(this.vertices, 4, 18, 17),
          new Face(this.vertices, 2, 19, 21),
          new Face(this.vertices, 6, 22, 23),
          new Face(this.vertices, 35, 29, 30),
          new Face(this.vertices, 37, 34, 32),
          new Face(this.vertices, 25, 26, 31),
          new Face(this.vertices, 27, 28, 34),
          new Face(this.vertices, 36, 31, 29),
          new Face(this.vertices, 38, 32, 33),
          new Face(this.vertices, 39, 30, 28),
          new Face(this.vertices, 40, 33, 26),
          new Face(this.vertices, 14, 29, 31),
          new Face(this.vertices, 14, 8, 30),
          new Face(this.vertices, 21, 19, 37),
          new Face(this.vertices, 15, 32, 34),
          new Face(this.vertices, 12, 9, 31),
          new Face(this.vertices, 22, 35, 39),
          new Face(this.vertices, 18, 24, 40),
          new Face(this.vertices, 15, 11, 33)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.shaftLength = this.shaftLength;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.shaftLength = _serialization.shaftLength;
      this.create(this.shaftLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.shaftLength);
    }
    
  }
}