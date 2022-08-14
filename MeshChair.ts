namespace FudgeCore {

    export class MeshChair extends MeshMutable {
        public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshChair);

        private leanTranslation: Vector3 = new Vector3(0, 0, 0);
        private leanRotation: Vector3 = Vector3.ZERO();
        private leanScaling: Vector3 = new Vector3(1, 0.3, 1);

        private seatTranslation: Vector3 = new Vector3(0, 0, 0);
        private seatRotation: Vector3 = Vector3.ZERO();
        private seatScaling: Vector3 = new Vector3(1, 0.3, 1);

        private legsTranslation: Vector3 = new Vector3(0, 0, 0);
        private legsRotation: Vector3 = Vector3.ZERO();
        private legsScaling: Vector3 = Vector3.ONE(1);

        public constructor(_name: string = "MeshTest") {
            super(_name);
            this.create(this.leanTranslation, this.leanRotation, this.leanScaling, this.seatTranslation, this.seatRotation, this.seatScaling, this.legsTranslation, this.legsRotation, this.legsScaling);
        }

        public create(_leanTranslation: Vector3, _leanRotation: Vector3, _leanScaling: Vector3, _seatTranslation: Vector3, _seatRotation: Vector3, _seatScaling: Vector3, _legsTranslation: Vector3, _legsRotation: Vector3, _legsScaling: Vector3): void {
            this.clear();

            // _leanTranslation.y = _seatTranslation.y + _seatScaling.y / 2 + _leanScaling.y / 2;
            // _seatTranslation.y = _seatTranslation.y - _seatScaling.y / 2 - _legsScaling.y / 2;

            this.vertices = new Vertices(
                //seat
                new Vertex(new Vector3(_seatRotation.x + (_seatScaling.x / 2), _seatTranslation.y + (_seatScaling.y / 2), _seatScaling.z - (_seatScaling.z / 2)), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(_seatRotation.x + (_seatScaling.x / 2), _seatTranslation.y - (_seatScaling.y / 2), _seatScaling.z - (_seatScaling.z / 2)), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(_seatRotation.x + (_seatScaling.x / 2), _seatTranslation.y + (_seatScaling.y / 2), _seatScaling.z + (_seatScaling.z / 2)), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(_seatRotation.x + (_seatScaling.x / 2), _seatTranslation.y - (_seatScaling.y / 2), _seatScaling.z + (_seatScaling.z / 2)), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(_seatRotation.x - (_seatScaling.x / 2), _seatTranslation.y + (_seatScaling.y / 2), _seatScaling.z - (_seatScaling.z / 2)), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(_seatRotation.x - (_seatScaling.x / 2), _seatTranslation.y - (_seatScaling.y / 2), _seatScaling.z - (_seatScaling.z / 2)), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(_seatRotation.x - (_seatScaling.x / 2), _seatTranslation.y + (_seatScaling.y / 2), _seatScaling.z + (_seatScaling.z / 2)), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(_seatRotation.x - (_seatScaling.x / 2), _seatTranslation.y - (_seatScaling.y / 2), _seatScaling.z + (_seatScaling.z / 2)), new Vector2(0.375000, 0.250000)),
                //lean
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z - (_leanScaling.z / 2)), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z + (_leanScaling.z / 2)), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z - (_leanScaling.z / 2)), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z + (_leanScaling.z / 2)), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z + (_leanScaling.z / 2)), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z + (_leanScaling.z / 2)), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z - (_leanScaling.z / 2)), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(_leanRotation.x - (_leanScaling.x / 2), _leanTranslation.y + (_leanScaling.y / 2), _leanScaling.z - (_leanScaling.z / 2)), new Vector2(0.625000, 0.750000)),

                new Vertex(new Vector3(0.909759, -0.150814, -0.909759), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(0.909759, -0.150814, -0.590241), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(0.590241, -0.150814, -0.909759), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(0.590241, -0.150814, -0.590241), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(0.909759, -0.150814, 0.590241), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(0.909759, -0.150814, 0.909759), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(0.590241, -0.150814, 0.590241), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(0.590241, -0.150814, 0.909759), new Vector2(0.375000, 0.750000)),

                new Vertex(new Vector3(-0.590241, -0.150814, 0.590241), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-0.590241, -0.150814, 0.909759), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.909759, -0.150814, 0.590241), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-0.909759, -0.150814, 0.909759), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.590241, -0.150814, -0.909759), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-0.590241, -0.150814, -0.590241), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-0.909759, -0.150814, -0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.909759, -0.150814, -0.590241), new Vector2(undefined, undefined)),

                new Vertex(new Vector3(0.590241, -1.000000, -0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.590241, -1.000000, -0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.909759, -1.000000, -0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.909759, -1.000000, -0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.590241, -1.000000, 0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.590241, -1.000000, 0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.909759, -1.000000, 0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(0.909759, -1.000000, 0.909759), new Vector2(undefined, undefined)),
                
                new Vertex(new Vector3(-0.909759, -1.000000, 0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.909759, -1.000000, 0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.590241, -1.000000, 0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.590241, -1.000000, 0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.909759, -1.000000, -0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.909759, -1.000000, -0.590241), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.590241, -1.000000, -0.909759), new Vector2(undefined, undefined)),
                new Vertex(new Vector3(-0.590241, -1.000000, -0.590241), new Vector2(undefined, undefined)),

            );

            this.faces = [
                new Face(this.vertices, 4, 2, 0),
                new Face(this.vertices, 2, 7, 3),
                new Face(this.vertices, 6, 5, 7),
                new Face(this.vertices, 1, 7, 5),
                new Face(this.vertices, 0, 3, 1),
                new Face(this.vertices, 4, 1, 5),
                new Face(this.vertices, 9, 10, 8),
                new Face(this.vertices, 15, 12, 14),
                new Face(this.vertices, 11, 15, 10),
                new Face(this.vertices, 9, 13, 11),
                new Face(this.vertices, 10, 14, 8),
                new Face(this.vertices, 8, 12, 9),
                new Face(this.vertices, 19, 16, 18),
                new Face(this.vertices, 23, 20, 22),
                new Face(this.vertices, 27, 24, 26),
                new Face(this.vertices, 31, 28, 30),
                new Face(this.vertices, 34, 33, 32),
                new Face(this.vertices, 38, 37, 36),
                new Face(this.vertices, 42, 41, 40),
                new Face(this.vertices, 46, 45, 44),
                new Face(this.vertices, 20, 36, 22),
                new Face(this.vertices, 28, 44, 30),
                new Face(this.vertices, 23, 39, 21),
                new Face(this.vertices, 31, 47, 29),
                new Face(this.vertices, 21, 38, 20),
                new Face(this.vertices, 18, 33, 19),
                new Face(this.vertices, 29, 46, 28),
                new Face(this.vertices, 26, 41, 27),
                new Face(this.vertices, 16, 32, 18),
                new Face(this.vertices, 24, 40, 26),
                new Face(this.vertices, 19, 35, 17),
                new Face(this.vertices, 27, 43, 25),
                new Face(this.vertices, 17, 34, 16),
                new Face(this.vertices, 25, 42, 24),
                new Face(this.vertices, 22, 37, 23),
                new Face(this.vertices, 30, 45, 31),
                new Face(this.vertices, 4, 6, 2),
                new Face(this.vertices, 2, 6, 7),
                new Face(this.vertices, 6, 4, 5),
                new Face(this.vertices, 1, 3, 7),
                new Face(this.vertices, 0, 2, 3),
                new Face(this.vertices, 4, 0, 1),
                new Face(this.vertices, 9, 11, 10),
                new Face(this.vertices, 15, 13, 12),
                new Face(this.vertices, 11, 13, 15),
                new Face(this.vertices, 9, 12, 13),
                new Face(this.vertices, 10, 15, 14),
                new Face(this.vertices, 8, 14, 12),
                new Face(this.vertices, 19, 17, 16),
                new Face(this.vertices, 23, 21, 20),
                new Face(this.vertices, 27, 25, 24),
                new Face(this.vertices, 31, 29, 28),
                new Face(this.vertices, 34, 35, 33),
                new Face(this.vertices, 38, 39, 37),
                new Face(this.vertices, 42, 43, 41),
                new Face(this.vertices, 46, 47, 45),
                new Face(this.vertices, 20, 38, 36),
                new Face(this.vertices, 28, 46, 44),
                new Face(this.vertices, 23, 37, 39),
                new Face(this.vertices, 31, 45, 47),
                new Face(this.vertices, 21, 39, 38),
                new Face(this.vertices, 18, 32, 33),
                new Face(this.vertices, 29, 47, 46),
                new Face(this.vertices, 26, 40, 41),
                new Face(this.vertices, 16, 34, 32),
                new Face(this.vertices, 24, 42, 40),
                new Face(this.vertices, 19, 33, 35),
                new Face(this.vertices, 27, 41, 43),
                new Face(this.vertices, 17, 35, 34),
                new Face(this.vertices, 25, 43, 42),
                new Face(this.vertices, 22, 36, 37),
                new Face(this.vertices, 30, 44, 45),
            ];

        }
        public serialize(): Serialization {
            let serialization: Serialization = super.serialize();
            serialization.leanTranslation = this.leanTranslation;
            serialization.leanRotation = this.leanRotation;
            serialization.leanScaling = this.leanScaling;
            serialization.seatTranslation = this.seatTranslation;
            serialization.seatRotation = this.seatRotation;
            serialization.seatScaling = this.seatScaling;
            serialization.legsTranslation = this.legsTranslation;
            serialization.legsRotation = this.legsRotation;
            serialization.legsScaling = this.legsScaling;

            return serialization;
        }
        public async deserialize(_serialization: Serialization): Promise<Serializable> {
            await super.deserialize(_serialization);
            this.leanTranslation = _serialization.leanTranslation;
            this.leanRotation = _serialization.leanRotation;
            this.leanScaling = _serialization.leanScaling;
            this.seatTranslation = _serialization.seatTranslation;
            this.seatRotation = _serialization.seatRotation;
            this.seatScaling = _serialization.seatScaling;
            this.legsTranslation = _serialization.legsTranslation;
            this.legsRotation = _serialization.legsRotation;
            this.legsScaling = _serialization.legsScaling;

            this.create(this.leanTranslation, this.leanRotation, this.leanScaling, this.seatTranslation, this.seatRotation, this.seatScaling, this.legsTranslation, this.legsRotation, this.legsScaling);

            return this;
        }

        public async mutate(_mutator: Mutator): Promise<void> {
            super.mutate(_mutator);
            this.create(this.leanTranslation, this.leanRotation, this.leanScaling, this.seatTranslation, this.seatRotation, this.seatScaling, this.legsTranslation, this.legsRotation, this.legsScaling);
        }
    }
}