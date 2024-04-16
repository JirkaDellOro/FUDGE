namespace FudgeCore {
  /**
   * Enables this node to access the waypoint grid established through {@link ComponentWaypoint}s and their {@link Connection}s,
   * find a path through them and even walk down the path.
   * @author Lukas Scheuerle, HFU, 2024
   */
  export class ComponentWalker extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentWalker);
    /** The speed the walker should move with. Corresponds to units/s. */
    public speed: number = 1;
    /** If true, move the node this component is attached to through forces instead of directly through the transform. Requires a [[ComponentRigidbody]] if true. */
    // public moveThroughPhysics: boolean = false;

    /** keeps the data needed for the current walk */
    #walkData: WalkData = { path: [], totalProgress: -1 };
    /** keeps the promise to resolve when the walker has reached the goal */
    #promiseResolverOnWalkFinished: () => void;
    /** status of whether it should rotate the walker to the walking direction */
    #rotateInWalkDirection: boolean = false;


    public constructor() {
      super();

      if (Project.mode == MODE.EDITOR)
        return;
      this.addEventListener(EVENT.COMPONENT_ADD, this.#handleAttach.bind(this));
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.#handleDetach.bind(this));
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        [super.constructor.name]: super.serialize(),
        speed: this.speed
        // moveThroughPhysics: this.moveThroughPhysics,
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.speed = _serialization.speed;
      // this.moveThroughPhysics = _serialization.moveThroughPhysics;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    /**
     * Teleports (moves instantly) to the _target Waypoint.
     * @param _target
     * @returns a Promise that resolves immediately.
     */
    public async moveTo(_target: Waypoint): Promise<void>;
    /**
     * Moves the walker from the _start to the _end Waypoint.
     * Teleports (moves instantly) to the _start point, then moves through the waypoint connections to the _end point.
     * @param _start 
     * @param _end
     * @param _rotate Rotates the walker to look in the direction of the waypoint
     * @returns a Promise that resolves when the _end point is reached. Rejects if _end can't be reached (no path found).
     */
    public async moveTo(_start: Waypoint, _end: Waypoint, _rotate?: boolean): Promise<void>;
    public async moveTo(_start: Waypoint, _end?: Waypoint, _rotate: boolean = false): Promise<void> {
      if (!_start) return;
      let translate: Vector3 = Vector3.DIFFERENCE(_start.mtxWorld.translation, this.node.mtxWorld.translation);
      this.node.mtxLocal.translate(translate);
      if (!_end || _start === _end) {
        this.#walkData = { path: [], totalProgress: -1 };
        return;
      }
      this.#rotateInWalkDirection = _rotate;

      return new Promise((_resolve, _reject) => {
        let path: PathingNode[] | null = this.getPath(_start, _end);
        if (!path || path.length === 0) {
          _reject();
          return;
        }
        this.#walkData = { path, totalProgress: 0 };
        this.#promiseResolverOnWalkFinished = _resolve;

        if (this.#rotateInWalkDirection && this.#walkData.path.length >= 1) {
          this.rotateTowards(this.#walkData.path[0].waypoint);
        }
      });
    }

    /** Takes care of the moving algorithm by calculating the next step and moving along this step */
    protected moving(): void {
      // are we currently moving?
      if (this.#walkData.totalProgress < 0 || this.#walkData.path.length == 0) return;
      // do we have a current path we can follow
      let currentPath: PathingNode = this.#walkData.path[this.#walkData.totalProgress];
      if (!currentPath) return;

      // how big of a step are we taking this frame?
      let delta: number = this.speed * currentPath.previousConnection.speedModifier * Loop.timeFrameGame / 1000;
      // how far away are we from the next waypoint?
      let step: Vector3 = Vector3.DIFFERENCE(
        currentPath.waypoint.mtxWorld.translation,
        this.node.mtxWorld.translation
      );

      // let stepRotation: Matrix4x4 = Matrix4x4.CONSTRUCTION(step);
      // stepRotation.rotate(this.node.mtxWorld.rotation);
      // step = stepRotation.translation;

      let scale: Vector3 = Vector3.DIFFERENCE(
        currentPath.waypoint.mtxWorld.scaling,
        this.node.mtxWorld.scaling
      );

      if (delta * delta < step.magnitudeSquared) { // won't reach next waypoint yet. Using squares because that's faster to compute than sqrt
        step.normalize(delta);
        this.node.mtxLocal.translate(step, false);
        if (scale.magnitudeSquared > 0) {
          scale.normalize(delta);
        }
        this.node.mtxLocal.scaling = Vector3.SUM(scale, this.node.mtxLocal.scaling);
        // this.node.mtxLocal.scale(Vector3.SUM(scale, this.node.mtxLocal.scaling));
        // TODO implement movement through physics
        return;
      }
      // reached next point
      this.dispatchEvent(new CustomEvent(EVENT.WAYPOINT_REACHED, { bubbles: true, detail: currentPath.waypoint }));
      (<ComponentWaypoint>currentPath.waypoint).dispatchEvent(new CustomEvent(EVENT.WAYPOINT_REACHED, { bubbles: true, detail: this }));
      
      let translate: Vector3 = Vector3.DIFFERENCE(currentPath.waypoint.mtxWorld.translation, this.node.mtxWorld.translation);
      this.node.mtxLocal.translate(translate, false);
      this.node.mtxLocal.scaling = currentPath.waypoint.mtxWorld.scaling;
      this.#walkData.totalProgress++;

      // reached final point, finished walking
      if (this.#walkData.totalProgress >= this.#walkData.path.length) {
        if (this.#promiseResolverOnWalkFinished) this.#promiseResolverOnWalkFinished();
        this.dispatchEvent(new CustomEvent(EVENT.PATHING_CONCLUDED, { bubbles: true, detail: currentPath.waypoint }));
        return;
      }

      // should we rotate walker?
      if (this.#rotateInWalkDirection) {
        this.rotateTowards(this.#walkData.path[this.#walkData.totalProgress].waypoint);
      }
    }

    /** find the path between two given waypoints */
    protected getPath(_start: Waypoint, _end: Waypoint): PathingNode[] {
      // TODO: use a more efficient algorithm like A* instead of Dijkstra
      // setup the graph of paths based on the start node
      let unvisitedNodes: PathingNode[] = [];
      let processedWaypoints: Waypoint[] = [_start];
      let waypointsToSearchThrough: Waypoint[] = [_start];
      do {
        let waypoint: Waypoint = waypointsToSearchThrough.pop();
        for (let connection of waypoint.connections) {
          if (!processedWaypoints.includes(connection.end) && connection.start.isActive && connection.end.isActive) {
            waypointsToSearchThrough.push(connection.end);
            processedWaypoints.push(connection.end);
          }
        }
        unvisitedNodes.push({ waypoint, distance: waypoint === _start ? 0 : Infinity, previous: null, previousConnection: null });
      } while (waypointsToSearchThrough.length > 0);

      // do the dijkstra
      while (unvisitedNodes.length > 0) {
        unvisitedNodes.sort((_a: PathingNode, _b: PathingNode) => _a.distance - _b.distance);
        let currentNode: PathingNode = unvisitedNodes.shift();
        if (currentNode.waypoint === _end) return this.pathingNodeToPath(currentNode);

        for (let con of currentNode.waypoint.connections) {
          if (!this.isConnectionUsable(con)) continue;
          let endNode: PathingNode = unvisitedNodes.find(_n => _n.waypoint === con.end);
          if (!endNode) continue;
          let newDistance: number = currentNode.distance + this.calculateConnectionCost(con);
          if (newDistance >= endNode.distance) continue;
          endNode.distance = newDistance;
          endNode.previous = currentNode;
          endNode.previousConnection = con;
        }
      }

      return null;
    }

    /**
     * Checks whether a connection is usable by this specific walker.
     * **Always returns true, unless overwritten in a custom Walker subclass.**
     * Can be used to influence the pathfinding algorithm for custom waypoint / connection systems.
     * @param _connection A connection to check
     * @returns true if the connection is usable by this walker, false if not
     */
    protected isConnectionUsable(_connection: Connection): boolean {
      return true;
    }

    /**
     * Calculates the new distance based on a connection.
     * **Always returns the plain connections cost unless overwritten in a custom walker subclass.**
     * Can be used to influence the pathfinding algorithm for custom waypoint / connection systems.
     * @param _connection A connection to check
     * @returns the amount of cost a connection encurs to the current walker or 0 if cost is negative.
     */
    protected calculateConnectionCost(_connection: Connection): number {
      if (_connection.cost >= 0)
        return _connection.cost;
      return 0;
    }

    private pathingNodeToPath(_node: PathingNode): PathingNode[] {
      let path: PathingNode[] = [];
      if (!_node) return path;
      do {
        path.push(_node);
        _node = _node.previous;
      } while (_node?.previous);
      return path.reverse();
    }

    private rotateTowards(_waypoint: Waypoint): void {
      let mtxLook: Matrix4x4 = Matrix4x4.LOOK_AT(this.node.mtxWorld.translation, _waypoint.mtxWorld.translation);
      this.node.mtxLocal.rotation = mtxLook.rotation;
    }

    #handleAttach(): void {
      Loop.addEventListener(EVENT.LOOP_FRAME, this.moving.bind(this));
    }

    #handleDetach(): void {
      Loop.removeEventListener(EVENT.LOOP_FRAME, this.moving.bind(this));
    }

  }

  /**
   * An internal interface to manage pathing data inside the Walker
   */
  interface PathingNode {
    waypoint: Waypoint;
    distance: number;
    previous: PathingNode;
    previousConnection: Connection;
  }

  /**
   * An internal interface to manage the data of the currently walked path
   */
  interface WalkData {
    path: PathingNode[];
    totalProgress: number;
  }
}
