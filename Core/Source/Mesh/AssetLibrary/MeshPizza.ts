namespace FudgeCore {
  export class MeshPizza extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshPizza);

    private crustHeight: number = 0;
    
    public constructor(_name: string = "MeshPizza", _crustHeight: number= 0) {
      super(_name); 
      this.create(_crustHeight);
      
    }
       
    public create(_crustHeight: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.352333, -0.028443, 0.352333), new Vector2(0.515863, 0.166667)),
        new Vertex(new Vector3(-0.287219, 0.001551, 0.287219), new Vector2(0.000000, 0.833333)),
        new Vertex(new Vector3(-0.352333, -0.028443, -0.352333), new Vector2(0.182068, 0.046203)),
        new Vertex(new Vector3(-0.287219, 0.001551, -0.287219), new Vector2(0.531726, 0.166667)),
        new Vertex(new Vector3(0.352333, -0.028443, 0.352333), new Vector2(0.166667, 0.500000)),
        new Vertex(new Vector3(0.287219, 0.001551, 0.287219), new Vector2(0.046203, 0.317932)),
        new Vertex(new Vector3(0.352333, -0.028443, -0.352333), new Vector2(0.547588, 0.166667)),
        new Vertex(new Vector3(0.287219, 0.001551, -0.287219), new Vector2(0.333333, 1.000000)),
        new Vertex(new Vector3(0.000000, -0.028443, -0.528500), new Vector2(0.453797, 0.182068)),
        new Vertex(new Vector3(0.000000, 0.028703 + this.crustHeight, -0.486925), new Vector2(0.563451, 0.166667)),
        new Vertex(new Vector3(0.000000, -0.028443, 0.528500), new Vector2(0.500000, 0.666667)),
        new Vertex(new Vector3(0.000000, 0.028703 + this.crustHeight, 0.486925), new Vector2(0.317932, 0.453798)),
        new Vertex(new Vector3(-0.528500, -0.028443, 0.000000), new Vector2(0.563451, 0.375000)),
        new Vertex(new Vector3(-0.486925, 0.028703 + this.crustHeight, 0.000000), new Vector2(0.531726, 0.000000)),
        new Vertex(new Vector3(0.528500, -0.028443, 0.000000), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.486925, 0.028703 + this.crustHeight, 0.000000), new Vector2(0.134833, 0.480334)),
        new Vertex(new Vector3(-0.000000, 0.001551, 0.000000), new Vector2(0.515863, 0.375000)),
        new Vertex(new Vector3(-0.000000, -0.028443, 0.000000), new Vector2(0.125000, 1.000000)),
        new Vertex(new Vector3(-0.528500, 0.001551, 0.000000), new Vector2(0.547588, 0.000000)),
        new Vertex(new Vector3(-0.352333, 0.001551, -0.352333), new Vector2(0.365167, 0.019666)),
        new Vertex(new Vector3(0.000000, 0.001551, -0.528500), new Vector2(0.531726, 0.375000)),
        new Vertex(new Vector3(0.352333, 0.001551, -0.352333), new Vector2(0.000000, 0.625000)),
        new Vertex(new Vector3(0.528500, 0.001551, 0.000000), new Vector2(0.515863, 0.000000)),
        new Vertex(new Vector3(0.352333, 0.001551, 0.352333), new Vector2(0.019666, 0.134833)),
        new Vertex(new Vector3(0.000000, 0.001551, 0.528500), new Vector2(0.547588, 0.375000)),
        new Vertex(new Vector3(-0.352333, 0.001551, 0.352333), new Vector2(0.500000, 0.875000)),
        new Vertex(new Vector3(-0.430828, 0.001551, 0.000000), new Vector2(0.563451, 0.000000)),
        new Vertex(new Vector3(-0.324617, 0.028703 + this.crustHeight, -0.324617), new Vector2(0.480334, 0.365167)),
        new Vertex(new Vector3(0.000000, 0.001551, -0.430828), new Vector2(0.250000, 0.250000)),
        new Vertex(new Vector3(0.324617, 0.028703 + this.crustHeight, -0.324617), new Vector2(0.250000, 0.750000)),
        new Vertex(new Vector3(0.430828, 0.001551, 0.000000), new Vector2(0.515863, 0.375000)),
        new Vertex(new Vector3(0.324617, 0.028703 + this.crustHeight, 0.324617), new Vector2(0.500000, 0.000000)),
        new Vertex(new Vector3(0.000000, 0.001551, 0.430828), new Vector2(0.000000, 0.125000)),
        new Vertex(new Vector3(-0.324617, 0.028703 + this.crustHeight, 0.324617), new Vector2(0.515863, 0.166667))
        
      );
        this.faces = [
        new Face(this.vertices, 18, 2, 12),
        new Face(this.vertices, 20, 6, 8),
        new Face(this.vertices, 22, 4, 14),
        new Face(this.vertices, 24, 0, 10),
        new Face(this.vertices, 17, 4, 10),
        new Face(this.vertices, 16, 1, 32),
        new Face(this.vertices, 16, 5, 30),
        new Face(this.vertices, 17, 0, 12),
        new Face(this.vertices, 23, 10, 4),
        new Face(this.vertices, 19, 8, 2),
        new Face(this.vertices, 2, 17, 12),
        new Face(this.vertices, 7, 16, 30),
        new Face(this.vertices, 3, 16, 28),
        new Face(this.vertices, 6, 17, 8),
        new Face(this.vertices, 21, 14, 6),
        new Face(this.vertices, 25, 12, 0),
        new Face(this.vertices, 13, 19, 18),
        new Face(this.vertices, 9, 21, 20),
        new Face(this.vertices, 15, 23, 22),
        new Face(this.vertices, 11, 25, 24),
        new Face(this.vertices, 9, 19, 27),
        new Face(this.vertices, 11, 23, 31),
        new Face(this.vertices, 13, 25, 33),
        new Face(this.vertices, 15, 21, 29),
        new Face(this.vertices, 26, 27, 13),
        new Face(this.vertices, 28, 29, 9),
        new Face(this.vertices, 30, 31, 15),
        new Face(this.vertices, 32, 33, 11),
        new Face(this.vertices, 28, 27, 3),
        new Face(this.vertices, 32, 31, 5),
        new Face(this.vertices, 26, 33, 1),
        new Face(this.vertices, 30, 29, 7),
        new Face(this.vertices, 18, 19, 2),
        new Face(this.vertices, 20, 21, 6),
        new Face(this.vertices, 22, 23, 4),
        new Face(this.vertices, 24, 25, 0),
        new Face(this.vertices, 17, 14, 4),
        new Face(this.vertices, 16, 26, 1),
        new Face(this.vertices, 16, 32, 5),
        new Face(this.vertices, 17, 10, 0),
        new Face(this.vertices, 23, 24, 10),
        new Face(this.vertices, 19, 20, 8),
        new Face(this.vertices, 2, 8, 17),
        new Face(this.vertices, 7, 28, 16),
        new Face(this.vertices, 3, 26, 16),
        new Face(this.vertices, 6, 14, 17),
        new Face(this.vertices, 21, 22, 14),
        new Face(this.vertices, 25, 18, 12),
        new Face(this.vertices, 13, 27, 19),
        new Face(this.vertices, 9, 29, 21),
        new Face(this.vertices, 15, 31, 23),
        new Face(this.vertices, 11, 33, 25),
        new Face(this.vertices, 9, 20, 19),
        new Face(this.vertices, 11, 24, 23),
        new Face(this.vertices, 13, 18, 25),
        new Face(this.vertices, 15, 22, 21),
        new Face(this.vertices, 26, 3, 27),
        new Face(this.vertices, 28, 7, 29),
        new Face(this.vertices, 30, 5, 31),
        new Face(this.vertices, 32, 1, 33),
        new Face(this.vertices, 28, 9, 27),
        new Face(this.vertices, 32, 11, 31),
        new Face(this.vertices, 26, 13, 33),
        new Face(this.vertices, 30, 15, 29)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.crustHeight = this.crustHeight;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.crustHeight = _serialization.crustHeight;
      this.create(this.crustHeight);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.crustHeight);
    }
    
  }
}