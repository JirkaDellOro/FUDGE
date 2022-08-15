namespace FudgeCore {

  export class MeshAxe extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshAxe);

    private shaftLength: number = 0;
    
    public constructor(_name: string = "MeshAxe", _shaftLength: number= 0) {
      super(_name); 
      this.create(_shaftLength);
      
    }
       
    public create(_shaftLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(0.228339, -0.063834, 9.293315 + (_shaftLength)), new Vector2(0.460104, 0.000000)),
        new Vertex(new Vector3(0.364505, -0.200000, 9.293315 + (_shaftLength)), new Vector2(0.460104, 1.000000)),
        new Vertex(new Vector3(0.364505, 0.200000, 9.293315 + (_shaftLength)), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(0.228339, 0.063834, 9.293315 + (_shaftLength)), new Vector2(0.375000, 0.914896)),
        new Vertex(new Vector3(0.364505, -0.200000, -2.742684), new Vector2(0.210104, 0.750000)),
        new Vertex(new Vector3(0.228339, -0.063834, -2.742684), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.228339, 0.063834, -2.742684), new Vector2(0.625000, 0.914896)),
        new Vertex(new Vector3(0.364505, 0.200000, -2.742684), new Vector2(0.789896, 0.750000)),
        new Vertex(new Vector3(0.492173, -0.200000, 9.293315 + (_shaftLength)), new Vector2(0.539896, 1.000000)),
        new Vertex(new Vector3(0.628339, -0.063834, 9.293315 + (_shaftLength)), new Vector2(0.539896, 0.000000)),
        new Vertex(new Vector3(0.628339, 0.063834, 9.293315 + (_shaftLength)), new Vector2(0.210104, 0.500000)),
        new Vertex(new Vector3(0.492173, 0.200000, 9.293315 + (_shaftLength)), new Vector2(0.375000, 0.335104)),
        new Vertex(new Vector3(0.628339, -0.063834, -2.742684), new Vector2(0.460104, 0.250000)),
        new Vertex(new Vector3(0.492173, -0.200000, -2.742684), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(0.492173, 0.200000, -2.742684), new Vector2(0.539896, 0.250000)),
        new Vertex(new Vector3(0.628339, 0.063834, -2.742684), new Vector2(0.789896, 0.500000)),
        new Vertex(new Vector3(-1.089204, -0.007744, 0.428734), new Vector2(0.625000, 0.335104)),
        new Vertex(new Vector3(-1.089204, 0.007744, 0.428734), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.807167, 0.007744, 1.039601), new Vector2(0.375000, 0.835104)),
        new Vertex(new Vector3(-0.807167, -0.007744, 1.039601), new Vector2(0.289896, 0.750000)),
        new Vertex(new Vector3(-0.419345, 0.015681, -2.278170), new Vector2(0.460104, 0.750000)),
        new Vertex(new Vector3(-0.419345, -0.015681, -2.278170), new Vector2(0.539896, 0.750000)),
        new Vertex(new Vector3(-0.643326, 0.015681, -1.282663), new Vector2(0.625000, 0.835104)),
        new Vertex(new Vector3(-0.643326, -0.015681, -1.282663), new Vector2(0.710104, 0.750000)),
        new Vertex(new Vector3(-0.152378, -0.015681, -2.351313), new Vector2(0.460104, 0.500000)),
        new Vertex(new Vector3(-0.152378, 0.015681, -2.351313), new Vector2(0.375000, 0.414896)),
        new Vertex(new Vector3(-0.186704, 0.076862, -1.141301), new Vector2(0.289896, 0.500000)),
        new Vertex(new Vector3(-0.186704, -0.076862, -1.141301), new Vector2(0.710104, 0.500000)),
        new Vertex(new Vector3(-0.186704, -0.076862, -2.421197), new Vector2(0.625000, 0.414896)),
        new Vertex(new Vector3(-0.186704, 0.076862, -2.421197), new Vector2(0.539896, 0.500000)),
        new Vertex(new Vector3(0.669158, 0.076862, -2.421197), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(0.505201, 0.240819, -2.421197), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.505201, -0.240819, -2.421197), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(0.669158, -0.076862, -2.421197), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(0.505201, 0.240819, -1.141301), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.669158, 0.076862, -1.141301), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(0.669158, -0.076862, -1.141301), new Vector2(0.375000, 0.625000)),
        new Vertex(new Vector3(0.505201, -0.240819, -1.141301), new Vector2(0.500000, 0.500000)),
        new Vertex(new Vector3(0.351477, 0.240819, -2.421197), new Vector2(0.500000, 0.250000)),
        new Vertex(new Vector3(0.187520, 0.076862, -2.421197), new Vector2(0.625000, 0.625000)),
        new Vertex(new Vector3(0.187520, -0.076862, -2.421197), new Vector2(0.125000, 0.625000)),
        new Vertex(new Vector3(0.351477, -0.240819, -2.421197), new Vector2(0.500000, 0.250000)),
        new Vertex(new Vector3(0.187520, 0.076862, -1.141301), new Vector2(0.500000, 0.000000)),
        new Vertex(new Vector3(0.351477, 0.240819, -1.141301), new Vector2(0.375000, 0.625000)),
        new Vertex(new Vector3(0.351477, -0.240819, -1.141301), new Vector2(0.500000, 0.500000)),
        new Vertex(new Vector3(0.187520, -0.076862, -1.141301), new Vector2(0.375000, 0.625000)),
        new Vertex(new Vector3(-0.152378, -0.015681, -1.209519), new Vector2(0.625000, 0.625000)),
        new Vertex(new Vector3(-0.152378, 0.015681, -1.209519), new Vector2(0.500000, 0.250000)),
        new Vertex(new Vector3(-1.602918, -0.007744, -1.939185), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(-1.602918, 0.007744, -1.939185), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(-1.613306, -0.007744, -0.797527), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-1.613306, 0.007744, -0.797527), new Vector2(0.375000, 0.750000))
        
      );
        this.faces = [
        new Face(this.vertices, 11, 3, 1),
        new Face(this.vertices, 15, 9, 12),
        new Face(this.vertices, 7, 11, 14),
        new Face(this.vertices, 3, 5, 0),
        new Face(this.vertices, 7, 15, 13),
        new Face(this.vertices, 1, 5, 4),
        new Face(this.vertices, 7, 3, 2),
        new Face(this.vertices, 13, 9, 8),
        new Face(this.vertices, 11, 15, 14),
        new Face(this.vertices, 13, 1, 4),
        new Face(this.vertices, 23, 22, 18),
        new Face(this.vertices, 51, 50, 16),
        new Face(this.vertices, 22, 51, 17),
        new Face(this.vertices, 19, 18, 17),
        new Face(this.vertices, 21, 24, 46),
        new Face(this.vertices, 49, 51, 22),
        new Face(this.vertices, 46, 47, 22),
        new Face(this.vertices, 48, 49, 20),
        new Face(this.vertices, 45, 28, 40),
        new Face(this.vertices, 40, 29, 39),
        new Face(this.vertices, 39, 26, 42),
        new Face(this.vertices, 26, 28, 27),
        new Face(this.vertices, 32, 44, 41),
        new Face(this.vertices, 34, 30, 31),
        new Face(this.vertices, 32, 36, 37),
        new Face(this.vertices, 38, 42, 43),
        new Face(this.vertices, 44, 40, 41),
        new Face(this.vertices, 40, 38, 30),
        new Face(this.vertices, 42, 27, 45),
        new Face(this.vertices, 38, 34, 31),
        new Face(this.vertices, 30, 36, 33),
        new Face(this.vertices, 36, 34, 42),
        new Face(this.vertices, 48, 21, 23),
        new Face(this.vertices, 20, 22, 47),
        new Face(this.vertices, 23, 19, 16),
        new Face(this.vertices, 24, 25, 47),
        new Face(this.vertices, 21, 20, 25),
        new Face(this.vertices, 50, 51, 49),
        new Face(this.vertices, 1, 8, 9),
        new Face(this.vertices, 9, 10, 11),
        new Face(this.vertices, 11, 2, 3),
        new Face(this.vertices, 3, 0, 1),
        new Face(this.vertices, 1, 9, 11),
        new Face(this.vertices, 15, 10, 9),
        new Face(this.vertices, 7, 2, 11),
        new Face(this.vertices, 3, 6, 5),
        new Face(this.vertices, 13, 4, 5),
        new Face(this.vertices, 5, 6, 7),
        new Face(this.vertices, 7, 14, 15),
        new Face(this.vertices, 15, 12, 13),
        new Face(this.vertices, 13, 5, 7),
        new Face(this.vertices, 1, 0, 5),
        new Face(this.vertices, 7, 6, 3),
        new Face(this.vertices, 13, 12, 9),
        new Face(this.vertices, 11, 10, 15),
        new Face(this.vertices, 13, 8, 1),
        new Face(this.vertices, 23, 18, 19),
        new Face(this.vertices, 51, 16, 17),
        new Face(this.vertices, 22, 17, 18),
        new Face(this.vertices, 19, 17, 16),
        new Face(this.vertices, 21, 46, 23),
        new Face(this.vertices, 49, 22, 20),
        new Face(this.vertices, 46, 22, 23),
        new Face(this.vertices, 48, 20, 21),
        new Face(this.vertices, 45, 27, 28),
        new Face(this.vertices, 40, 28, 29),
        new Face(this.vertices, 39, 29, 26),
        new Face(this.vertices, 26, 29, 28),
        new Face(this.vertices, 32, 37, 44),
        new Face(this.vertices, 34, 35, 30),
        new Face(this.vertices, 32, 33, 36),
        new Face(this.vertices, 38, 39, 42),
        new Face(this.vertices, 44, 45, 40),
        new Face(this.vertices, 32, 41, 40),
        new Face(this.vertices, 40, 39, 38),
        new Face(this.vertices, 38, 31, 30),
        new Face(this.vertices, 30, 33, 32),
        new Face(this.vertices, 32, 40, 30),
        new Face(this.vertices, 42, 26, 27),
        new Face(this.vertices, 38, 43, 34),
        new Face(this.vertices, 30, 35, 36),
        new Face(this.vertices, 44, 37, 36),
        new Face(this.vertices, 36, 35, 34),
        new Face(this.vertices, 34, 43, 42),
        new Face(this.vertices, 42, 45, 44),
        new Face(this.vertices, 44, 36, 42),
        new Face(this.vertices, 48, 23, 50),
        new Face(this.vertices, 20, 47, 25),
        new Face(this.vertices, 23, 16, 50),
        new Face(this.vertices, 24, 47, 46),
        new Face(this.vertices, 21, 25, 24),
        new Face(this.vertices, 50, 49, 48)
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