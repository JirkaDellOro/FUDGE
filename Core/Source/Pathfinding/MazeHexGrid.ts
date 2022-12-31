namespace FudgeCore {
    export class MazeHexGrid extends Maze {
        constructor(_length: number, _width: number) {
          super(MazeHexGrid.create(_length, _width));
          this.addNeighbors();
        }
    
        public serialize(): Serialization {
          this.removeAllChildren();
          let serialization: Serialization = super.serialize();
          serialization.nodes = new Vector2(this.nodes.length, this.nodes[0][0].length).serialize();
          return serialization;
        }
    
        public async deserialize(_serialization: Serialization): Promise<Serializable> {
          await super.deserialize(_serialization);
          let nodes: Vector2 = new Vector2();
          nodes = await nodes.deserialize(_serialization.nodes);
          MazeHexGrid.create(nodes.x, nodes.y);
          for (let x = 0; x < this.nodes.length; ++x) {
            for (let z = 0; z < this.nodes[x].length; ++z) {
              this.addChild(this.nodes[x][0][z]);
            }
          }
          return this;
        }
    
        public static create(_width: number, _length: number): MazeNode[][][] {
          let tmp: MazeNode[][][];
          for (let i = 0; i < _width; ++i) {
            for (let j = 0; j < _length; ++j) {
              if ((j % 2) === 1) {
                tmp[i][0][j] = new MazeNode(i, 0, j);
              } else {
                tmp[i][0][j] = new MazeNode(i, 0, (j + 0.5));
              }
    
            }
          }
          return tmp;
        }
    
        public addNeighbors() {
          for (let i = 0; i < this.nodes.length; ++i) { //Add neighbours
            for (let j = 0; j < this.nodes[i][0].length; ++j) {
              if (i < this.nodes.length - 1) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i + 1][0][j]);
              }
              if (i > 0) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i - 1][0][j]);
              }
              if (j < this.nodes[i][0].length - 1) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i][0][j + 1]);
              }
              if (j > 0) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i][0][j - 1]);
              }
              if (i > 0 && j > 0) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i - 1][0][j - 1]);
              }
              if (i < this.nodes.length - 1 && j < this.nodes[i][0].length - 1) {
                this.nodes[i][0][j].addNeighborFromNode(this.nodes[i + 1][0][j + 1]);
              }
            }
          }
        }
      }
}