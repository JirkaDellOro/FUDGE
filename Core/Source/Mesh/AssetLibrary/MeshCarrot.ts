namespace FudgeCore {

  export class MeshCarrot extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshCarrot);

    private carrotLength: number = 0;
    
    public constructor(_name: string = "MeshCarrot", _carrotLength: number= 0) {
      super(_name); 
      this.create(_carrotLength);
      
    }
       
    public create(_carrotLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.055910, -0.310822 - this.carrotLength, 0.055909), new Vector2(0.376520, 0.331652)),
        new Vertex(new Vector3(-0.055910, 0.132253, 0.055909), new Vector2(0.376520, 0.910921)),
        new Vertex(new Vector3(-0.055910, -0.310822 - this.carrotLength, -0.055909), new Vector2(0.229187, 0.331652)),
        new Vertex(new Vector3(-0.055910, 0.132253, -0.055909), new Vector2(0.229187, 0.910921)),
        new Vertex(new Vector3(0.055909, -0.310822 - this.carrotLength, 0.055909), new Vector2(0.507484, 0.677385)),
        new Vertex(new Vector3(0.055909, 0.132253, 0.055909), new Vector2(0.507484, 0.100083)),
        new Vertex(new Vector3(0.055909, -0.310822 - this.carrotLength, -0.055909), new Vector2(0.081852, 0.331652)),
        new Vertex(new Vector3(0.055909, 0.132253, -0.055909), new Vector2(0.081852, 0.910921)),
        new Vertex(new Vector3(0.000000, -0.310822 - this.carrotLength, -0.083864), new Vector2(0.147334, 0.328892)),
        new Vertex(new Vector3(0.000000, 0.132253, -0.083864), new Vector2(0.147334, 0.331652)),
        new Vertex(new Vector3(0.000000, -0.310822 - this.carrotLength, 0.083864), new Vector2(0.147334, 0.910921)),
        new Vertex(new Vector3(0.000000, 0.132253, 0.083864), new Vector2(0.147334, 0.908161)),
        new Vertex(new Vector3(-0.083864, -0.310822 - this.carrotLength, -0.000000), new Vector2(0.442002, 0.328892)),
        new Vertex(new Vector3(-0.083864, 0.132253, -0.000000), new Vector2(0.589336, 0.677385)),
        new Vertex(new Vector3(0.083864, -0.310822 - this.carrotLength, -0.000000), new Vector2(0.589336, 0.100083)),
        new Vertex(new Vector3(0.083864, 0.132253, -0.000000), new Vector2(0.442002, 0.908161)),
        new Vertex(new Vector3(-0.010076, 0.202995, 0.010076), new Vector2(0.294668, 0.328892)),
        new Vertex(new Vector3(-0.013866, -0.536888 - this.carrotLength, 0.013866), new Vector2(0.294668, 0.331652)),
        new Vertex(new Vector3(-0.013866, -0.536888 - this.carrotLength, -0.013866), new Vector2(0.294668, 0.910921)),
        new Vertex(new Vector3(0.013866, -0.536888 - this.carrotLength, 0.013866), new Vector2(0.294668, 0.908161)),
        new Vertex(new Vector3(0.013866, -0.536888 - this.carrotLength, -0.013866), new Vector2(0.442002, 0.672494)),
        new Vertex(new Vector3(0.000000, -0.536888 - this.carrotLength, -0.020799), new Vector2(0.000000, 0.331652)),
        new Vertex(new Vector3(0.000000, -0.536888 - this.carrotLength, 0.020799), new Vector2(0.442002, 0.095192)),
        new Vertex(new Vector3(-0.020799, -0.536888 - this.carrotLength, -0.000000), new Vector2(0.000000, 0.910921)),
        new Vertex(new Vector3(0.020799, -0.536888 - this.carrotLength, -0.000000), new Vector2(0.632813, 0.019875)),
        new Vertex(new Vector3(-0.000000, -0.560275 - this.carrotLength, -0.000000), new Vector2(0.627687, 0.249928)),
        new Vertex(new Vector3(-0.010076, 0.202995, -0.010076), new Vector2(0.351899, 0.031945)),
        new Vertex(new Vector3(0.010076, 0.202995, 0.010076), new Vector2(0.204566, 0.031945)),
        new Vertex(new Vector3(0.010076, 0.202995, -0.010076), new Vector2(0.532104, 0.964581)),
        new Vertex(new Vector3(0.000000, 0.202995, -0.015114), new Vector2(0.057232, 0.031945)),
        new Vertex(new Vector3(0.000000, 0.202995, 0.015114), new Vector2(0.073472, 0.031260)),
        new Vertex(new Vector3(-0.015114, 0.202995, -0.000000), new Vector2(0.184266, 0.031945)),
        new Vertex(new Vector3(0.015114, 0.202995, -0.000000), new Vector2(0.368139, 0.031260)),
        new Vertex(new Vector3(-0.032083, 0.202995, -0.000000), new Vector2(0.552404, 0.964581)),
        new Vertex(new Vector3(-0.021389, 0.202995, -0.021389), new Vector2(0.220805, 0.031260)),
        new Vertex(new Vector3(0.000000, 0.202995, -0.032083), new Vector2(0.331599, 0.031945)),
        new Vertex(new Vector3(0.021389, 0.202995, -0.021389), new Vector2(0.036932, 0.031945)),
        new Vertex(new Vector3(0.032084, 0.202995, -0.000000), new Vector2(0.515864, 0.963368)),
        new Vertex(new Vector3(0.021389, 0.202995, 0.021389), new Vector2(0.540224, 0.992628)),
        new Vertex(new Vector3(0.000000, 0.202995, 0.032083), new Vector2(0.343779, 0.000000)),
        new Vertex(new Vector3(-0.021389, 0.202995, 0.021389), new Vector2(0.196446, 0.000000)),
        new Vertex(new Vector3(-0.002536, 0.337334, 0.002536), new Vector2(0.049112, 0.000000)),
        new Vertex(new Vector3(-0.002536, 0.337334, -0.002536), new Vector2(0.601144, 0.601455)),
        new Vertex(new Vector3(0.002536, 0.337334, 0.002536), new Vector2(0.609211, 0.031676)),
        new Vertex(new Vector3(0.002536, 0.337334, -0.002536), new Vector2(0.644614, 0.043477)),
        new Vertex(new Vector3(0.000000, 0.337334, -0.003804), new Vector2(0.604045, 0.075161)),
        new Vertex(new Vector3(0.000000, 0.337334, 0.003804), new Vector2(0.621012, 0.055278)),
        new Vertex(new Vector3(-0.003804, 0.337334, 0.000000), new Vector2(0.601144, 0.426404)),
        new Vertex(new Vector3(0.003804, 0.337334, 0.000000), new Vector2(0.615892, 0.601731)),
        new Vertex(new Vector3(-0.000000, 0.337334, 0.000000), new Vector2(0.609211, 0.046427))
        
      );
        this.faces = [
        new Face(this.vertices, 13, 2, 12),
        new Face(this.vertices, 9, 6, 8),
        new Face(this.vertices, 15, 4, 14),
        new Face(this.vertices, 11, 0, 10),
        new Face(this.vertices, 6, 21, 8),
        new Face(this.vertices, 5, 37, 38),
        new Face(this.vertices, 1, 33, 13),
        new Face(this.vertices, 0, 22, 10),
        new Face(this.vertices, 5, 10, 4),
        new Face(this.vertices, 3, 8, 2),
        new Face(this.vertices, 6, 24, 20),
        new Face(this.vertices, 7, 37, 15),
        new Face(this.vertices, 7, 35, 36),
        new Face(this.vertices, 2, 23, 12),
        new Face(this.vertices, 7, 14, 6),
        new Face(this.vertices, 1, 12, 0),
        new Face(this.vertices, 25, 19, 22),
        new Face(this.vertices, 25, 17, 23),
        new Face(this.vertices, 18, 25, 23),
        new Face(this.vertices, 20, 25, 21),
        new Face(this.vertices, 4, 22, 19),
        new Face(this.vertices, 2, 21, 18),
        new Face(this.vertices, 4, 24, 14),
        new Face(this.vertices, 0, 23, 17),
        new Face(this.vertices, 26, 47, 42),
        new Face(this.vertices, 27, 48, 43),
        new Face(this.vertices, 26, 45, 29),
        new Face(this.vertices, 16, 47, 31),
        new Face(this.vertices, 5, 39, 11),
        new Face(this.vertices, 3, 35, 9),
        new Face(this.vertices, 3, 33, 34),
        new Face(this.vertices, 1, 39, 40),
        new Face(this.vertices, 31, 34, 33),
        new Face(this.vertices, 29, 36, 35),
        new Face(this.vertices, 32, 38, 37),
        new Face(this.vertices, 30, 40, 39),
        new Face(this.vertices, 29, 34, 26),
        new Face(this.vertices, 30, 38, 27),
        new Face(this.vertices, 31, 40, 16),
        new Face(this.vertices, 32, 36, 28),
        new Face(this.vertices, 49, 41, 46),
        new Face(this.vertices, 49, 43, 48),
        new Face(this.vertices, 44, 49, 48),
        new Face(this.vertices, 42, 49, 45),
        new Face(this.vertices, 28, 48, 32),
        new Face(this.vertices, 27, 46, 30),
        new Face(this.vertices, 16, 46, 41),
        new Face(this.vertices, 28, 45, 44),
        new Face(this.vertices, 13, 3, 2),
        new Face(this.vertices, 9, 7, 6),
        new Face(this.vertices, 15, 5, 4),
        new Face(this.vertices, 11, 1, 0),
        new Face(this.vertices, 6, 20, 21),
        new Face(this.vertices, 5, 15, 37),
        new Face(this.vertices, 1, 40, 33),
        new Face(this.vertices, 0, 17, 22),
        new Face(this.vertices, 5, 11, 10),
        new Face(this.vertices, 3, 9, 8),
        new Face(this.vertices, 6, 14, 24),
        new Face(this.vertices, 7, 36, 37),
        new Face(this.vertices, 7, 9, 35),
        new Face(this.vertices, 2, 18, 23),
        new Face(this.vertices, 7, 15, 14),
        new Face(this.vertices, 1, 13, 12),
        new Face(this.vertices, 25, 24, 19),
        new Face(this.vertices, 25, 22, 17),
        new Face(this.vertices, 18, 21, 25),
        new Face(this.vertices, 20, 24, 25),
        new Face(this.vertices, 4, 10, 22),
        new Face(this.vertices, 2, 8, 21),
        new Face(this.vertices, 4, 19, 24),
        new Face(this.vertices, 0, 12, 23),
        new Face(this.vertices, 26, 31, 47),
        new Face(this.vertices, 27, 32, 48),
        new Face(this.vertices, 26, 42, 45),
        new Face(this.vertices, 16, 41, 47),
        new Face(this.vertices, 5, 38, 39),
        new Face(this.vertices, 3, 34, 35),
        new Face(this.vertices, 3, 13, 33),
        new Face(this.vertices, 1, 11, 39),
        new Face(this.vertices, 31, 26, 34),
        new Face(this.vertices, 29, 28, 36),
        new Face(this.vertices, 32, 27, 38),
        new Face(this.vertices, 30, 16, 40),
        new Face(this.vertices, 29, 35, 34),
        new Face(this.vertices, 30, 39, 38),
        new Face(this.vertices, 31, 33, 40),
        new Face(this.vertices, 32, 37, 36),
        new Face(this.vertices, 49, 47, 41),
        new Face(this.vertices, 49, 46, 43),
        new Face(this.vertices, 44, 45, 49),
        new Face(this.vertices, 42, 47, 49),
        new Face(this.vertices, 28, 44, 48),
        new Face(this.vertices, 27, 43, 46),
        new Face(this.vertices, 16, 30, 46),
        new Face(this.vertices, 28, 29, 45)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.carrotLength = this.carrotLength;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.carrotLength = _serialization.carrotLength;
      this.create(this.carrotLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.carrotLength);
    }
    
  }
}