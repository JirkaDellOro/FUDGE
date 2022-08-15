namespace FudgeCore {
  
  export class MeshBanana extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshBanana);

    private bananaEndLength: number = 0;
    
    public constructor(_name: string = "MeshBanana", _bananaEndLength: number= 0) {
      super(_name); 
      this.create(_bananaEndLength);
      
    }
       
    public create(_bananaEndLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
       new Vertex(new Vector3(-0.044330, -0.237870, 0.020977), new Vector2(0.774469, 0.595233)),
       new Vertex(new Vector3(-0.033807, 0.191841, 0.003843), new Vector2(0.281834, 0.682462)),
       new Vertex(new Vector3(-0.044330, -0.237870, -0.020977), new Vector2(0.591567, 0.759229)),
       new Vertex(new Vector3(-0.033807, 0.191841, -0.003843), new Vector2(0.686206, 0.634320)),
       new Vertex(new Vector3(-0.010232, -0.275985, 0.026941), new Vector2(0.541413, 0.080821)),
       new Vertex(new Vector3(-0.029611, 0.198280, 0.003843), new Vector2(0.585530, 0.759135)),
       new Vertex(new Vector3(-0.010232, -0.275985, -0.026941), new Vector2(0.634124, 0.707110)),
       new Vertex(new Vector3(-0.029611, 0.198280, -0.003843), new Vector2(0.225626, 0.740868)),
       new Vertex(new Vector3(-0.028857, -0.254352, -0.035776), new Vector2(0.586505, 0.769906)),
       new Vertex(new Vector3(-0.031709, 0.195061, -0.005764), new Vector2(0.696685, 0.633753)),
       new Vertex(new Vector3(-0.028857, -0.254352, 0.035776), new Vector2(0.959354, 0.113131)),
       new Vertex(new Vector3(-0.031709, 0.195061, 0.005764), new Vector2(0.486119, 0.025075)),
       new Vertex(new Vector3(-0.051098, -0.231560, 0.000000), new Vector2(0.580468, 0.769813)),
       new Vertex(new Vector3(-0.034856, 0.190231, -0.000000), new Vector2(0.686249, 0.595233)),
       new Vertex(new Vector3(0.001928, -0.289236, 0.000000), new Vector2(0.506908, 0.056658)),
       new Vertex(new Vector3(-0.028562, 0.199890, -0.000000), new Vector2(0.691733, 0.595294)),
       new Vertex(new Vector3(0.008666, -0.178958, 0.032117), new Vector2(0.581490, 0.764450)),
       new Vertex(new Vector3(0.045840, -0.073866, 0.041399), new Vector2(0.260790, 0.712844)),
       new Vertex(new Vector3(0.046088, 0.022907, 0.038718), new Vector2(0.703430, 0.633916)),
       new Vertex(new Vector3(-0.010602, 0.150126, 0.019627), new Vector2(0.590545, 0.764591)),
       new Vertex(new Vector3(-0.010602, 0.150126, -0.019627), new Vector2(0.691837, 0.635325)),
       new Vertex(new Vector3(0.046088, 0.022907, -0.038718), new Vector2(0.808817, 0.589905)),
       new Vertex(new Vector3(0.045840, -0.073866, -0.041399), new Vector2(0.567804, 0.090149)),
       new Vertex(new Vector3(0.008666, -0.178958, -0.032117), new Vector2(0.285699, 0.664405)),
       new Vertex(new Vector3(0.028912, 0.173206, -0.024025), new Vector2(0.679461, 0.635092)),
       new Vertex(new Vector3(0.125021, 0.049724, -0.041593), new Vector2(0.589813, 0.756512)),
       new Vertex(new Vector3(0.131519, -0.071099, -0.041975), new Vector2(0.679461, 0.702395)),
       new Vertex(new Vector3(0.103217, -0.193473, -0.040739), new Vector2(0.195225, 0.748878)),
       new Vertex(new Vector3(0.028911, 0.173206, 0.024025), new Vector2(0.909753, 0.100629)),
       new Vertex(new Vector3(0.125021, 0.049724, 0.041593), new Vector2(0.679461, 0.595294)),
       new Vertex(new Vector3(0.131519, -0.071099, 0.041975), new Vector2(0.691734, 0.633916)),
       new Vertex(new Vector3(0.103217, -0.193473, 0.040739), new Vector2(0.582221, 0.772529)),
       new Vertex(new Vector3(0.007525, 0.160182, 0.032707), new Vector2(0.720137, 0.541811)),
       new Vertex(new Vector3(0.084611, 0.035190, 0.060400), new Vector2(0.214229, 0.594297)),
       new Vertex(new Vector3(0.089544, -0.071099, 0.062962), new Vector2(0.681557, 0.414400)),
       new Vertex(new Vector3(0.053921, -0.182930, 0.055372), new Vector2(0.177634, 0.436069)),
       new Vertex(new Vector3(0.007525, 0.160182, -0.032707), new Vector2(0.191928, 0.287708)),
       new Vertex(new Vector3(0.084611, 0.035190, -0.060400), new Vector2(0.687453, 0.279888)),
       new Vertex(new Vector3(0.089544, -0.071099, -0.062962), new Vector2(0.760172, 0.073009)),
       new Vertex(new Vector3(0.053921, -0.182930, -0.055372), new Vector2(0.537036, 0.696210)),
       new Vertex(new Vector3(0.040825, 0.180863, 0.000000), new Vector2(0.431205, 0.502860)),
       new Vertex(new Vector3(0.144820, 0.058455, 0.000000), new Vector2(0.419294, 0.350385)),
       new Vertex(new Vector3(0.152506, -0.071099, 0.000000), new Vector2(0.466388, 0.180236)),
       new Vertex(new Vector3(0.127052, -0.201297, -0.000000), new Vector2(0.927119, 0.819766)),
       new Vertex(new Vector3(-0.018465, 0.146157, -0.000000), new Vector2(0.881277, 0.584052)),
       new Vertex(new Vector3(0.027062, 0.019662, -0.000000), new Vector2(0.936340, 0.454758)),
       new Vertex(new Vector3(0.022418, -0.079093, 0.000000), new Vector2(0.897851, 0.454758)),
       new Vertex(new Vector3(-0.010672, -0.178520, 0.000000), new Vector2(0.328836, 0.169352)),
       new Vertex(new Vector3(-0.078988, -0.259131, 0.013697), new Vector2(0.908600, 0.324500)),
       new Vertex(new Vector3(-0.078988, -0.259131, -0.013697), new Vector2(0.237232, 0.053913)),
       new Vertex(new Vector3(-0.078042, -0.286508, 0.013697), new Vector2(0.076480, 0.243272)),
       new Vertex(new Vector3(-0.078042, -0.286508, -0.013697), new Vector2(0.047155, 0.426831)),
       new Vertex(new Vector3(-0.078515, -0.272820, -0.020545), new Vector2(0.070261, 0.614206)),
       new Vertex(new Vector3(-0.078515, -0.272820, 0.020545), new Vector2(0.808817, 0.272821)),
       new Vertex(new Vector3(-0.079224, -0.252287, 0.000000), new Vector2(0.270971, 0.078714)),
       new Vertex(new Vector3(-0.077806, -0.293353, 0.000000), new Vector2(0.728507, 0.065454)),
       new Vertex(new Vector3(-0.091341, -0.272820, 0.000000), new Vector2(0.142717, 0.275826)),
       new Vertex(new Vector3(-0.037650, 0.185944, -0.000000), new Vector2(0.628404, 0.278837)),
       new Vertex(new Vector3(-0.035670, 0.188983, -0.007255), new Vector2(0.118915, 0.438293)),
       new Vertex(new Vector3(-0.031709, 0.195061, -0.010882), new Vector2(0.618494, 0.429986)),
       new Vertex(new Vector3(-0.027748, 0.201139, -0.007255), new Vector2(0.152653, 0.607393)),
       new Vertex(new Vector3(-0.025768, 0.204177, -0.000000), new Vector2(0.503034, 0.714204)),
       new Vertex(new Vector3(-0.027748, 0.201139, 0.007255), new Vector2(0.960569, 0.823278)),
       new Vertex(new Vector3(-0.031709, 0.195061, 0.010882), new Vector2(0.362798, 0.526862)),
       new Vertex(new Vector3(-0.035670, 0.188983, 0.007255), new Vector2(0.945641, 0.599373)),
       new Vertex(new Vector3(-0.053433, 0.206876, 0.001961), new Vector2(0.963752, 0.485040)),
       new Vertex(new Vector3(-0.053433, 0.206876, -0.001961), new Vector2(0.342900, 0.360064)),
       new Vertex(new Vector3(-0.051292, 0.210162, 0.001961), new Vector2(1.000000, 0.416776)),
       new Vertex(new Vector3(-0.051292, 0.210162, -0.001961), new Vector2(0.385839, 0.179479)),
       new Vertex(new Vector3(-0.052362, 0.208519, -0.002942), new Vector2(0.975562, 0.281715)),
       new Vertex(new Vector3(-0.052362, 0.208519, 0.002942), new Vector2(0.884335, 0.830313)),
       new Vertex(new Vector3(-0.053968, 0.206055, -0.000000), new Vector2(0.211631, 0.031367)),
       new Vertex(new Vector3(-0.050756, 0.210984, -0.000000), new Vector2(0.808817, 0.598587)),
       new Vertex(new Vector3(-0.052362, 0.208519, -0.000000), new Vector2(0.032691, 0.211174))
      );
        this.faces = [
        new Face(this.vertices, 44, 58, 20),
        new Face(this.vertices, 36, 60, 24),
        new Face(this.vertices, 61, 28, 40),
        new Face(this.vertices, 63, 19, 32),
        new Face(this.vertices, 12, 49, 54),
        new Face(this.vertices, 5, 72, 67),
        new Face(this.vertices, 3, 69, 9),
        new Face(this.vertices, 12, 48, 0),
        new Face(this.vertices, 62, 32, 28),
        new Face(this.vertices, 20, 59, 36),
        new Face(this.vertices, 4, 55, 14),
        new Face(this.vertices, 1, 71, 13),
        new Face(this.vertices, 7, 69, 68),
        new Face(this.vertices, 2, 52, 49),
        new Face(this.vertices, 24, 61, 40),
        new Face(this.vertices, 64, 44, 19),
        new Face(this.vertices, 0, 47, 12),
        new Face(this.vertices, 16, 46, 47),
        new Face(this.vertices, 17, 45, 46),
        new Face(this.vertices, 19, 45, 18),
        new Face(this.vertices, 27, 14, 6),
        new Face(this.vertices, 26, 43, 27),
        new Face(this.vertices, 25, 42, 26),
        new Face(this.vertices, 25, 40, 41),
        new Face(this.vertices, 23, 8, 2),
        new Face(this.vertices, 22, 39, 23),
        new Face(this.vertices, 21, 38, 22),
        new Face(this.vertices, 21, 36, 37),
        new Face(this.vertices, 4, 35, 10),
        new Face(this.vertices, 31, 34, 35),
        new Face(this.vertices, 30, 33, 34),
        new Face(this.vertices, 28, 33, 29),
        new Face(this.vertices, 10, 16, 0),
        new Face(this.vertices, 35, 17, 16),
        new Face(this.vertices, 34, 18, 17),
        new Face(this.vertices, 32, 18, 33),
        new Face(this.vertices, 14, 31, 4),
        new Face(this.vertices, 43, 30, 31),
        new Face(this.vertices, 42, 29, 30),
        new Face(this.vertices, 40, 29, 41),
        new Face(this.vertices, 39, 6, 8),
        new Face(this.vertices, 38, 27, 39),
        new Face(this.vertices, 37, 26, 38),
        new Face(this.vertices, 37, 24, 25),
        new Face(this.vertices, 47, 2, 12),
        new Face(this.vertices, 46, 23, 47),
        new Face(this.vertices, 45, 22, 46),
        new Face(this.vertices, 45, 20, 21),
        new Face(this.vertices, 56, 50, 53),
        new Face(this.vertices, 56, 48, 54),
        new Face(this.vertices, 49, 56, 54),
        new Face(this.vertices, 51, 56, 52),
        new Face(this.vertices, 6, 55, 51),
        new Face(this.vertices, 0, 53, 10),
        new Face(this.vertices, 8, 51, 52),
        new Face(this.vertices, 10, 50, 4),
        new Face(this.vertices, 13, 58, 57),
        new Face(this.vertices, 9, 60, 59),
        new Face(this.vertices, 15, 62, 61),
        new Face(this.vertices, 11, 64, 63),
        new Face(this.vertices, 9, 58, 3),
        new Face(this.vertices, 11, 62, 5),
        new Face(this.vertices, 13, 64, 1),
        new Face(this.vertices, 15, 60, 7),
        new Face(this.vertices, 73, 65, 70),
        new Face(this.vertices, 73, 67, 72),
        new Face(this.vertices, 68, 73, 72),
        new Face(this.vertices, 66, 73, 69),
        new Face(this.vertices, 3, 71, 66),
        new Face(this.vertices, 7, 72, 15),
        new Face(this.vertices, 5, 70, 11),
        new Face(this.vertices, 1, 70, 65),
        new Face(this.vertices, 44, 57, 58),
        new Face(this.vertices, 36, 59, 60),
        new Face(this.vertices, 61, 62, 28),
        new Face(this.vertices, 63, 64, 19),
        new Face(this.vertices, 12, 2, 49),
        new Face(this.vertices, 5, 15, 72),
        new Face(this.vertices, 3, 66, 69),
        new Face(this.vertices, 12, 54, 48),
        new Face(this.vertices, 62, 63, 32),
        new Face(this.vertices, 20, 58, 59),
        new Face(this.vertices, 4, 50, 55),
        new Face(this.vertices, 1, 65, 71),
        new Face(this.vertices, 7, 9, 69),
        new Face(this.vertices, 2, 8, 52),
        new Face(this.vertices, 24, 60, 61),
        new Face(this.vertices, 64, 57, 44),
        new Face(this.vertices, 0, 16, 47),
        new Face(this.vertices, 16, 17, 46),
        new Face(this.vertices, 17, 18, 45),
        new Face(this.vertices, 19, 44, 45),
        new Face(this.vertices, 27, 43, 14),
        new Face(this.vertices, 26, 42, 43),
        new Face(this.vertices, 25, 41, 42),
        new Face(this.vertices, 25, 24, 40),
        new Face(this.vertices, 23, 39, 8),
        new Face(this.vertices, 22, 38, 39),
        new Face(this.vertices, 21, 37, 38),
        new Face(this.vertices, 21, 20, 36),
        new Face(this.vertices, 4, 31, 35),
        new Face(this.vertices, 31, 30, 34),
        new Face(this.vertices, 30, 29, 33),
        new Face(this.vertices, 28, 32, 33),
        new Face(this.vertices, 10, 35, 16),
        new Face(this.vertices, 35, 34, 17),
        new Face(this.vertices, 34, 33, 18),
        new Face(this.vertices, 32, 19, 18),
        new Face(this.vertices, 14, 43, 31),
        new Face(this.vertices, 43, 42, 30),
        new Face(this.vertices, 42, 41, 29),
        new Face(this.vertices, 40, 28, 29),
        new Face(this.vertices, 39, 27, 6),
        new Face(this.vertices, 38, 26, 27),
        new Face(this.vertices, 37, 25, 26),
        new Face(this.vertices, 37, 36, 24),
        new Face(this.vertices, 47, 23, 2),
        new Face(this.vertices, 46, 22, 23),
        new Face(this.vertices, 45, 21, 22),
        new Face(this.vertices, 45, 44, 20),
        new Face(this.vertices, 56, 55, 50),
        new Face(this.vertices, 56, 53, 48),
        new Face(this.vertices, 49, 52, 56),
        new Face(this.vertices, 51, 55, 56),
        new Face(this.vertices, 6, 14, 55),
        new Face(this.vertices, 0, 48, 53),
        new Face(this.vertices, 8, 6, 51),
        new Face(this.vertices, 10, 53, 50),
        new Face(this.vertices, 13, 3, 58),
        new Face(this.vertices, 9, 7, 60),
        new Face(this.vertices, 15, 5, 62),
        new Face(this.vertices, 11, 1, 64),
        new Face(this.vertices, 9, 59, 58),
        new Face(this.vertices, 11, 63, 62),
        new Face(this.vertices, 13, 57, 64),
        new Face(this.vertices, 15, 61, 60),
        new Face(this.vertices, 73, 71, 65),
        new Face(this.vertices, 73, 70, 67),
        new Face(this.vertices, 68, 69, 73),
        new Face(this.vertices, 66, 71, 73),
        new Face(this.vertices, 3, 13, 71),
        new Face(this.vertices, 7, 68, 72),
        new Face(this.vertices, 5, 67, 70),
        new Face(this.vertices, 1, 11, 70)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.bananaEndLength = this.bananaEndLength;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.bananaEndLength = _serialization.bananaEndLength;
      this.create(this.bananaEndLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.bananaEndLength);
    }
    
  }
}