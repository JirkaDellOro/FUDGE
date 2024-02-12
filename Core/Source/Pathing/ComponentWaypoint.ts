namespace FudgeCore {
  /**
   * Unifies Waypoints of the pathing algorithms
   * @author Lukas Scheuerle, HFU, 2024
   */
  export interface Waypoint {
    connections: Connection[];
    mtxLocal: Matrix4x4;
    mtxWorld: Matrix4x4;
    isActive: boolean;
  }

  /**
   * Sets a position that a {@link ComponentWalker} can use as a target point.
   * Implements {@link Waypoint}.
   * Registers itself to a static list of all available waypoints
   * @author Lukas Scheuerle, HFU, 2024
   */
  export class ComponentWaypoint extends Component implements Waypoint, Gizmo {
    public static readonly iSubclass: number = Component.registerSubclass(this);
    static readonly #waypoints: ComponentWaypoint[] = [];

    public mtxLocal: Matrix4x4;

    #connections: Connection[];

    public constructor(_mtxInit: Matrix4x4 = Matrix4x4.IDENTITY(), _connections: Connection[] = []) {
      super();
      this.#connections = _connections;
      this.mtxLocal = _mtxInit;
      this.singleton = false;

      if (Project.mode == MODE.EDITOR)
        return;

      this.addEventListener(EVENT.COMPONENT_ADD, this.#handleAttach.bind(this));
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.#handleDetach.bind(this));
    }

    /** All the waypoints that are currently loaded in the scene. **Do not edit, treat as readonly!** */
    public static get waypoints(): ComponentWaypoint[] {
      return ComponentWaypoint.#waypoints;
    }

    /**
     * A shorthand to create a connection between two {@link ComponentWaypoint}s
     * @param _start The {@link ComponentWaypoint} from which to start the connection.
     * @param _end The {@link ComponentWaypoint} to which the connection leads.
     * @param _cost The cost of the connection. The higher the value, the less likely it is to be taken. Cannot be negative.
     * @param _speedModifier How fast the connection can be walked on. Defaults to 1
     * @param _bothWays If true, creates a connection in both directions. Default: false
     */
    public static addConnection(_start: ComponentWaypoint, _end: ComponentWaypoint, _cost: number, _speedModifier: number = 1, _bothWays: boolean = false): void {
      _start.addConnection({ cost: _cost, end: _end, start: _start, speedModifier: _speedModifier });
      if (_bothWays)
        _end.addConnection({ cost: _cost, end: _start, start: _end, speedModifier: _speedModifier });
    }

    public get isActive(): boolean {
      return this.active;
    }

    public get connections(): Connection[] {
      return this.#connections;
    }

    /** The current world position of the Waypoint. Returns a new Matrix without connection to the Waypoint */
    public get mtxWorld(): Matrix4x4 {
      return Matrix4x4.MULTIPLICATION(this.mtxLocal, this.node.mtxWorld);
    }

    /** Adds a new {@link Connection} to this waypoint */
    public addConnection(_connection: Connection): void {
      this.#connections.push(_connection);
    }

    /** Removes a {@link Connection} from this waypoint */
    public removeConnection(_connection: Connection): void {
      let index: number = this.#connections.indexOf(_connection);
      if (index < 0) return;
      this.#connections.splice(index, 1);
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        [super.constructor.name]: super.serialize(),
        matrix: this.mtxLocal.serialize(),
        connections: this.#connections.map(_con => {
          let connection: SerializedConnection = { cost: _con.cost, end: _con.end, speedModifier: _con.speedModifier };
          if (connection.end instanceof ComponentWaypoint) {
            connection.end = Node.PATH_FROM_TO(this, connection.end);
          }
          return connection;
        })
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mtxLocal.deserialize(_serialization.matrix);
      const hndNodeDeserialized: EventListenerUnified = () => {
        this.#connections = _serialization.connections.map((_con: SerializedConnection) => {
          let connection: Connection = { cost: _con.cost, end: this.serializedWaypointToWaypoint(_con.end), speedModifier: _con.speedModifier, start: this };
          return connection;
        });
        this.removeEventListener(EVENT.NODE_DESERIALIZED, hndNodeDeserialized);
      };
      this.addEventListener(EVENT.NODE_DESERIALIZED, hndNodeDeserialized);
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public drawGizmos(): void {
      let scaleVector: Vector3 = Vector3.SCALE(Vector3.ONE(), 0.1);
      let mtx: Matrix4x4 = this.mtxWorld;
      Gizmos.drawSphere(Matrix4x4.CONSTRUCTION(mtx.translation, Vector3.ZERO(), scaleVector), Color.CSS("orange"));
      // return;
      let lines: Vector3[] = [];
      for (let connection of this.connections) {
        // if the start and end point are on the same point, don't draw line.
        let tmpMtx: Matrix4x4 = connection.end.mtxWorld.clone;
        let directionVector: Vector3 = Vector3.DIFFERENCE(mtx.translation, tmpMtx.translation);
        if (directionVector.magnitudeSquared === 0) continue;

        // if one of the waypoints is inactive, don't draw gizmos
        if (!connection.end.isActive || !connection.start.isActive) continue;

        // actual line
        lines.push(mtx.translation);
        lines.push(tmpMtx.translation);

        // arrow heads
        let directionMtx: Matrix4x4 = Matrix4x4.LOOK_IN(tmpMtx.translation, directionVector);
        directionMtx.scale(scaleVector);
        Gizmos.drawWireCone(directionMtx, Color.CSS("orange"));
      }
      Gizmos.drawLines(lines, Matrix4x4.IDENTITY(), Color.CSS("orange"));
    }

    /** An internal function to help the deserializaztion process. */
    private serializedWaypointToWaypoint(_point: string | Waypoint): Waypoint {
      if (typeof _point !== "string") return _point;
      return Node.FIND(this, _point) as ComponentWaypoint;
    }

    #handleAttach(): void {
      ComponentWaypoint.#waypoints.push(this);
    }

    #handleDetach(): void {
      let index: number = ComponentWaypoint.#waypoints.indexOf(this);
      if (index >= 0) {
        ComponentWaypoint.#waypoints.splice(index, 1);
      }
    }
  }

  /** Defines a Connection in the way it's serialized in resources @internal */
  interface SerializedConnection {
    end: Waypoint | string;
    cost: number;
    speedModifier: number;
  }
}
