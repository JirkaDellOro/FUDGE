namespace FudgeCore {

  export class MeshFry extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshFry);

    private fryLength: number = 0;
    
    public constructor(_name: string = "MeshFry", _fryLength: number= 0) {
      super(_name); 
      this.create(_fryLength);
      
    }
       
    public create(_fryLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.017532, -0.204170, 0.017532), new Vector2(1.000000, 0.000000)),
        new Vertex(new Vector3(-0.017532, 0.204170 + _fryLength, 0.017532), new Vector2(0.333333, 0.000000)),
        new Vertex(new Vector3(-0.017532, -0.204170, -0.017532), new Vector2(0.333333, 0.666667)),
        new Vertex(new Vector3(-0.017532, 0.204170 + _fryLength, -0.017532), new Vector2(1.000000, 0.333333)),
        new Vertex(new Vector3(0.017532, -0.204170, 0.017532), new Vector2(0.333333, 0.333333)),
        new Vertex(new Vector3(0.017532, 0.204170 + _fryLength, 0.017532), new Vector2(0.333333, 1.000000)),
        new Vertex(new Vector3(0.017532, -0.204170, -0.017532), new Vector2(0.333333, 0.000000)),
        new Vertex(new Vector3(0.017532, 0.204170 + _fryLength, -0.017532), new Vector2(0.333333, 0.333333))
        
      );
        this.faces = [
        new Face(this.vertices, 1, 2, 0),
        new Face(this.vertices, 3, 6, 2),
        new Face(this.vertices, 7, 4, 6),
        new Face(this.vertices, 5, 0, 4),
        new Face(this.vertices, 6, 0, 2),
        new Face(this.vertices, 3, 5, 7),
        new Face(this.vertices, 1, 3, 2),
        new Face(this.vertices, 3, 7, 6),
        new Face(this.vertices, 7, 5, 4),
        new Face(this.vertices, 5, 1, 0),
        new Face(this.vertices, 6, 4, 0),
        new Face(this.vertices, 3, 1, 5)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.fryLength = this.fryLength;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.fryLength = _serialization.fryLength;
      this.create(this.fryLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.fryLength);
    }
    
  }
}