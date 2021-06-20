namespace FudgeCore {
  /**
     * Acts as the physical representation of the {@link Node} it's attached to.
     * It's the connection between the Fudge Rendered world and the Physics world.
     * For the physics to correctly get the transformations rotations need to be applied with from left = true.
     * Or rotations need to happen before scaling.
     * @author Marko Fehrenbach, HFU 2020
     */
  export class ComponentRigidbody extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentRigidbody);

    /** The pivot of the physics itself. Default the pivot is identical to the transform. It's used like an offset. */
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();

    /** Vertices that build a convex mesh (form that is in itself closed). Needs to set in the construction of the rb if none of the standard colliders is used. */
    public convexMesh: Float32Array = null;

    /** Collisions with rigidbodies happening to this body, can be used to build a custom onCollisionStay functionality. */
    public collisions: ComponentRigidbody[] = new Array();
    /** Triggers that are currently triggering this body */
    public triggers: ComponentRigidbody[] = new Array();
    /** Bodies that trigger this "trigger", only happening if this body is a trigger */
    public bodiesInTrigger: ComponentRigidbody[] = new Array();

    /** ID to reference this specific ComponentRigidbody */
    public id: number = 0;

    //Private informations - Mostly OimoPhysics variables that should not be exposed to the Fudge User and manipulated by them
    private rigidbody: OIMO.RigidBody;
    private massData: OIMO.MassData = new OIMO.MassData();
    private collider: OIMO.Shape;
    private colliderInfo: OIMO.ShapeConfig;
    private rigidbodyInfo: OIMO.RigidBodyConfig = new OIMO.RigidBodyConfig();
    private rbType: PHYSICS_TYPE = PHYSICS_TYPE.DYNAMIC;
    private colType: COLLIDER_TYPE = COLLIDER_TYPE.CUBE;
    private colGroup: PHYSICS_GROUP = PHYSICS_GROUP.DEFAULT;
    private colMask: number;
    private bodyRestitution: number;
    private bodyFriction: number;
    private linDamping: number = 0.1;
    private angDamping: number = 0.1;
    private rotationalInfluenceFactor: Vector3 = Vector3.ONE();
    private gravityInfluenceFactor: number = 1;

    /** Creating a new rigidbody with a weight in kg, a physics type (default = dynamic), a collider type what physical form has the collider, to what group does it belong, is there a transform Matrix that should be used, and is the collider defined as a group of points that represent a convex mesh. */
    constructor(_mass: number = 1, _type: PHYSICS_TYPE = PHYSICS_TYPE.DYNAMIC, _colliderType: COLLIDER_TYPE = COLLIDER_TYPE.CUBE, _group: PHYSICS_GROUP = Physics.settings.defaultCollisionGroup, _mtxTransform: Matrix4x4 = null, _convexMesh: Float32Array = null) {
      super();
      //Setting up all incoming values to be internal values
      this.convexMesh = _convexMesh;
      this.rbType = _type;
      this.collisionGroup = _group;
      this.colliderType = _colliderType;
      this.mass = _mass;
      this.bodyRestitution = Physics.settings.defaultRestitution;
      this.bodyFriction = Physics.settings.defaultFriction;
      this.colMask = Physics.settings.defaultCollisionMask;
      //Create the actual rigidbody in the OimoPhysics Space
      this.createRigidbody(_mass, _type, this.colliderType, _mtxTransform, this.collisionGroup);
      this.id = Physics.world.distributeBodyID();
      //Handling adding/removing the component
      this.addEventListener(EVENT.COMPONENT_ADD, this.addRigidbodyToWorld);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeRigidbodyFromWorld);
    }

    /** The type of interaction between the physical world and the transform hierarchy world. DYNAMIC means the body ignores hierarchy and moves by physics. KINEMATIC it's
     * reacting to a {@link Node} that is using physics but can still be controlled by animation or transform. And STATIC means its immovable.
     */
    get physicsType(): PHYSICS_TYPE {
      return this.rbType;
    }
    set physicsType(_value: PHYSICS_TYPE) {
      this.rbType = _value;
      let oimoType: number;
      switch (this.rbType) {
        case PHYSICS_TYPE.DYNAMIC:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
        case PHYSICS_TYPE.STATIC:
          oimoType = OIMO.RigidBodyType.STATIC;
          break;
        case PHYSICS_TYPE.KINEMATIC:
          oimoType = OIMO.RigidBodyType.KINEMATIC;
          break;
        default:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
      }
      this.rigidbody.setType(oimoType);
      this.rigidbody.setMassData(this.massData); //have to reset mass after changing the type, since Oimo is handling mass internally wrong when switching types
    }

    /** The shape that represents the {@link Node} in the physical world. Default is a Cube. */
    get colliderType(): COLLIDER_TYPE {
      return this.colType;
    }
    set colliderType(_value: COLLIDER_TYPE) {
      if (_value != this.colType && this.rigidbody != null)
        this.updateFromWorld();
      this.colType = _value;
    }

    /** The physics group this {@link Node} belongs to it's the default group normally which means it physically collides with every group besides trigger. */
    get collisionGroup(): PHYSICS_GROUP {
      return this.colGroup;
    }
    set collisionGroup(_value: PHYSICS_GROUP) {
      if (_value != PHYSICS_GROUP.TRIGGER && this.colGroup == PHYSICS_GROUP.TRIGGER) //Register/unregister triggers form the world
        Physics.world.unregisterTrigger(this);
      if (_value == PHYSICS_GROUP.TRIGGER)
        Physics.world.registerTrigger(this);

      this.colGroup = _value;
      if (this.rigidbody != null)
        this.rigidbody.getShapeList().setCollisionGroup(this.colGroup);
    }

    /** The groups this object collides with. Groups must be writen in form of
     *  e.g. collisionMask = PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 and so on to collide with multiple groups. */
    get collisionMask(): number {
      return this.colMask;
    }
    set collisionMask(_value: number) {
      this.colMask = _value;
    }

    /**
   * Returns the physical weight of the {@link Node}
   */
    get mass(): number {
      return this.rigidbody.getMass();
    }
    /**
  * Setting the physical weight of the {@link Node} in kg
  */
    set mass(_value: number) {
      this.massData.mass = _value;
      if (this.getContainer() != null)
        if (this.rigidbody != null)
          this.rigidbody.setMassData(this.massData);
    }

    /** Air reistance, when moving. A Body does slow down even on a surface without friction. */
    get linearDamping(): number {
      return this.rigidbody.getLinearDamping();
    }
    set linearDamping(_value: number) {
      this.linDamping = _value;
      this.rigidbody.setLinearDamping(_value);
    }

    /** Air resistance, when rotating. */
    get angularDamping(): number {
      return this.rigidbody.getAngularDamping();
    }
    set angularDamping(_value: number) {
      this.angDamping = _value;
      this.rigidbody.setAngularDamping(_value);
    }

    /** The factor this rigidbody reacts rotations that happen in the physical world. 0 to lock rotation this axis. */
    get rotationInfluenceFactor(): Vector3 {
      return this.rotationalInfluenceFactor;
    }
    set rotationInfluenceFactor(_influence: Vector3) {
      this.rotationalInfluenceFactor = _influence;
      this.rigidbody.setRotationFactor(new OIMO.Vec3(this.rotationalInfluenceFactor.x, this.rotationalInfluenceFactor.y, this.rotationalInfluenceFactor.z));
    }

    /** The factor this rigidbody reacts to world gravity. Default = 1 e.g. 1*9.81 m/s. */
    get gravityScale(): number {
      return this.gravityInfluenceFactor;
    }
    set gravityScale(_influence: number) {
      this.gravityInfluenceFactor = _influence;
      if (this.rigidbody != null) this.rigidbody.setGravityScale(this.gravityInfluenceFactor);
    }

    /**
  * Get the friction of the rigidbody, which is the factor of sliding resistance of this rigidbody on surfaces
  */
    get friction(): number {
      return this.bodyFriction;
    }

    /**
   * Set the friction of the rigidbody, which is the factor of  sliding resistance of this rigidbody on surfaces
   */
    set friction(_friction: number) {
      this.bodyFriction = _friction;
      if (this.rigidbody.getShapeList() != null)
        this.rigidbody.getShapeList().setFriction(this.bodyFriction);
    }

    /**
  * Get the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
  */
    get restitution(): number {
      return this.bodyRestitution;
    }

    /**
   * Set the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
   */
    set restitution(_restitution: number) {
      this.bodyRestitution = _restitution;
      if (this.rigidbody.getShapeList() != null)
        this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
    }

    /**
    * Returns the rigidbody in the form the physics engine is using it, should not be used unless a functionality
    * is not provided through the FUDGE Integration.
    */
    public getOimoRigidbody(): OIMO.RigidBody {
      return this.rigidbody;
    }

    /** Rotating the rigidbody therefore changing it's rotation over time directly in physics. This way physics is changing instead of transform. 
 *  But you are able to incremental changing it instead of a direct rotation.  Although it's always prefered to use forces in physics.
*/
    public rotateBody(_rotationChange: Vector3): void {
      this.rigidbody.rotateXyz(new OIMO.Vec3(_rotationChange.x * Math.PI / 180, _rotationChange.y * Math.PI / 180, _rotationChange.z * Math.PI / 180));
    }

    /** Translating the rigidbody therefore changing it's place over time directly in physics. This way physics is changing instead of transform. 
     *  But you are able to incremental changing it instead of a direct position. Although it's always prefered to use forces in physics. */
    public translateBody(_translationChange: Vector3): void {
      this.rigidbody.translate(new OIMO.Vec3(_translationChange.x, _translationChange.y, _translationChange.z));
    }

    /**
   * Checking for Collision with other Colliders and dispatches a custom event with information about the collider.
   * Automatically called in the RenderManager, no interaction needed.
   */
    public checkCollisionEvents(): void {
      let list: OIMO.ContactLink = this.rigidbody.getContactLinkList(); //all physical contacts between colliding bodies on this rb
      let objHit: ComponentRigidbody; //collision consisting of 2 bodies, so Hit1/2
      let objHit2: ComponentRigidbody;
      let event: EventPhysics;  //The event that will be send and the informations added to it
      let normalImpulse: number = 0;
      let binormalImpulse: number = 0;
      let tangentImpulse: number = 0;
      let colPoint: Vector3;
      //ADD NEW Collision - That just happened
      for (let i: number = 0; i < this.rigidbody.getNumContectLinks(); i++) {
        let collisionManifold: OIMO.Manifold = list.getContact().getManifold(); //Manifold = Additional informations about the contact
        objHit = list.getContact().getShape1().userData;  //Userdata is used to transfer the ƒ.ComponentRigidbody, it's an empty OimoPhysics Variable
        //Only register the collision on the actual touch, not on "shadowCollide", to register in the moment of impulse calculation
        if (objHit == null || list.getContact().isTouching() == false) // only act if the collision is actual touching, so right at the moment when a impulse is happening, not when shapes overlap
          return;
        objHit2 = list.getContact().getShape2().userData;
        if (objHit2 == null || list.getContact().isTouching() == false)
          return;
        let points: OIMO.ManifoldPoint[] = collisionManifold.getPoints(); //All points in the collision where the two bodies are touching, used to calculate the full impact
        let normal: OIMO.Vec3 = collisionManifold.getNormal();
        normalImpulse = 0;
        binormalImpulse = 0;
        tangentImpulse = 0;
        if (objHit.getOimoRigidbody() != this.getOimoRigidbody() && this.collisions.indexOf(objHit) == -1) { //Fire, if the hit object is not the Body itself but another and it's not already fired.
          let colPos: OIMO.Vec3 = this.collisionCenterPoint(points, collisionManifold.getNumPoints()); //THE point of collision is the first touching point (EXTENSION: could be the center of all touching points combined)
          colPoint = new Vector3(colPos.x, colPos.y, colPos.z);
          points.forEach((value: OIMO.ManifoldPoint): void => { //The impact of the collision involving all touching points
            normalImpulse += value.getNormalImpulse();
            binormalImpulse += value.getBinormalImpulse();
            tangentImpulse += value.getTangentImpulse();
          });
          this.collisions.push(objHit); //Tell the object that the event for this object does not need to be fired again
          event = new EventPhysics(EVENT_PHYSICS.COLLISION_ENTER, objHit, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new Vector3(normal.x, normal.y, normal.z)); //Building the actual event, with what object did collide and informations about it
          this.dispatchEvent(event); //Sending the given event
        }
        if (objHit2 != this && this.collisions.indexOf(objHit2) == -1) { //Same as the above but for the case the SECOND hit object is not the body itself
          let colPos: OIMO.Vec3 = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
          colPoint = new Vector3(colPos.x, colPos.y, colPos.z);
          points.forEach((value: OIMO.ManifoldPoint): void => {
            normalImpulse += value.getNormalImpulse();
            binormalImpulse += value.getBinormalImpulse();
            tangentImpulse += value.getTangentImpulse();
          });

          this.collisions.push(objHit2);
          event = new EventPhysics(EVENT_PHYSICS.COLLISION_ENTER, objHit2, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new Vector3(normal.x, normal.y, normal.z));
          this.dispatchEvent(event);
        }
        list = list.getNext(); //Start the same routine with the next collision in the list
      }
      //REMOVE OLD Collisions - That do not happen anymore
      this.collisions.forEach((value: ComponentRigidbody) => { //Every Collider in the list is checked if the collision is still happening
        let isColliding: boolean = false;
        list = this.rigidbody.getContactLinkList();
        for (let i: number = 0; i < this.rigidbody.getNumContectLinks(); i++) {
          objHit = list.getContact().getShape1().userData;
          objHit2 = list.getContact().getShape2().userData;
          if (value == objHit || value == objHit2) { //If the given object in the collisions list is still one of the objHit the collision is not CollisionEXIT
            isColliding = true;
          }
          list = list.getNext();
        }
        if (isColliding == false) { //The collision is exiting but was in the collision list, then EXIT Event needs to be fired
          let index: number = this.collisions.indexOf(value); //Find object in the array
          this.collisions.splice(index); //remove it from the array
          event = new EventPhysics(EVENT_PHYSICS.COLLISION_EXIT, value, 0, 0, 0);
          this.dispatchEvent(event);
        }
      });
    }

    /**
      * Checking for Collision with Triggers with a overlapping test, dispatching a custom event with information about the trigger,
      * or triggered {@link Node}. Automatically called in the RenderManager, no interaction needed.
      */
    public checkTriggerEvents(): void {
      let possibleTriggers: ComponentRigidbody[] = Physics.world.getTriggerList(); //Get the array from the world that contains every trigger existing and check it with this body
      let event: EventPhysics;
      //ADD - Similar to collision events but with overlapping instead of an actual collision
      possibleTriggers.forEach((value: ComponentRigidbody) => {
        let overlapping: boolean = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody()); //Check if the two colliders are overlapping
        if (overlapping && this.triggers.indexOf(value) == -1) {
          this.triggers.push(value);
          let enterPoint: Vector3 = this.getTriggerEnterPoint(this.getOimoRigidbody(), value.getOimoRigidbody());
          event = new EventPhysics(EVENT_PHYSICS.TRIGGER_ENTER, value, 0, 0, 0, enterPoint);
          this.dispatchEvent(event);
        }
      });
      //REMOVE
      this.triggers.forEach((value: ComponentRigidbody) => { //Every Collider in the list is checked if the collision is still happening
        let isTriggering: boolean = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
        if (isTriggering == false) {
          let index: number = this.triggers.indexOf(value);
          this.triggers.splice(index);
          event = new EventPhysics(EVENT_PHYSICS.TRIGGER_EXIT, value, 0, 0, 0);
          this.dispatchEvent(event);
        }
      });
      if (this.colGroup == PHYSICS_GROUP.TRIGGER) { //In case this is a trigger, it does not only need to send a trigger to everyone else but also receive a triggering for itself.
        this.checkBodiesInTrigger();
      }
    }

    /**
   * Checks that the Rigidbody is positioned correctly and recreates the Collider with new scale/position/rotation
   */
    public updateFromWorld(_toMesh: boolean = false): void {
      let cmpMesh: ComponentMesh = this.getContainer().getComponent(ComponentMesh);
      let worldTransform: Matrix4x4 = (_toMesh && cmpMesh) ? cmpMesh.mtxWorld : this.getContainer().mtxWorld; //super.getContainer() != null ? super.getContainer().mtxWorld : Matrix4x4.IDENTITY(); //The the world information about where to position/scale/rotate
      let position: Vector3 = worldTransform.translation; //Adding the offsets from the pivot
      position.add(this.mtxPivot.translation);
      let rotation: Vector3 = worldTransform.getEulerAngles();
      rotation.add(this.mtxPivot.rotation);
      let scaling: Vector3 = worldTransform.scaling;
      scaling.x *= this.mtxPivot.scaling.x;
      scaling.y *= this.mtxPivot.scaling.y;
      scaling.z *= this.mtxPivot.scaling.z;
      this.createCollider(new OIMO.Vec3(scaling.x / 2, scaling.y / 2, scaling.z / 2), this.colliderType); //recreate the collider
      this.collider = new OIMO.Shape(this.colliderInfo);
      let oldCollider: OIMO.Shape = this.rigidbody.getShapeList();
      this.rigidbody.addShape(this.collider); //add new collider, before removing the old, so the rb is never active with 0 colliders
      this.rigidbody.removeShape(oldCollider); //remove the old collider
      this.collider.userData = this; //reset the extra information so that this collider knows to which Fudge Component it's connected
      this.collider.setCollisionGroup(this.collisionGroup);
      if (this.collisionGroup == PHYSICS_GROUP.TRIGGER) //Trigger not collidering with anything so their mask is only colliding with trigger
        this.collider.setCollisionMask(PHYSICS_GROUP.TRIGGER);
      else
        this.collider.setCollisionMask(this.colMask);
      if (this.rigidbody.getShapeList() != null) { //reset the informations about physics handling, has to be done because the shape is new
        this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
        this.rigidbody.getShapeList().setFriction(this.bodyFriction);
      }
      this.rigidbody.setMassData(this.massData);
      this.setPosition(position); //set the actual new rotation/position for this Rb again since it's now updated
      this.setRotation(rotation);
    }

    /**
   * Get the current POSITION of the {@link Node} in the physical space
   */
    public getPosition(): Vector3 {
      let tmpPos: OIMO.Vec3 = this.rigidbody.getPosition();
      return new Vector3(tmpPos.x, tmpPos.y, tmpPos.z);
    }

    /**
  * Sets the current POSITION of the {@link Node} in the physical space
  */
    public setPosition(_value: Vector3): void {
      this.rigidbody.setPosition(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /**
     * Get the current ROTATION of the {@link Node} in the physical space. Note this range from -pi to pi, so -90 to 90.
     */
    public getRotation(): Vector3 {
      let orientation: OIMO.Quat = this.rigidbody.getOrientation();
      let tmpQuat: Quaternion = new Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
      return tmpQuat.toDegrees();
    }


    /**
     * Sets the current ROTATION of the {@link Node} in the physical space, in degree.
     */
    public setRotation(_value: Vector3): void {
      let quat: OIMO.Quat = new OIMO.Quat();
      let mtxRot: Matrix4x4 = Matrix4x4.IDENTITY();
      mtxRot.rotate(new Vector3(_value.x, _value.y, _value.z));
      let array: Float32Array = mtxRot.get();
      let rot: OIMO.Mat3 = new OIMO.Mat3(array[0], array[4], array[8], array[1], array[5], array[9], array[2], array[6], array[10]);
      quat.fromMat3(rot);
      // quat.normalize();
      this.rigidbody.setOrientation(quat);
    }


    /** Get the current SCALING in the physical space. */
    public getScaling(): Vector3 {
      let scaling: Vector3 = this.getContainer().mtxWorld.scaling.copy;
      scaling.x *= this.mtxPivot.scaling.x;
      scaling.y *= this.mtxPivot.scaling.y;
      scaling.z *= this.mtxPivot.scaling.z;
      return scaling;
    }

    /** Sets the current SCALING of the {@link Node} in the physical space. Also applying this scaling to the node itself. */
    public setScaling(_value: Vector3): void {
      let scaling: Vector3 = _value.copy;
      scaling.x *= this.mtxPivot.scaling.x;
      scaling.y *= this.mtxPivot.scaling.y;
      scaling.z *= this.mtxPivot.scaling.z;
      this.createCollider(new OIMO.Vec3(scaling.x / 2, scaling.y / 2, scaling.z / 2), this.colliderType); //recreate the collider
      this.collider = new OIMO.Shape(this.colliderInfo);
      let oldCollider: OIMO.Shape = this.rigidbody.getShapeList();
      this.rigidbody.addShape(this.collider); //add new collider, before removing the old, so the rb is never active with 0 colliders
      this.rigidbody.removeShape(oldCollider); //remove the old collider
      this.collider.userData = this; //reset the extra information so that this collider knows to which Fudge Component it's connected
      this.collider.setCollisionGroup(this.collisionGroup);
      if (this.collisionGroup == PHYSICS_GROUP.TRIGGER) //Trigger not collidering with anythign so their mask is only colliding with trigger
        this.collider.setCollisionMask(PHYSICS_GROUP.TRIGGER);
      else
        this.collider.setCollisionMask(this.colMask);
      if (this.rigidbody.getShapeList() != null) { //reset the informations about physics handling, has to be done because the shape is new
        this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
        this.rigidbody.getShapeList().setFriction(this.bodyFriction);
      }
      let mutator: Mutator = {};
      mutator["scaling"] = _value;
      this.getContainer().mtxLocal.mutate(mutator);
    }
    //#region Velocity and Forces

    /**
    * Get the current VELOCITY of the {@link Node}
    */
    public getVelocity(): Vector3 {
      let velocity: OIMO.Vec3 = this.rigidbody.getLinearVelocity();
      return new Vector3(velocity.x, velocity.y, velocity.z);
    }


    /**
     * Sets the current VELOCITY of the {@link Node}
     */
    public setVelocity(_value: Vector3): void {
      let velocity: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.rigidbody.setLinearVelocity(velocity);
    }

    /**
* Get the current ANGULAR - VELOCITY of the {@link Node}
*/
    public getAngularVelocity(): Vector3 {
      let velocity: OIMO.Vec3 = this.rigidbody.getAngularVelocity();
      return new Vector3(velocity.x, velocity.y, velocity.z);
    }


    /**
   * Sets the current ANGULAR - VELOCITY of the {@link Node}
   */
    public setAngularVelocity(_value: Vector3): void {
      let velocity: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.rigidbody.setAngularVelocity(velocity);
    }


    /**
    * Applies a continous FORCE at the center of the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS.
    * The force is measured in newton, 1kg needs about 10 Newton to fight against gravity.
    */
    public applyForce(_force: Vector3): void {
      this.rigidbody.applyForceToCenter(new OIMO.Vec3(_force.x, _force.y, _force.z));
    }

    /**
    * Applies a continous FORCE at a specific point in the world to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    */
    public applyForceAtPoint(_force: Vector3, _worldPoint: Vector3): void {
      this.rigidbody.applyForce(new OIMO.Vec3(_force.x, _force.y, _force.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
    }

    /**
    * Applies a continous ROTATIONAL FORCE (Torque) to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    */
    public applyTorque(_rotationalForce: Vector3): void {
      this.rigidbody.applyTorque(new OIMO.Vec3(_rotationalForce.x, _rotationalForce.y, _rotationalForce.z));
    }

    /**
    * Applies a instant FORCE at a point/rigidbodycenter to the RIGIDBODY in the three dimensions. Considering the rigidbod's MASS
    * Influencing the angular speed and the linear speed. 
    */
    public applyImpulseAtPoint(_impulse: Vector3, _worldPoint: Vector3 = null): void {
      _worldPoint = _worldPoint != null ? _worldPoint : this.getPosition();
      this.rigidbody.applyImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
    }

    /**
    * Applies a instant FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    * Only influencing it's speed not rotation.
    */
    public applyLinearImpulse(_impulse: Vector3): void {
      this.rigidbody.applyLinearImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z));
    }

    /**
   * Applies a instant ROTATIONAL-FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
   * Only influencing it's rotation.
   */
    public applyAngularImpulse(_rotationalImpulse: Vector3): void {
      this.rigidbody.applyAngularImpulse(new OIMO.Vec3(_rotationalImpulse.x, _rotationalImpulse.y, _rotationalImpulse.z));
    }

    /**
   * Changing the VELOCITY of the RIGIDBODY. Only influencing the linear speed not angular
   */
    public addVelocity(_value: Vector3): void {
      this.rigidbody.addLinearVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /**
   * Changing the VELOCITY of the RIGIDBODY. Only influencing the angular speed not the linear
   */
    public addAngularVelocity(_value: Vector3): void {
      this.rigidbody.addAngularVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /** Stops the rigidbody from sleeping when movement is too minimal. Decreasing performance, for rarely more precise physics results */
    public deactivateAutoSleep(): void {
      this.rigidbody.setAutoSleep(false);
    }

    public activateAutoSleep(): void {
      this.rigidbody.setAutoSleep(true);
    }

    //#endregion

    //#events

    /**
     * Sends a ray through this specific body ignoring the rest of the world and checks if this body was hit by the ray,
     * returning info about the hit. Provides the same functionality and information a regular raycast does but the ray is only testing against this specific body.
     */
    public raycastThisBody(_origin: Vector3, _direction: Vector3, _length: number): RayHitInfo {
      let hitInfo: RayHitInfo = new RayHitInfo();
      let geometry: OIMO.Geometry = this.rigidbody.getShapeList().getGeometry();
      let transform: OIMO.Transform = this.rigidbody.getTransform();
      let scaledDirection: Vector3 = _direction.copy;
      scaledDirection.scale(_length);
      let endpoint: Vector3 = Vector3.SUM(scaledDirection, _origin.copy);
      let oimoRay: OIMO.RayCastHit = new OIMO.RayCastHit();
      let hit: boolean = geometry.rayCast(new OIMO.Vec3(_origin.x, _origin.y, _origin.z), new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z), transform, oimoRay); //the actual OimoPhysics Raycast
      if (hit) {  //If hit return a bunch of informations about the hit
        hitInfo.hit = true;
        hitInfo.hitPoint = new Vector3(oimoRay.position.x, oimoRay.position.y, oimoRay.position.z);
        hitInfo.hitNormal = new Vector3(oimoRay.normal.x, oimoRay.normal.y, oimoRay.normal.z);
        let dx: number = _origin.x - hitInfo.hitPoint.x;  //calculate hit distance
        let dy: number = _origin.y - hitInfo.hitPoint.y;
        let dz: number = _origin.z - hitInfo.hitPoint.z;
        hitInfo.hitDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        hitInfo.rigidbodyComponent = this;
        hitInfo.rayOrigin = _origin;
        hitInfo.rayEnd = endpoint;
      } else { //Only tell the origin, and the hit point is the end of the ray.
        hitInfo.rayOrigin = _origin;
        hitInfo.hitPoint = new Vector3(endpoint.x, endpoint.y, endpoint.z);
      }
      if (Physics.settings.debugDraw) {
        Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new Color(0, 1, 0, 1));
      }
      return hitInfo;
    }


    //#region Saving/Loading - Some properties might be missing, e.g. convexMesh (Float32Array)
    public serialize(): Serialization {
      let serialization: Serialization = {
        pivot: this.mtxPivot.serialize(),
        id: this.id,
        physicsType: this.rbType,
        mass: this.massData.mass,
        colliderType: this.colType,
        linearDamping: this.linDamping,
        angularDamping: this.angDamping,
        collisionGroup: this.colGroup,
        rotationInfluence: this.rotationalInfluenceFactor,
        gravityScale: this.gravityInfluenceFactor,
        friction: this.bodyFriction,
        restitution: this.bodyRestitution,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mtxPivot.deserialize(_serialization.pivot);
      this.id = _serialization.id;
      this.physicsType = _serialization.physicsType;
      this.mass = _serialization.mass != null ? _serialization.mass : 1;
      this.colliderType = _serialization.colliderType != null ? _serialization.colliderType : COLLIDER_TYPE.CUBE;
      this.linearDamping = _serialization.linearDamping != null ? _serialization.linearDamping : this.linDamping;
      this.angularDamping = _serialization.angularDamping != null ? _serialization.angularDamping : this.angDamping;
      this.collisionGroup = _serialization.collisionGroup != null ? _serialization.collisionGroup : this.colGroup;
      this.rotationInfluenceFactor = _serialization.rotationInfluence != null ? _serialization.rotationInfluence : this.rotationalInfluenceFactor;
      this.gravityScale = _serialization.gravityScale != null ? _serialization.gravityScale : 1;
      this.friction = _serialization.friction != null ? _serialization.friction : this.bodyFriction;
      this.restitution = _serialization.restitution != null ? _serialization.restitution : this.bodyRestitution;
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    /** Change properties by an associative array */
    public async mutate(_mutator: Mutator): Promise<void> {
      if (_mutator["friction"])
        this.friction = <number>_mutator["friction"];
      if (_mutator["restitution"])
        this.restitution = <number>_mutator["restituion"];
      if (_mutator["mass"])
        this.mass = <number>_mutator["mass"];
      if (_mutator["linearDamping"])
        this.linearDamping = <number>_mutator["linearDamping"];
      if (_mutator["angularDamping"])
        this.angularDamping = <number>_mutator["angularDamping"];
      if (_mutator["gravityScale"])
        this.gravityScale = <number>_mutator["gravityScale"];

      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    public reduceMutator(_mutator: Mutator): void {
      delete _mutator.convexMesh; //Convex Mesh can't be shown in the editor because float32Array is not a viable mutator
      delete _mutator.colMask;
    }
    //#endregion

    /** Creates the actual OimoPhysics Rigidbody out of informations the Fudge Component has. */
    private createRigidbody(_mass: number, _type: PHYSICS_TYPE, _colliderType: COLLIDER_TYPE, _mtxTransform: Matrix4x4, _collisionGroup: PHYSICS_GROUP = PHYSICS_GROUP.DEFAULT): void {
      let oimoType: number; //Need the conversion from simple enum to number because if enum is defined as Oimo.RigidyBodyType you have to include Oimo to use FUDGE at all
      switch (_type) {
        case PHYSICS_TYPE.DYNAMIC:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
        case PHYSICS_TYPE.STATIC:
          oimoType = OIMO.RigidBodyType.STATIC;
          break;
        case PHYSICS_TYPE.KINEMATIC:
          oimoType = OIMO.RigidBodyType.KINEMATIC;
          break;
        default:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
      }
      let tmpTransform: Matrix4x4 = _mtxTransform == null ? super.getContainer() != null ? super.getContainer().mtxWorld : Matrix4x4.IDENTITY() : _mtxTransform; //Get transform informations from the world, since physics does not care about hierarchy
      //Convert informations from Fudge to OimoPhysics and creating a collider with it, while also adding a pivot to derivate from the transform informations if needed
      let scale: OIMO.Vec3 = new OIMO.Vec3((tmpTransform.scaling.x * this.mtxPivot.scaling.x) / 2, (tmpTransform.scaling.y * this.mtxPivot.scaling.y) / 2, (tmpTransform.scaling.z * this.mtxPivot.scaling.z) / 2);
      let position: OIMO.Vec3 = new OIMO.Vec3(tmpTransform.translation.x + this.mtxPivot.translation.x, tmpTransform.translation.y + this.mtxPivot.translation.y, tmpTransform.translation.z + this.mtxPivot.translation.z);
      let rotation: OIMO.Vec3 = new OIMO.Vec3(tmpTransform.rotation.x + this.mtxPivot.rotation.x, tmpTransform.rotation.y + this.mtxPivot.rotation.y, tmpTransform.rotation.z + this.mtxPivot.rotation.z);
      this.createCollider(scale, _colliderType);
      //Setting informations about mass, position/rotation and physical reaction type
      this.massData.mass = _mass; //_type != PHYSICS_TYPE.STATIC ? _mass : 0; //If a object is static it acts as if it has no mass
      this.rigidbodyInfo.type = oimoType;
      this.rigidbodyInfo.position = position;
      this.rigidbodyInfo.rotation.fromEulerXyz(new OIMO.Vec3(rotation.x, rotation.y, rotation.z)); //Convert eulerAngles in degree to the internally used quaternions
      //Creating the actual rigidbody and it's collider
      this.rigidbody = new OIMO.RigidBody(this.rigidbodyInfo);
      this.collider = new OIMO.Shape(this.colliderInfo);
      //Filling the additional settings and informations the rigidbody needs. Who is colliding, how is the collision handled (damping, influence factors)
      this.collider.userData = this;
      this.collider.setCollisionGroup(_collisionGroup);
      if (_collisionGroup == PHYSICS_GROUP.TRIGGER)
        this.collider.setCollisionMask(PHYSICS_GROUP.TRIGGER);
      else
        this.collider.setCollisionMask(this.colMask);
      this.rigidbody.addShape(this.collider);
      this.rigidbody.setMassData(this.massData);
      this.rigidbody.getShapeList().setRestitution(this.bodyRestitution);
      this.rigidbody.getShapeList().setFriction(this.bodyFriction);
      this.rigidbody.setLinearDamping(this.linDamping);
      this.rigidbody.setAngularDamping(this.angDamping);
      this.rigidbody.setGravityScale(this.gravityInfluenceFactor);
      this.rigidbody.setRotationFactor(new OIMO.Vec3(this.rotationalInfluenceFactor.x, this.rotationalInfluenceFactor.y, this.rotationalInfluenceFactor.z));
    }

    /** Creates a collider a shape that represents the object in the physical world.  */
    private createCollider(_scale: OIMO.Vec3, _colliderType: COLLIDER_TYPE): void {
      let shapeConf: OIMO.ShapeConfig = new OIMO.ShapeConfig(); //Collider with geometry and infos like friction/restitution and more
      let geometry: OIMO.Geometry;
      if (this.colliderType != _colliderType) //If the collider type was changed set the internal one new, else don't so there is not infinite set calls
        this.colliderType = _colliderType;
      switch (_colliderType) {  //Create a different OimoPhysics geometry based on the given type. That is only the mathematical shape of the collider
        case COLLIDER_TYPE.CUBE:
          geometry = new OIMO.BoxGeometry(_scale);
          break;
        case COLLIDER_TYPE.SPHERE:
          geometry = new OIMO.SphereGeometry(_scale.x);
          break;
        case COLLIDER_TYPE.CAPSULE:
          geometry = new OIMO.CapsuleGeometry(_scale.x, _scale.y);
          break;
        case COLLIDER_TYPE.CYLINDER:
          geometry = new OIMO.CylinderGeometry(_scale.x, _scale.y);
          break;
        case COLLIDER_TYPE.CONE:
          geometry = new OIMO.ConeGeometry(_scale.x, _scale.y);
          break;
        case COLLIDER_TYPE.PYRAMID:
          geometry = this.createConvexGeometryCollider(this.createPyramidVertices(), _scale);
          break;
        case COLLIDER_TYPE.CONVEX:
          geometry = this.createConvexGeometryCollider(this.convexMesh, _scale);
          break;
      }
      shapeConf.geometry = geometry;
      this.colliderInfo = shapeConf; //the configuration informations that are used to add an actual collider to the rigidbody in createRigidbody
    }

    /** Creating a shape that represents a in itself closed form, out of the given vertices. */
    private createConvexGeometryCollider(_vertices: Float32Array, _scale: OIMO.Vec3): OIMO.ConvexHullGeometry {
      let verticesAsVec3: OIMO.Vec3[] = new Array(); //Convert Fudge Vector3 to OimoVec3
      for (let i: number = 0; i < _vertices.length; i += 3) { //3 Values for one point
        verticesAsVec3.push(new OIMO.Vec3(_vertices[i] * _scale.x, _vertices[i + 1] * _scale.y, _vertices[i + 2] * _scale.z));
      }
      return new OIMO.ConvexHullGeometry(verticesAsVec3); //Tell OimoPhysics to create a hull that involves all points but close it of. A convex shape can not have a hole in it.
    }

    /** Internal implementation of vertices that construct a pyramid. The vertices of the implemented pyramid mesh can be used too. But they are halfed and double sided, so it's more performant to use this. */
    private createPyramidVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array([
        /*0*/-1, 0, 1, /*1*/ 1, 0, 1,  /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
        /*4*/ 0, 2, 0
      ]);
      return vertices;
    }

    /** Adding this ComponentRigidbody to the Physiscs.world giving the oimoPhysics system the information needed */
    private addRigidbodyToWorld(): void {
      Physics.world.addRigidbody(this);
    }

    /** Removing this ComponentRigidbody from the Physiscs.world taking the informations from the oimoPhysics system */
    private removeRigidbodyFromWorld(): void {
      if (this.colGroup == PHYSICS_GROUP.TRIGGER) { //Delete check for this trigger from world if this component is removed
        Physics.world.unregisterTrigger(this);
      }
      Physics.world.removeRigidbody(this);
    }


    //#region private EVENT functions
    /** Check if two OimoPhysics Shapes collide with each other. By overlapping their approximations */
    private collidesWith(triggerRigidbody: OIMO.RigidBody, secondRigidbody: OIMO.RigidBody): boolean {
      let shape1: OIMO.Aabb = triggerRigidbody.getShapeList().getAabb();
      let shape2: OIMO.Aabb = secondRigidbody.getShapeList().getAabb();

      let colliding: boolean = shape1.overlap(shape2);
      return colliding;
    }
    /** Find the approximated entry point of a trigger event. To give the event a approximated information where to put something in the world when a triggerEvent has happened */
    private getTriggerEnterPoint(triggerRigidbody: OIMO.RigidBody, secondRigidbody: OIMO.RigidBody): Vector3 {
      let shape1: OIMO.Aabb = triggerRigidbody.getShapeList().getAabb();
      let shape2: OIMO.Aabb = secondRigidbody.getShapeList().getAabb();
      //Center of a intersection should be the origion of the collision, because the triggering just happened so one or two touching points the center of it is the entry point
      let intersect: OIMO.Vec3 = shape1.getIntersection(shape2).getCenter();
      return new Vector3(intersect.x, intersect.y, intersect.z);
    }

    /**
     * Events in case a body is in a trigger, so not only the body registers a triggerEvent but also the trigger itself.
     */
    private checkBodiesInTrigger(): void {
      let possibleBodies: ComponentRigidbody[] = Physics.world.getBodyList(); //Since this is a trigger it checks itself against everybody in the world
      let event: EventPhysics;
      //ADD
      possibleBodies.forEach((value: ComponentRigidbody) => {
        let overlapping: boolean = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
        if (overlapping && this.bodiesInTrigger.indexOf(value) == -1) {
          this.bodiesInTrigger.push(value);
          let enterPoint: Vector3 = this.getTriggerEnterPoint(this.getOimoRigidbody(), value.getOimoRigidbody());
          event = new EventPhysics(EVENT_PHYSICS.TRIGGER_ENTER, value, 0, 0, 0, enterPoint);
          this.dispatchEvent(event);
        }
      });
      //REMOVE
      this.bodiesInTrigger.forEach((value: ComponentRigidbody) => { //Every Collider in the list is checked if the collision is still happening
        let isTriggering: boolean = this.collidesWith(this.getOimoRigidbody(), value.getOimoRigidbody());
        if (isTriggering == false) {
          let index: number = this.bodiesInTrigger.indexOf(value);
          this.bodiesInTrigger.splice(index);
          event = new EventPhysics(EVENT_PHYSICS.TRIGGER_EXIT, value, 0, 0, 0);
          this.dispatchEvent(event);
        }
      });
    }

    //Calculating the center of a collision as a singular point - in case there is more than one point - by getting the geometrical center of all colliding points
    private collisionCenterPoint(_colPoints: OIMO.ManifoldPoint[], _numPoints: number): OIMO.Vec3 {
      let center: OIMO.Vec3;
      let totalPoints: number = 0;
      let totalX: number = 0;
      let totalY: number = 0;
      let totalZ: number = 0;
      _colPoints.forEach((value: OIMO.ManifoldPoint): void => {
        if (totalPoints < _numPoints) {
          totalPoints++;
          totalX += value.getPosition2().x;
          totalY += value.getPosition2().y;
          totalZ += value.getPosition2().z;
        }
      });
      center = new OIMO.Vec3(totalX / _numPoints, totalY / _numPoints, totalZ / _numPoints);
      return center;
    }
    //#endregion
  }
}