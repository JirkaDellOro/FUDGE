namespace FudgeCore {
  export const enum EVENT_PHYSICS {
    /** broadcast to a {@link Node} and all {@link Node}s in the branch it's the root of */
    TRIGGER_ENTER = "TriggerEnteredCollision",
    /** broadcast to a {@link Node} and all {@link Node}s in the branch it's the root of */
    TRIGGER_EXIT = "TriggerLeftCollision",
    /** broadcast to a {@link Node} and all {@link Node}s in the branch it's the root of */
    COLLISION_ENTER = "ColliderEnteredCollision",
    /** broadcast to a {@link Node} and all {@link Node}s in the branch it's the root of */
    COLLISION_EXIT = "ColliderLeftCollision"
  }

  export class EventPhysics extends Event {
    /**
     * ComponentRigidbody that collided with this ComponentRigidbody
     */
    public cmpRigidbody: ComponentRigidbody;
    /**
     * The normal impulse between the two colliding objects. Normal represents the default impulse.
     * Impulse is only happening on COLLISION_ENTER, so there is no impulse on exit nor on triggers.
     * Use the velocity of the cmpRigidbody to determine the intensity of the EVENT instead.
     */
    public normalImpulse: number;
    public tangentImpulse: number;
    public binomalImpulse: number;
    /** The point where the collision/triggering initially happened. The collision point exists only on COLLISION_ENTER / TRIGGER_ENTER. */
    public collisionPoint: Vector3;
    /** The normal vector of the collision. Only existing on COLLISION_ENTER */
    public collisionNormal: Vector3;

    /** Creates a new event customized for physics. Holding informations about impulses. Collision point and the body that is colliding */
    constructor(_type: EVENT_PHYSICS, _hitRigidbody: ComponentRigidbody, _normalImpulse: number, _tangentImpulse: number, _binormalImpulse: number, _collisionPoint: Vector3 = null, _collisionNormal: Vector3 = null) {
      super(_type);
      this.cmpRigidbody = _hitRigidbody;
      this.normalImpulse = _normalImpulse;
      this.tangentImpulse = _tangentImpulse;
      this.binomalImpulse = _binormalImpulse;
      this.collisionPoint = _collisionPoint;
      this.collisionNormal = _collisionNormal;
    }
  }

  /**
  * Groups to place a node in, not every group should collide with every group. Use a Mask in to exclude collisions
  */
  export enum COLLISION_GROUP { //TODO Give a possiblithy to set which layer collides with which, CollisionMatrix?
    DEFAULT = 1,
    GROUP_1 = 2,
    GROUP_2 = 4,
    GROUP_3 = 8,
    GROUP_4 = 16,
    GROUP_5 = 32
  }

  /**
  * Defines the type of the rigidbody which determines the way it interacts with the physical and the visual world
  */
  export enum BODY_TYPE {
    
    /** The body ignores the hierarchy of the render graph, is completely controlled  by physics and takes its node with it  */
    DYNAMIC, // = OIMO.RigidBodyType.DYNAMIC,
    /** The body ignores the hierarchy of the render graph, is completely immoveble and keeps its node from moving  */
    STATIC, // = OIMO.RigidBodyType.STATIC,
    /** The body is controlled by its node and moves with it, while it impacts the physical world e.g. by collisions */
    KINEMATIC // = OIMO.RigidBodyType.KINEMATIC
  }

  /**
  * Different types of collider shapes, with different options in scaling BOX = Vector3(length, height, depth),
  * SPHERE = Vector3(diameter, x, x), CAPSULE = Vector3(diameter, height, x), CYLINDER = Vector3(diameter, height, x),
  * CONE = Vector(diameter, height, x), PYRAMID = Vector3(length, height, depth); x == unused.
  * CONVEX = ComponentMesh needs to be available in the RB Property convexMesh, the points of that component are used to create a collider that matches,
  * the closest possible representation of that form, in form of a hull. Convex is experimental and can produce unexpected behaviour when vertices
  * are too close to one another and the given vertices do not form a in itself closed shape and having a genus of 0 (no holes). Vertices in the ComponentMesh can be scaled differently 
  * for texturing/normal or other reasons, so the collider might be off compared to the visual shape, this can be corrected by changing the pivot scale of the ComponentRigidbody.  
  */
  export enum COLLIDER_TYPE {
    CUBE,
    SPHERE,
    CAPSULE,
    CYLINDER,
    CONE,
    PYRAMID,
    CONVEX
  }

  /** Displaying different types of debug information about different physic features. Default = JOINTS_AND_COLLIDER. debugDraw in the settings must be active to see anything. */
  export enum PHYSICS_DEBUGMODE {
    NONE,
    COLLIDERS,
    JOINTS_AND_COLLIDER,
    BOUNDING_BOXES,
    CONTACTS,
    PHYSIC_OBJECTS_ONLY
  }

  /** Info about Raycasts shot from the physics system. */
  export class RayHitInfo {
    public hit: boolean;
    public hitDistance: number;
    public hitPoint: Vector3;
    public rigidbodyComponent: ComponentRigidbody;
    public hitNormal: Vector3;
    public rayOrigin: Vector3;
    public rayEnd: Vector3;

    constructor() {
      this.recycle();
    }

    public recycle(): void {
      this.hit = false;
      this.hitDistance = 0;
      this.hitPoint = Vector3.ZERO();
      this.rigidbodyComponent = null;
      this.hitNormal = Vector3.ZERO();
      this.rayOrigin = Vector3.ZERO();
      this.rayEnd = Vector3.ZERO();
    }
  }

  /** General settings for the physic simulation and the debug of it. */
  export class PhysicsSettings {

    constructor(_defGroup: number, _defMask: number) {
      this.defaultCollisionGroup = _defGroup;
      this.defaultCollisionMask = _defMask;
    }

    /** Change if rigidbodies are able to sleep (don't be considered in physical calculations) when their movement is below a threshold. Deactivation is decreasing performance for minor advantage in precision. */
    get disableSleeping(): boolean {
      return OIMO.Setting.disableSleeping;
    }
    set disableSleeping(_value: boolean) {
      OIMO.Setting.disableSleeping = _value;
    }
    /** Sleeping Threshold for Movement Veloctiy. */
    get sleepingVelocityThreshold(): number {
      return OIMO.Setting.sleepingVelocityThreshold;
    }
    set sleepingVelocityThreshold(_value: number) {
      OIMO.Setting.sleepingVelocityThreshold = _value;
    }

    /** Sleeping Threshold for Rotation Velocity. */
    get sleepingAngularVelocityThreshold(): number {
      return OIMO.Setting.sleepingAngularVelocityThreshold;
    }
    set sleepingAngularVelocityThreshold(_value: number) {
      OIMO.Setting.sleepingAngularVelocityThreshold = _value;
    }

    /** Threshold how long the Rigidbody must be below/above the threshold to count as sleeping. */
    get sleepingTimeThreshold(): number {
      return OIMO.Setting.sleepingTimeThreshold;
    }
    set sleepingTimeThreshold(_value: number) {
      OIMO.Setting.sleepingTimeThreshold = _value;
    }

    /** Error threshold. Default is 0.05. The higher the more likely collisions get detected before actual impact at high speeds but it's visually less accurate. */
    get defaultCollisionMargin(): number {
      return OIMO.Setting.defaultGJKMargin;
    }
    set defaultCollisionMargin(_thickness: number) {
      OIMO.Setting.defaultGJKMargin = _thickness;
    }

    /** The default applied friction between two rigidbodies with the default value. How much velocity is slowed down when moving accross this surface. */
    get defaultFriction(): number {
      return OIMO.Setting.defaultFriction;
    }
    set defaultFriction(_value: number) {
      OIMO.Setting.defaultFriction = _value;
    }

    /** Bounciness of rigidbodies. How much of the impact is restituted. */
    get defaultRestitution(): number {
      return OIMO.Setting.defaultRestitution;
    }
    set defaultRestitution(_value: number) {
      OIMO.Setting.defaultRestitution = _value;
    }

    /** Groups the default rigidbody will collide with. Set it like: (PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 | PHYSICS_GROUP.GROUP_2 | PHYSICS_GROUP.GROUP_3) 
     * to collide with multiple groups. Default is collision with everything but triggers.
    */
    get defaultCollisionMask(): number {
      return OIMO.Setting.defaultCollisionMask;
    }
    set defaultCollisionMask(_value: number) {
      OIMO.Setting.defaultCollisionMask = _value;
    }

    /** The group that this rigidbody belongs to. Default is the DEFAULT Group which means its just a normal Rigidbody not a trigger nor anything special. */
    get defaultCollisionGroup(): COLLISION_GROUP {
      return <COLLISION_GROUP>OIMO.Setting.defaultCollisionGroup;
    }
    set defaultCollisionGroup(_value: COLLISION_GROUP) {
      OIMO.Setting.defaultCollisionGroup = _value;
    }

    /** Change the type of joint solver algorithm. Default Iterative == 0, is faster but less stable. Direct == 1, slow but more stable, recommended for complex joint work. Change this setting only at the start of your game. */
    get defaultConstraintSolverType(): number {
      return OIMO.Setting.defaultJointConstraintSolverType;
    }
    set defaultConstraintSolverType(_value: number) {
      OIMO.Setting.defaultJointConstraintSolverType = _value;
    }

    /** The correction algorithm used to correct physics calculations. Change this only at the beginning of your game. Each has different approaches, so if you have problems test another
     *  Default 0 = Baumgarte (fast but less correct induces some energy errors), 1 = Split-Impulse (fast and no engery errors, but more inaccurate for joints), 2 = Non-linear Gauss Seidel (slowest but most accurate)*/
    get defaultCorrectionAlgorithm(): number {
      return OIMO.Setting.defaultJointPositionCorrectionAlgorithm;
    }
    set defaultCorrectionAlgorithm(_value: number) {
      OIMO.Setting.defaultJointPositionCorrectionAlgorithm = _value;
    }
  }
}