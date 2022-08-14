namespace FudgeCore {
  export class MeshDiamond extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshDiamond);

    private inflate: number = 0;
    
    public constructor(_name: string = "MeshDiamond", _inflate: number= 0) {
      super(_name); 
      this.create(_inflate);
      
    }
       
    public create(_inflate: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.147147, -0.147141, -0.046639 - (this.inflate / 2)), new Vector2(0.342731, 0.455063)),
        new Vertex(new Vector3(-0.147147, -0.147153, 0.046600 + (this.inflate / 2)), new Vector2(0.455063, 0.657269)),
        new Vertex(new Vector3(-0.147147, 0.147153, -0.046600 - (this.inflate / 2)), new Vector2(0.044937, 0.342731)),
        new Vertex(new Vector3(-0.147147, 0.147141, 0.046639 + (this.inflate / 2)), new Vector2(0.157269, 0.544937)),
        new Vertex(new Vector3(0.147147, -0.147141, -0.046639 - (this.inflate / 2)), new Vector2(0.455063, 0.157269)),
        new Vertex(new Vector3(0.147147, -0.147153, 0.046600 + (this.inflate / 2)), new Vector2(0.342731, 0.955063)),
        new Vertex(new Vector3(0.147147, 0.147153, -0.046600 - (this.inflate / 2)), new Vector2(0.157269, 0.044937)),
        new Vertex(new Vector3(0.147147, 0.147141, 0.046639  + (this.inflate / 2)), new Vector2(0.044937, 0.842731)),
        new Vertex(new Vector3(-0.179392, 0.000007, -0.056836 - (this.inflate / 1.8)), new Vector2(0.181526, 0.431526)),
        new Vertex(new Vector3(-0.179392, -0.179392, -0.000024), new Vector2(0.500000, 0.636949)),
        new Vertex(new Vector3(-0.179392, -0.000007, 0.056836  + (this.inflate / 1.8)), new Vector2(0.363051, 0.500000)),
        new Vertex(new Vector3(-0.179392, 0.179392, 0.000024), new Vector2(0.318474, 0.568474)),
        new Vertex(new Vector3(-0.000000, 0.179399, -0.056812  - (this.inflate / 1.6)), new Vector2(0.136949, 0.500000)),
        new Vertex(new Vector3(-0.000000, 0.179384, 0.056859  + (this.inflate / 1.6)), new Vector2(0.000000, 0.363051)),
        new Vertex(new Vector3(0.179392, 0.179392, 0.000024), new Vector2(0.068474, 0.181526)),
        new Vertex(new Vector3(0.179392, 0.000007, -0.056836 - (this.inflate / 1.8)), new Vector2(0.068474, 0.681526)),
        new Vertex(new Vector3(0.179392, -0.000007, 0.056836 + (this.inflate / 1.8)), new Vector2(0.000000, 0.863051)),
        new Vertex(new Vector3(0.179392, -0.179392, -0.000024), new Vector2(0.136949, 0.000000)),
        new Vertex(new Vector3(-0.000000, -0.179384, -0.056859  - (this.inflate / 1.6)), new Vector2(0.318474, 0.068474)),
        new Vertex(new Vector3(-0.000000, -0.179399, 0.056812  + (this.inflate / 1.6)), new Vector2(0.181526, 0.931526)),
        new Vertex(new Vector3(0.247061, -0.000000, 0.000000), new Vector2(0.363051, 1.000000)),
        new Vertex(new Vector3(-0.000000, -0.247061, -0.000032), new Vector2(0.500000, 0.136949)),
        new Vertex(new Vector3(-0.000000, 0.000010, -0.078275  - (this.inflate / 1.2)), new Vector2(0.431526, 0.318474)),
        new Vertex(new Vector3(-0.000000, -0.000010, 0.078275  + (this.inflate / 1.2)), new Vector2(0.431526, 0.818474)),
        new Vertex(new Vector3(-0.247061, 0.000000, 0.000000), new Vector2(0.155696, 1.000000)),
        new Vertex(new Vector3(-0.000000, 0.247061, 0.000032), new Vector2(0.344304, 0.000000))
        
      );
        this.faces = [
        new Face(this.vertices, 7, 20, 14),
        new Face(this.vertices, 5, 20, 16),
        new Face(this.vertices, 20, 4, 15),
        new Face(this.vertices, 20, 6, 14),
        new Face(this.vertices, 5, 21, 17),
        new Face(this.vertices, 1, 21, 19),
        new Face(this.vertices, 21, 0, 18),
        new Face(this.vertices, 21, 4, 17),
        new Face(this.vertices, 6, 22, 12),
        new Face(this.vertices, 4, 22, 15),
        new Face(this.vertices, 22, 0, 8),
        new Face(this.vertices, 22, 2, 12),
        new Face(this.vertices, 3, 23, 13),
        new Face(this.vertices, 1, 23, 10),
        new Face(this.vertices, 23, 5, 16),
        new Face(this.vertices, 23, 7, 13),
        new Face(this.vertices, 1, 24, 9),
        new Face(this.vertices, 3, 24, 10),
        new Face(this.vertices, 24, 2, 8),
        new Face(this.vertices, 24, 0, 9),
        new Face(this.vertices, 3, 25, 11),
        new Face(this.vertices, 7, 25, 13),
        new Face(this.vertices, 25, 6, 12),
        new Face(this.vertices, 25, 2, 11),
        new Face(this.vertices, 7, 16, 20),
        new Face(this.vertices, 5, 17, 20),
        new Face(this.vertices, 20, 17, 4),
        new Face(this.vertices, 20, 15, 6),
        new Face(this.vertices, 5, 19, 21),
        new Face(this.vertices, 1, 9, 21),
        new Face(this.vertices, 21, 9, 0),
        new Face(this.vertices, 21, 18, 4),
        new Face(this.vertices, 6, 15, 22),
        new Face(this.vertices, 4, 18, 22),
        new Face(this.vertices, 22, 18, 0),
        new Face(this.vertices, 22, 8, 2),
        new Face(this.vertices, 3, 10, 23),
        new Face(this.vertices, 1, 19, 23),
        new Face(this.vertices, 23, 19, 5),
        new Face(this.vertices, 23, 16, 7),
        new Face(this.vertices, 1, 10, 24),
        new Face(this.vertices, 3, 11, 24),
        new Face(this.vertices, 24, 11, 2),
        new Face(this.vertices, 24, 8, 0),
        new Face(this.vertices, 3, 13, 25),
        new Face(this.vertices, 7, 14, 25),
        new Face(this.vertices, 25, 14, 6),
        new Face(this.vertices, 25, 12, 2)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.inflate = this.inflate;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.inflate = _serialization.inflate;
      this.create(this.inflate);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.inflate);
    }
    
  }
}