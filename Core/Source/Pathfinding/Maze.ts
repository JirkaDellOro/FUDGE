namespace FudgeCore{
    export class Maze extends Node {
        public idResource: string = undefined;
        public type: string = "Maze";
    
        public nodes: MazeNode[][][];
        private static index: number = 0;
    
        constructor(_nodes: Array<Array<Array<MazeNode>>>) {
          super("Maze " + Maze.index);
          Maze.index++;
          this.addComponent(new ComponentTransform());
          this.nodes = _nodes;
          for (let x = 0; x < this.nodes.length; ++x) {
            for (let y = 0; y < this.nodes[x].length; ++y) {
              for (let z = 0; z < this.nodes[x][y].length; ++z) {
                this.addChild(this.nodes[x][y][z]);
              }
            }
          }
        }
    
        public serialize(): Serialization {
          let serialization: Serialization = super.serialize();
          let tmp: string[][][];
          for (let x = 0; x < this.nodes.length; ++x) {
            for (let y = 0; x < this.nodes[x].length; ++y) {
              for (let z = 0; x < this.nodes[x][y].length; ++z) {
                tmp[x][y].push(this.nodes[x][y][z].name);
              }
            }
          }
          serialization.nodes = tmp;
          return serialization;
        }
    
        public async deserialize(_serialization: Serialization): Promise<Serializable> {
          await super.deserialize(_serialization);
          let tmp: MazeNode[][][];
          for (let x = 0; x < _serialization.nodes.length; ++x) {
            for (let y = 0; y < _serialization.nodes[x].length; ++y) {
              for (let z = 0; z < _serialization.nodes[x][y].length; ++z) {
                tmp[x][y].push(<MazeNode>this.getChildrenByName(_serialization.nodes[x][y][z])[0]);
              }
            }
          }
          this.nodes = tmp;
          return this;
        }
    
        public addNode(_n: MazeNode) {
          this.nodes[0][0].push(_n);
          this.addChild(_n);
        }
    
        public aStar(_start: MazeNode, _end: MazeNode): MazeNode[] {
          let openList: MazeNode[] = [];
          let closedList: MazeNode[] = [];
          let path: MazeNode[] = [];
          openList.push(_start);
    
          while (openList.length > 0) {
            // Sort the open list by F value
            openList.sort((node1, node2) => node1.totalCost - node2.totalCost);
    
            // Get the node with the lowest F value
            const currentNode = openList.shift();
    
            // Add the current node to the closed list
            closedList.push(currentNode);
    
            // If we have reached the end node, return the path
            if (currentNode === _end) {
              let tmp = currentNode;
              path.push(tmp);
              while (tmp.previousNode) {
                path.push(tmp.previousNode);
                tmp = tmp.previousNode;
              }
              console.log("DONE!");
              // return the traced path
              return path.reverse();
            }
    
            // Get a list of all the adjacent nodes
            const neighbors = currentNode.getNeighbors();
    
            for (const neighbor of neighbors) {
              // Skip nodes that are already in the closed list or Node is not walkable at this time
              if (closedList.includes(neighbor) || !neighbor.walkable) {
                continue;
              }
    
              // Calculate the G value for the neighbor
              const gValue = currentNode.currentCost + currentNode.getCost(neighbor);
    
              // Check if the neighbor is not in the open list, or if the new G value is lower than the previous G value
              if (!openList.includes(neighbor) || gValue < neighbor.currentCost) {
                // Update the neighbor's G and F values
                neighbor.currentCost = gValue;
                neighbor.totalCost = gValue + _end.estimateDistance(neighbor);
    
                // Set the neighbor's previousNode to the current node
                neighbor.previousNode = currentNode;
    
                // Add the neighbor to the open list if it's not already there
                if (!openList.includes(neighbor)) {
                  openList.push(neighbor);
                }
              }
            }
          }
    
          // returns empty array in case no path was found
          return [];
        }
      }
}