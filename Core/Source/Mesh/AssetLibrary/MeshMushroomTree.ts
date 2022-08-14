namespace FudgeCore {
  export class MeshMushroomTree extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshMushroomTree);

    private amountTreetop: number = 0;
    
    public constructor(_name: string = "MeshMushroomTree", _amountTreetop: number= 0) {
      super(_name); 
      this.create(_amountTreetop);
      
    }
        
    public create(_amountTreetop: number): void {
        this.clear(); 
        this.vertices = new Vertices(
       new Vertex(new Vector3(-0.017532, -0.111779, 0.017532), new Vector2(0.350045, 0.400000)),
       new Vertex(new Vector3(-0.017532, -0.013676, 0.017532), new Vector2(0.820109, 0.674600)),
       new Vertex(new Vector3(-0.017532, -0.111779, -0.017532), new Vector2(0.260054, 0.220018)),
       new Vertex(new Vector3(-0.017532, -0.013676, -0.017532), new Vector2(0.350045, 0.646482)),
       new Vertex(new Vector3(0.017532, -0.111779, 0.017532), new Vector2(0.350045, 0.651823)),
       new Vertex(new Vector3(0.017532, -0.013676, 0.017532), new Vector2(0.740036, 0.714636)),
       new Vertex(new Vector3(0.017532, -0.111779, -0.017532), new Vector2(0.350045, 0.898305)),
       new Vertex(new Vector3(0.017532, -0.013676, -0.017532), new Vector2(0.179982, 0.260054)),
       new Vertex(new Vector3(0.000000, -0.111779, -0.026297), new Vector2(0.697117, 0.714636)),
       new Vertex(new Vector3(0.000000, -0.013676, -0.026297), new Vector2(0.780072, 0.594528)),
       new Vertex(new Vector3(0.000000, -0.111779, 0.026297), new Vector2(0.697117, 0.946739)),
       new Vertex(new Vector3(0.000000, -0.013676, 0.026297), new Vector2(0.220018, 0.139946)),
       new Vertex(new Vector3(-0.026297, -0.111779, -0.000000), new Vector2(0.607036, 0.714636)),
       new Vertex(new Vector3(-0.026297, -0.013676, -0.000000), new Vector2(0.700000, 0.634564)),
       new Vertex(new Vector3(0.026298, -0.111779, -0.000000), new Vector2(0.139946, 0.179982)),
       new Vertex(new Vector3(0.026298, -0.013676, -0.000000), new Vector2(0.607036, 0.961119)),
       new Vertex(new Vector3(0.000000, -0.111779, -0.000000), new Vector2(0.647072, 0.719976)),
       new Vertex(new Vector3(-0.058386, -0.032868, 0.058386), new Vector2(0.300000, 0.651823)),
       new Vertex(new Vector3(-0.058386, -0.032868, -0.058386), new Vector2(0.700000, 0.684609)),
       new Vertex(new Vector3(0.058386, -0.032868, 0.058386), new Vector2(0.647072, 0.966459)),
       new Vertex(new Vector3(0.058386, -0.032868, -0.058386), new Vector2(0.300000, 0.898305)),
       new Vertex(new Vector3(-0.000000, -0.032868, -0.087579), new Vector2(0.139946, 0.230027)),
       new Vertex(new Vector3(-0.000000, -0.032868, 0.087579), new Vector2(0.390081, 0.405340)),
       new Vertex(new Vector3(-0.087579, -0.032868, -0.000000), new Vector2(0.820109, 0.624555)),
       new Vertex(new Vector3(0.087579, -0.032868, -0.000000), new Vector2(0.647072, 0.714636)),
       new Vertex(new Vector3(-0.010197, 0.093538, 0.010197), new Vector2(0.390081, 0.651823)),
       new Vertex(new Vector3(-0.030554, 0.067065, 0.030554), new Vector2(0.647072, 0.946739)),
       new Vertex(new Vector3(-0.030554, 0.067065, -0.030554), new Vector2(0.260054, 0.169973)),
       new Vertex(new Vector3(0.030553, 0.067065, 0.030554), new Vector2(0.390081, 0.657163)),
       new Vertex(new Vector3(0.030553, 0.067065, -0.030554), new Vector2(0.790082, 0.714636)),
       new Vertex(new Vector3(-0.000000, 0.067065, -0.045830), new Vector2(0.300000, 0.400000)),
       new Vertex(new Vector3(-0.000000, 0.067065, 0.045830), new Vector2(0.390081, 0.903645)),
       new Vertex(new Vector3(-0.045830, 0.067065, -0.000000), new Vector2(0.300000, 0.646482)),
       new Vertex(new Vector3(0.045830, 0.067065, -0.000000), new Vector2(0.230027, 0.260054)),
       new Vertex(new Vector3(-0.010197, 0.093538, -0.010197), new Vector2(0.737153, 0.725924)),
       new Vertex(new Vector3(0.010197, 0.093538, 0.010197), new Vector2(0.730027, 0.594528)),
       new Vertex(new Vector3(0.010197, 0.093538, -0.010197), new Vector2(0.556990, 0.714636)),
       new Vertex(new Vector3(-0.000000, 0.093538, -0.015296), new Vector2(0.737153, 0.958027)),
       new Vertex(new Vector3(-0.000000, 0.093538, 0.015296), new Vector2(0.169973, 0.139946)),
       new Vertex(new Vector3(-0.015296, 0.093538, -0.000000), new Vector2(0.556990, 0.961119)),
       new Vertex(new Vector3(0.015296, 0.093538, -0.000000), new Vector2(0.760054, 0.654582)),
       new Vertex(new Vector3(-0.000000, 0.093538, -0.000000), new Vector2(0.400000, 0.266666))
      );
        for (let i: number = 0;  i < _amountTreetop; i++) {
          this.vertices.push(new Vertex(new Vector3(-0.017532, -0.013676 + (0.05 * (i + 1)) , 0.017532), new Vector2(0.260054, 0.220018)), new Vertex(new Vector3(-0.017532, -0.013676 + (0.05 * (i + 1)) , -0.017532), new Vector2(0.179982, 0.260054)), new Vertex(new Vector3(0.017532, -0.013676 + (0.05 * (i + 1)) , 0.017532), new Vector2(0.220018, 0.139946)), new Vertex(new Vector3(0.017532, -0.013676 + (0.05 * (i + 1)) , -0.017532), new Vector2(0.139946, 0.179982)), new Vertex(new Vector3(0.000000, -0.013676 + (0.05 * (i + 1)) , -0.026297), new Vector2(0.139946, 0.230027)), new Vertex(new Vector3(0.000000, -0.013676 + (0.05 * (i + 1)) , 0.026297), new Vector2(0.260054, 0.169973)), new Vertex(new Vector3(-0.026297, -0.013676 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.230027, 0.260054)), new Vertex(new Vector3(0.026298, -0.013676 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.169973, 0.139946)), new Vertex(new Vector3(-0.058386, -0.032868 + (0.05 * (i + 1)) , 0.058386), new Vector2(0.400000, 0.266666)), new Vertex(new Vector3(-0.058386, -0.032868 + (0.05 * (i + 1)) , -0.058386), new Vector2(0.566667, 0.367686)), new Vertex(new Vector3(0.058386, -0.032868 + (0.05 * (i + 1)) , 0.058386), new Vector2(0.166667, 0.400000)), new Vertex(new Vector3(0.058386, -0.032868 + (0.05 * (i + 1)) , -0.058386), new Vector2(0.133333, 0.400000)), new Vertex(new Vector3(-0.000000, -0.032868 + (0.05 * (i + 1)) , -0.087579), new Vector2(0.266666, 0.000000)), new Vertex(new Vector3(-0.000000, -0.032868 + (0.05 * (i + 1)) , 0.087579), new Vector2(0.533333, 0.367685)), new Vertex(new Vector3(-0.087579, -0.032868 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.000000, 0.133334)), new Vertex(new Vector3(0.087579, -0.032868 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.866667, 0.000000)), new Vertex(new Vector3(-0.010197, 0.093538 + (0.05 * (i + 1)) , 0.010197), new Vector2(0.000000, 0.400000)), new Vertex(new Vector3(-0.030554, 0.067065 + (0.05 * (i + 1)) , 0.030554), new Vector2(0.000000, 0.300000)), new Vertex(new Vector3(-0.030554, 0.067065 + (0.05 * (i + 1)) , -0.030554), new Vector2(1.000000, 0.017785)), new Vertex(new Vector3(0.030553, 0.067065 + (0.05 * (i + 1)) , 0.030554), new Vector2(0.700000, 0.367685)), new Vertex(new Vector3(0.030553, 0.067065 + (0.05 * (i + 1)) , -0.030554), new Vector2(0.400000, 0.100000)), new Vertex(new Vector3(-0.000000, 0.067065 + (0.05 * (i + 1)) , -0.045830), new Vector2(0.700000, 0.385470)), new Vertex(new Vector3(-0.000000, 0.067065 + (0.05 * (i + 1)) , 0.045830), new Vector2(0.400000, 0.367686)), new Vertex(new Vector3(-0.045830, 0.067065 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.300000, 0.417785)), new Vertex(new Vector3(0.045830, 0.067065 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.300000, 0.400000)), new Vertex(new Vector3(-0.010197, 0.093538 + (0.05 * (i + 1)) , -0.010197), new Vector2(0.700000, 0.000000)), new Vertex(new Vector3(0.010197, 0.093538 + (0.05 * (i + 1)) , 0.010197), new Vector2(0.100000, 0.000000)), new Vertex(new Vector3(0.010197, 0.093538 + (0.05 * (i + 1)) , -0.010197), new Vector2(0.400000, 0.330093)), new Vertex(new Vector3(-0.000000, 0.093538 + (0.05 * (i + 1)) , -0.015296), new Vector2(0.463974, 0.854228)), new Vertex(new Vector3(-0.000000, 0.093538 + (0.05 * (i + 1)) , 0.015296), new Vector2(0.511644, 0.714636)), new Vertex(new Vector3(-0.015296, 0.093538 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.487217, 0.923957)), new Vertex(new Vector3(0.015296, 0.093538 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.534887, 0.635724)), new Vertex(new Vector3(-0.000000, 0.093538 + (0.05 * (i + 1)) , -0.000000), new Vector2(0.134887, 0.668038)));
          console.log(this.vertices);
        }
        this.faces = [
        new Face(this.vertices, 13, 2, 12),
        new Face(this.vertices, 9, 6, 8),
        new Face(this.vertices, 15, 4, 14),
        new Face(this.vertices, 11, 0, 10),
        new Face(this.vertices, 16, 4, 10),
        new Face(this.vertices, 15, 19, 5),
        new Face(this.vertices, 13, 17, 23),
        new Face(this.vertices, 16, 0, 12),
        new Face(this.vertices, 5, 10, 4),
        new Face(this.vertices, 3, 8, 2),
        new Face(this.vertices, 2, 16, 12),
        new Face(this.vertices, 15, 20, 24),
        new Face(this.vertices, 9, 20, 7),
        new Face(this.vertices, 6, 16, 8),
        new Face(this.vertices, 7, 14, 6),
        new Face(this.vertices, 1, 12, 0),
        new Face(this.vertices, 18, 32, 27),
        new Face(this.vertices, 19, 33, 28),
        new Face(this.vertices, 18, 30, 21),
        new Face(this.vertices, 20, 33, 24),
        new Face(this.vertices, 11, 19, 22),
        new Face(this.vertices, 9, 18, 21),
        new Face(this.vertices, 13, 18, 3),
        new Face(this.vertices, 11, 17, 1),
        new Face(this.vertices, 27, 37, 30),
        new Face(this.vertices, 29, 40, 33),
        new Face(this.vertices, 29, 37, 36),
        new Face(this.vertices, 26, 38, 25),
        new Face(this.vertices, 17, 32, 23),
        new Face(this.vertices, 19, 31, 22),
        new Face(this.vertices, 17, 31, 26),
        new Face(this.vertices, 20, 30, 29),
        new Face(this.vertices, 41, 25, 38),
        new Face(this.vertices, 41, 35, 40),
        new Face(this.vertices, 36, 41, 40),
        new Face(this.vertices, 34, 41, 37),
        new Face(this.vertices, 28, 40, 35),
        new Face(this.vertices, 27, 39, 34),
        new Face(this.vertices, 26, 39, 32),
        new Face(this.vertices, 28, 38, 31),
        new Face(this.vertices, 13, 3, 2),
        new Face(this.vertices, 9, 7, 6),
        new Face(this.vertices, 15, 5, 4),
        new Face(this.vertices, 11, 1, 0),
        new Face(this.vertices, 16, 14, 4),
        new Face(this.vertices, 15, 24, 19),
        new Face(this.vertices, 13, 1, 17),
        new Face(this.vertices, 16, 10, 0),
        new Face(this.vertices, 5, 11, 10),
        new Face(this.vertices, 3, 9, 8),
        new Face(this.vertices, 2, 8, 16),
        new Face(this.vertices, 15, 7, 20),
        new Face(this.vertices, 9, 21, 20),
        new Face(this.vertices, 6, 14, 16),
        new Face(this.vertices, 7, 15, 14),
        new Face(this.vertices, 1, 13, 12),
        new Face(this.vertices, 18, 23, 32),
        new Face(this.vertices, 19, 24, 33),
        new Face(this.vertices, 18, 27, 30),
        new Face(this.vertices, 20, 29, 33),
        new Face(this.vertices, 11, 5, 19),
        new Face(this.vertices, 9, 3, 18),
        new Face(this.vertices, 13, 23, 18),
        new Face(this.vertices, 11, 22, 17),
        new Face(this.vertices, 27, 34, 37),
        new Face(this.vertices, 29, 36, 40),
        new Face(this.vertices, 29, 30, 37),
        new Face(this.vertices, 26, 31, 38),
        new Face(this.vertices, 17, 26, 32),  
        new Face(this.vertices, 19, 28, 31),
        new Face(this.vertices, 17, 22, 31),
        new Face(this.vertices, 20, 21, 30),
        new Face(this.vertices, 41, 39, 25),
        new Face(this.vertices, 41, 38, 35),
        new Face(this.vertices, 36, 37, 41),
        new Face(this.vertices, 34, 39, 41),
        new Face(this.vertices, 28, 33, 40),
        new Face(this.vertices, 27, 32, 39),
        new Face(this.vertices, 26, 25, 39),
        new Face(this.vertices, 28, 35, 38)
      ];
        for (let i: number = 0;  i < _amountTreetop; i++) {
        this.faces.push(new Face(this.vertices, 49 + (i * 33) , 52 + (i * 33) , 44 + (i * 33) ), new Face(this.vertices, 48 + (i * 33) , 50 + (i * 33) , 56 + (i * 33) ), new Face(this.vertices, 49 + (i * 33) , 53 + (i * 33) , 57 + (i * 33) ), new Face(this.vertices, 46 + (i * 33) , 53 + (i * 33) , 45 + (i * 33) ), new Face(this.vertices, 51 + (i * 33) , 65 + (i * 33) , 60 + (i * 33) ), new Face(this.vertices, 52 + (i * 33) , 66 + (i * 33) , 61 + (i * 33) ), new Face(this.vertices, 51 + (i * 33) , 63 + (i * 33) , 54 + (i * 33) ), new Face(this.vertices, 53 + (i * 33) , 66 + (i * 33) , 57 + (i * 33) ), new Face(this.vertices, 47 + (i * 33) , 52 + (i * 33) , 55 + (i * 33) ), new Face(this.vertices, 46 + (i * 33) , 51 + (i * 33) , 54 + (i * 33) ), new Face(this.vertices, 48 + (i * 33) , 51 + (i * 33) , 43 + (i * 33) ), new Face(this.vertices, 47 + (i * 33) , 50 + (i * 33) , 42 + (i * 33) ), new Face(this.vertices, 60 + (i * 33) , 70 + (i * 33) , 63 + (i * 33) ), new Face(this.vertices, 62 + (i * 33) , 73 + (i * 33) , 66 + (i * 33) ), new Face(this.vertices, 62 + (i * 33) , 70 + (i * 33) , 69 + (i * 33) ), new Face(this.vertices, 59 + (i * 33) , 71 + (i * 33) , 58 + (i * 33) ), new Face(this.vertices, 50 + (i * 33) , 65 + (i * 33) , 56 + (i * 33) ), new Face(this.vertices, 52 + (i * 33) , 64 + (i * 33) , 55 + (i * 33) ), new Face(this.vertices, 50 + (i * 33) , 64 + (i * 33) , 59 + (i * 33) ), new Face(this.vertices, 53 + (i * 33) , 63 + (i * 33) , 62 + (i * 33) ), new Face(this.vertices, 74 + (i * 33) , 58 + (i * 33) , 71 + (i * 33) ), new Face(this.vertices, 74 + (i * 33) , 68 + (i * 33) , 73 + (i * 33) ), new Face(this.vertices, 69 + (i * 33) , 74 + (i * 33) , 73 + (i * 33) ), new Face(this.vertices, 67 + (i * 33) , 74 + (i * 33) , 70 + (i * 33) ), new Face(this.vertices, 61 + (i * 33) , 73 + (i * 33) , 68 + (i * 33) ), new Face(this.vertices, 60 + (i * 33) , 72 + (i * 33) , 67 + (i * 33) ), new Face(this.vertices, 59 + (i * 33) , 72 + (i * 33) , 65 + (i * 33) ), new Face(this.vertices, 61 + (i * 33) , 71 + (i * 33) , 64 + (i * 33) ), new Face(this.vertices, 49 + (i * 33) , 57 + (i * 33) , 52 + (i * 33) ), new Face(this.vertices, 48 + (i * 33) , 42 + (i * 33) , 50 + (i * 33) ), new Face(this.vertices, 49 + (i * 33) , 45 + (i * 33) , 53 + (i * 33) ), new Face(this.vertices, 46 + (i * 33) , 54 + (i * 33) , 53 + (i * 33) ), new Face(this.vertices, 51 + (i * 33) , 56 + (i * 33) , 65 + (i * 33) ), new Face(this.vertices, 52 + (i * 33) , 57 + (i * 33) , 66 + (i * 33) ), new Face(this.vertices, 51 + (i * 33) , 60 + (i * 33) , 63 + (i * 33) ), new Face(this.vertices, 53 + (i * 33) , 62 + (i * 33) , 66 + (i * 33) ), new Face(this.vertices, 47 + (i * 33) , 44 + (i * 33) , 52 + (i * 33) ), new Face(this.vertices, 46 + (i * 33) , 43 + (i * 33) , 51 + (i * 33) ), new Face(this.vertices, 48 + (i * 33) , 56 + (i * 33) , 51 + (i * 33) ), new Face(this.vertices, 47 + (i * 33) , 55 + (i * 33) , 50 + (i * 33) ), new Face(this.vertices, 60 + (i * 33) , 67 + (i * 33) , 70 + (i * 33) ), new Face(this.vertices, 62 + (i * 33) , 69 + (i * 33) , 73 + (i * 33) ), new Face(this.vertices, 62 + (i * 33) , 63 + (i * 33) , 70 + (i * 33) ), new Face(this.vertices, 59 + (i * 33) , 64 + (i * 33) , 71 + (i * 33) ), new Face(this.vertices, 50 + (i * 33) , 59 + (i * 33) , 65 + (i * 33) ), new Face(this.vertices, 52 + (i * 33) , 61 + (i * 33) , 64 + (i * 33) ), new Face(this.vertices, 50 + (i * 33) , 55 + (i * 33) , 64 + (i * 33) ), new Face(this.vertices, 53 + (i * 33) , 54 + (i * 33) , 63 + (i * 33) ), new Face(this.vertices, 74 + (i * 33) , 72 + (i * 33) , 58 + (i * 33) ), new Face(this.vertices, 74 + (i * 33) , 71 + (i * 33) , 68 + (i * 33) ), new Face(this.vertices, 69 + (i * 33) , 70 + (i * 33) , 74 + (i * 33) ), new Face(this.vertices, 67 + (i * 33) , 72 + (i * 33) , 74 + (i * 33) ), new Face(this.vertices, 61 + (i * 33) , 66 + (i * 33) , 73 + (i * 33) ), new Face(this.vertices, 60 + (i * 33) , 65 + (i * 33) , 72 + (i * 33) ), new Face(this.vertices, 59 + (i * 33) , 58 + (i * 33) , 72 + (i * 33) ), new Face(this.vertices, 61 + (i * 33) , 68 + (i * 33) , 71 + (i * 33) ));   
        console.log(this.faces);
      }
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.amountTreetop = this.amountTreetop;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.amountTreetop = _serialization.amountTreetop;
      this.create(this.amountTreetop);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.amountTreetop);
    }
    
  }
}