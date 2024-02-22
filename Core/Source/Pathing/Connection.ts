namespace FudgeCore {
  /**
   * A directed connection between two waypoints
   * @author Lukas Scheuerle, HFU, 2024
   */
  export interface Connection {
    /** The start / origin waypoint of this connection. */
    start: Waypoint;
    /** The end / target waypoint of this connection. */
    end: Waypoint;
    /** The cost of the connection, the higher the less likely to be taken. Cannot be negative. */
    cost: number;
    /** Modifies the speed that a walker can walk past this connection by multiplying the speed with this value. Needs to be >0 */
    speedModifier: number;
  }
}
