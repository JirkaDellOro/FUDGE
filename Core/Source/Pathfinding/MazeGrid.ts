namespace FudgeCore {
    export class MazeGrid extends Maze {
        constructor(_length: number, _width: number) {
          super(MazeGrid.create(_length, _width));
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
          MazeGrid.create(nodes.x, nodes.y);
          for (let x = 0; x < this.nodes.length; ++x) {
            for (let z = 0; z < this.nodes[x].length; ++z) {
              this.addChild(this.nodes[x][0][z]);
            }
          }
          return this;
        }
    
        public static create(_width: number, _length: number): MazeNode[][][]{
          let tmp: MazeNode[][][] = [];
          for (let i = 0; i < _width; ++i) {
            tmp[i] = [];
            tmp[i][0] = [];
            for (let j = 0; j < _length; ++j) {
              tmp[i][0].push(new MazeNode(i, 0, j));
            }
          }
          return tmp;
        }
    
        public addNeighbors() {
          for (let i = 0; i < this.nodes.length; ++i) { //Add neighbors
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
            }
          }
        }
      }
}