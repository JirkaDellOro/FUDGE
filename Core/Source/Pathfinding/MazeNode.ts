namespace FudgeCore{
    export class MazeNode extends Node {
        public idResource: string = undefined;
        public type: string = "MazeNode";
    
        private static index: number = 0;
        public currentCost: number = 0; //Cost from start to this node
        public totalCost: number = 0; //currentCost + estimated
        public walkable: boolean;
        public difficulty: number;
        public neighbors: Array<string> = [];
        public previousNode: MazeNode;
    
        constructor(_x: number, _y: number, _z: number, _walk: boolean = true, _dif = 0, _neighbors?: Array<string>) {
          super("MazeNode " + MazeNode.index);
          this.idResource = this.name;
          this.create(_walk, _dif, _neighbors);
          this.addComponent(new ComponentTransform());
          this.mtxLocal.translate(new Vector3(_x, _y, _z));
        }
    
        public create(_walk: boolean, _dif: number, _neighbors?: Array<string>) {
          MazeNode.index++;
          this.walkable = _walk;
          this.difficulty = _dif;
        }
    
        public serialize(): Serialization {
          let serialization: Serialization = super.serialize();
          serialization.walkable = this.walkable;
          serialization.difficulty = this.difficulty;
          serialization.neighbors = this.neighbors;
          return serialization;
        }
    
        public async deserialize(_serialization: Serialization): Promise<Serializable> {
          await super.deserialize(_serialization);
          this.create(_serialization.walkable, _serialization.difficulty, _serialization.neighbors);
          return this;
        }
    
        public addNeighborFromNode(_n: MazeNode) { // Both nodes add each other as neighbors
          if (!this.neighbors.includes(_n.name) && !_n.neighbors.includes(this.name)) {
            this.neighbors.push(_n.name);
            _n.neighbors.push(this.name);
          }
        }
    
        public addNeighborFromName(_id: string) { // searches for MazeNode in same Maze then add each other as neighbor
          let tmp: MazeNode = <MazeNode>this.getParent().getChildrenByName(_id)[0];
          this.addNeighborFromNode(tmp);
        }
    
        public estimateDistance(_b: MazeNode): number {
          // Calculate the Euclidean distance between the two nodes
          const a = this.mtxLocal.translation;
          const b = _b.mtxLocal.translation;
          return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z));
        }
    
        public getCost(_b: MazeNode): number {
          return this.mtxLocal.translation.getDistance(_b.mtxLocal.translation) + this.difficulty + _b.difficulty;
        }
    
        public getNeighbors(): Array<MazeNode> {
          let tmp: Array<MazeNode> = [];
          for (const neighbor of this.neighbors) {
            tmp.push(this.getNeighbor(neighbor));
          }
          return tmp;
        }
    
        public getNeighbor(_n: string): MazeNode {
          return <MazeNode>this.getParent().getChildrenByName(_n)[0];
        }
      }
}