namespace FudgeCore {
  /**
   * Defines automatic adjustment of the collider
   */
  export enum BODY_INIT {
    /** Collider uses the pivot of the mesh for initilialization */
    TO_MESH,
    /** Collider uses the transform of the node for initilialization */
    TO_NODE,
    /** Collider uses its own pivot for initilialization */
    TO_PIVOT
  }

  /**
     * Acts as the physical representation of the {@link Node} it's attached to.
     * It's the connection between the Fudge rendered world and the Physics world.
     * For the physics to correctly get the transformations rotations need to be applied with from left = true.
     * Or rotations need to happen before scaling.
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
  export class ComponentRigidbody extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentRigidbody);

    /** Transformation of the collider relative to the node's transform. Once set mostly remains constant. 
     * If altered, {@link isInitialized} must be reset to false to recreate the collider in the next {@link Render.prepare}
     */
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();

    /** 
     * Vertices that build a convex mesh (form that is in itself closed). Needs to set in the construction of the rb if none of the standard colliders is used. 
     * Untested and not yet fully supported by serialization and mutation.
     */
    public convexMesh: Float32Array = null;

    /** Collisions with rigidbodies happening to this body, can be used to build a custom onCollisionStay functionality. */
    public collisions: ComponentRigidbody[] = new Array();
    /** Triggers that are currently triggering this body */
    public triggerings: ComponentRigidbody[] = new Array();

    /** 
     * The groups this object collides with. Groups must be writen in form of
     *  e.g. collisionMask = {@link COLLISION_GROUP.DEFAULT} | {@link COLLISION_GROUP}.... and so on to collide with multiple groups. 
     */
    public collisionMask: number;

    /** 
     * Automatic adjustment of the pivot when {@link Render.prepare} is called according to {@link BODY_INIT}
     */
    public initialization: BODY_INIT = BODY_INIT.TO_PIVOT;
    /** Marks if collider was initialized. Reset to false to initialize again e.g. after manipulation of mtxPivot */
    public isInitialized: boolean = false;

    /** ID to reference this specific ComponentRigidbody */
    #id: number = 0;

    //Private informations - Mostly OimoPhysics variables that should not be exposed to the Fudge User and manipulated by them
    #collider: OIMO.Shape;
    #colliderInfo: OIMO.ShapeConfig;
    #collisionGroup: COLLISION_GROUP = COLLISION_GROUP.DEFAULT;
    #typeCollider: COLLIDER_TYPE = COLLIDER_TYPE.CUBE;

    #rigidbody: OIMO.RigidBody;
    #rigidbodyInfo: OIMO.RigidBodyConfig = new OIMO.RigidBodyConfig();
    #typeBody: BODY_TYPE = BODY_TYPE.DYNAMIC;

    #massData: OIMO.MassData = new OIMO.MassData();
    #restitution: number;
    #friction: number;
    #dampingLinear: number = 0.1;
    #dampingAngular: number = 0.1;
    #effectRotation: Vector3 = Vector3.ONE();
    #effectGravity: number = 1;
    #isTrigger: boolean = false;
    #mtxPivotUnscaled: Matrix4x4 = Matrix4x4.IDENTITY();
    #mtxPivotInverse: Matrix4x4 = Matrix4x4.IDENTITY();

    #callbacks: OIMO.ContactCallback; //Callback Methods when within the oimoSystem a event is happening

    /** Creating a new rigidbody with a weight in kg, a physics type (default = dynamic), a collider type what physical form has the collider, to what group does it belong, is there a transform Matrix that should be used, and is the collider defined as a group of points that represent a convex mesh. */
    constructor(_mass: number = 1, _type: BODY_TYPE = BODY_TYPE.DYNAMIC, _colliderType: COLLIDER_TYPE = COLLIDER_TYPE.CUBE, _group: COLLISION_GROUP = Physics.settings.defaultCollisionGroup, _mtxTransform: Matrix4x4 = null, _convexMesh: Float32Array = null) {
      super();
      this.create(_mass, _type, _colliderType, _group, _mtxTransform, _convexMesh);
    }

    //#region Accessors
    public get id(): number {
      return this.#id;
    }

    /** Used for calculation of the geometrical relationship of node and collider by {@link Render}*/
    public get mtxPivotInverse(): Matrix4x4 {
      return this.#mtxPivotInverse;
    }
    /** Used for calculation of the geometrical relationship of node and collider by {@link Render}*/
    public get mtxPivotUnscaled(): Matrix4x4 {
      return this.#mtxPivotUnscaled;
    }

    /** Retrieve the body type. See {@link BODY_TYPE} */
    public get typeBody(): BODY_TYPE {
      return this.#typeBody;
    }
    /** Set the body type. See {@link BODY_TYPE} */
    public set typeBody(_value: BODY_TYPE) {
      this.#typeBody = _value;
      let oimoType: number;
      switch (this.#typeBody) {
        case BODY_TYPE.DYNAMIC:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
        case BODY_TYPE.STATIC:
          oimoType = OIMO.RigidBodyType.STATIC;
          break;
        case BODY_TYPE.KINEMATIC:
          oimoType = OIMO.RigidBodyType.KINEMATIC;
          break;
        default:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
      }
      this.#rigidbody.setType(oimoType);
      this.#rigidbody.setMassData(this.#massData); //have to reset mass after changing the type, since Oimo is handling mass internally wrong when switching types
    }

    /** The shape that represents the {@link Node} in the physical world. Default is a Cube. */
    public get typeCollider(): COLLIDER_TYPE {
      return this.#typeCollider;
    }
    public set typeCollider(_value: COLLIDER_TYPE) {
      if (_value != this.#typeCollider && this.#rigidbody != null) {
        this.#typeCollider = _value;
        this.initialize();
      }
    }

    /** The collision group this {@link Node} belongs to it's the default group normally which means it physically collides with every group besides trigger. */
    public get collisionGroup(): COLLISION_GROUP {
      return this.#collisionGroup;
    }
    public set collisionGroup(_value: COLLISION_GROUP) {
      this.#collisionGroup = _value;
      if (this.#rigidbody != null)
        this.#rigidbody.getShapeList().setCollisionGroup(this.#collisionGroup);
    }

    /** Marking the Body as a trigger therefore not influencing the collision system but only sending triggerEvents */
    public get isTrigger(): boolean {
      return this.#isTrigger;
    }
    public set isTrigger(_value: boolean) {
      this.#isTrigger = _value;
      if (this.getOimoRigidbody() != null) {
        this.getOimoRigidbody()._isTrigger = this.#isTrigger;
      }
    }

    /**
     * Returns the physical weight of the {@link Node}
     */
    public get mass(): number {
      return this.#rigidbody.getMass();
    }
    /**
     * Setting the physical weight of the {@link Node} in kg
     */
    public set mass(_value: number) {
      this.#massData.mass = _value;
      if (this.node != null)
        if (this.#rigidbody != null)
          this.#rigidbody.setMassData(this.#massData);
    }

    /** Drag of linear movement. A Body does slow down even on a surface without friction. */
    public get dampTranslation(): number {
      return this.#rigidbody.getLinearDamping();
    }
    public set dampTranslation(_value: number) {
      this.#dampingLinear = _value;
      this.#rigidbody.setLinearDamping(_value);
    }

    /** Drag of rotation. */
    public get dampRotation(): number {
      return this.#rigidbody.getAngularDamping();
    }
    public set dampRotation(_value: number) {
      this.#dampingAngular = _value;
      this.#rigidbody.setAngularDamping(_value);
    }

    /** The factor this rigidbody reacts rotations that happen in the physical world. 0 to lock rotation this axis. */
    public get effectRotation(): Vector3 {
      return this.#effectRotation;
    }
    public set effectRotation(_effect: Vector3) {
      this.#effectRotation = _effect;
      this.#rigidbody.setRotationFactor(new OIMO.Vec3(this.#effectRotation.x, this.#effectRotation.y, this.#effectRotation.z));
    }

    /** The factor this rigidbody reacts to world gravity. Default = 1 e.g. 1*9.81 m/s. */
    public get effectGravity(): number {
      return this.#effectGravity;
    }
    public set effectGravity(_effect: number) {
      this.#effectGravity = _effect;
      if (this.#rigidbody != null) this.#rigidbody.setGravityScale(this.#effectGravity);
    }

    /**
     * Get the friction of the rigidbody, which is the factor of sliding resistance of this rigidbody on surfaces
     */
    public get friction(): number {
      return this.#friction;
    }

    /**
     * Set the friction of the rigidbody, which is the factor of  sliding resistance of this rigidbody on surfaces
     */
    public set friction(_friction: number) {
      this.#friction = _friction;
      if (this.#rigidbody.getShapeList() != null)
        this.#rigidbody.getShapeList().setFriction(this.#friction);
    }

    /**
     * Get the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
     */
    public get restitution(): number {
      return this.#restitution;
    }

    /**
     * Set the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
     */
    public set restitution(_restitution: number) {
      this.#restitution = _restitution;
      if (this.#rigidbody.getShapeList() != null)
        this.#rigidbody.getShapeList().setRestitution(this.#restitution);
    }
    //#endregion

    //#region Transformation
    /**
     * Returns the rigidbody in the form the physics engine is using it, should not be used unless a functionality
     * is not provided through the FUDGE Integration.
     */
    public getOimoRigidbody(): OIMO.RigidBody {
      return this.#rigidbody;
    }

    /** Rotating the rigidbody therefore changing it's rotation over time directly in physics. This way physics is changing instead of transform. 
     *  But you are able to incremental changing it instead of a direct rotation.  Although it's always prefered to use forces in physics.
     */
    public rotateBody(_rotationChange: Vector3): void {
      this.#rigidbody.rotateXyz(new OIMO.Vec3(_rotationChange.x * Math.PI / 180, _rotationChange.y * Math.PI / 180, _rotationChange.z * Math.PI / 180));
    }

    /** Translating the rigidbody therefore changing it's place over time directly in physics. This way physics is changing instead of transform. 
     *  But you are able to incrementally changing it instead of a direct position. Although it's always prefered to use forces in physics. 
     */
    public translateBody(_translationChange: Vector3): void {
      this.#rigidbody.translate(new OIMO.Vec3(_translationChange.x, _translationChange.y, _translationChange.z));
    }

    /**
     * Get the current POSITION of the {@link Node} in the physical space
     */
    public getPosition(): Vector3 {
      let tmpPos: OIMO.Vec3 = this.#rigidbody.getPosition();
      return new Vector3(tmpPos.x, tmpPos.y, tmpPos.z);
    }

    /**
     * Sets the current POSITION of the {@link Node} in the physical space
     */
    public setPosition(_value: Vector3): void {
      this.#rigidbody.setPosition(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /**
     * Get the current ROTATION of the {@link Node} in the physical space. Note this range from -pi to pi, so -90 to 90.
     */
    public getRotation(): Vector3 {
      let orientation: OIMO.Quat = this.#rigidbody.getOrientation();
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
      this.#rigidbody.setOrientation(quat);
    }


    /** Get the current SCALING in the physical space. */
    public getScaling(): Vector3 {
      let scaling: Vector3 = this.node.mtxWorld.scaling.clone;
      scaling.x *= this.mtxPivot.scaling.x;
      scaling.y *= this.mtxPivot.scaling.y;
      scaling.z *= this.mtxPivot.scaling.z;
      return scaling;
    }

    /** Scaling requires the collider to be completely recreated anew */
    public setScaling(_value: Vector3): void {
      // let scaling: Vector3 = _value.clone;   
      this.createCollider(new OIMO.Vec3(_value.x / 2, _value.y / 2, _value.z / 2), this.#typeCollider); //recreate the collider
      this.#collider = new OIMO.Shape(this.#colliderInfo);
      let oldCollider: OIMO.Shape = this.#rigidbody.getShapeList();
      this.#rigidbody.addShape(this.#collider); //add new collider, before removing the old, so the rb is never active with 0 colliders
      this.#rigidbody.removeShape(oldCollider); //remove the old collider
      this.#collider.userData = this; //reset the extra information so that this collider knows to which Fudge Component it's connected
      this.#collider.setCollisionGroup(this.collisionGroup);
      this.#collider.setCollisionMask(this.collisionMask);
      
      this.#collider.setRestitution(this.#restitution);
      this.#collider.setFriction(this.#friction);
      this.#collider.setContactCallback(this.#callbacks);
    }

    /**
     * Initializes the rigidbody according to its initialization setting to match the mesh, the node or its own pivot matrix
     */
    public initialize(): void {
      if (!this.node) // dealay initialization until this rigidbody is attached to a node
        return;
      switch (Number(this.initialization)) {
        case BODY_INIT.TO_NODE:
          this.mtxPivot = Matrix4x4.IDENTITY();
          break;
        case BODY_INIT.TO_MESH:
          let cmpMesh: ComponentMesh = this.node.getComponent(ComponentMesh);
          if (cmpMesh)
            this.mtxPivot = cmpMesh.mtxPivot.clone;
          break;
        case BODY_INIT.TO_PIVOT:
          break;
      }
      let mtxWorld: Matrix4x4 = Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);

      let position: Vector3 = mtxWorld.translation; //Adding the offsets from the pivot
      let rotation: Vector3 = mtxWorld.getEulerAngles();
      let scaling: Vector3 = mtxWorld.scaling;  
      //scaling requires collider to be recreated
      this.setScaling(scaling);

      this.#rigidbody.setMassData(this.#massData);
      this.setPosition(position); //set the actual new rotation/position for this Rb again since it's now updated
      this.setRotation(rotation);

      this.#mtxPivotUnscaled = Matrix4x4.CONSTRUCTION({ translation: this.mtxPivot.translation, rotation: this.mtxPivot.rotation, scaling: Vector3.ONE() });
      this.#mtxPivotInverse = Matrix4x4.INVERSION(this.#mtxPivotUnscaled);

      this.isInitialized = true;
    }
    //#endregion

    //#region Velocity and Forces
    /**
    * Get the current VELOCITY of the {@link Node}
    */
    public getVelocity(): Vector3 {
      let velocity: OIMO.Vec3 = this.#rigidbody.getLinearVelocity();
      return new Vector3(velocity.x, velocity.y, velocity.z);
    }


    /**
     * Sets the current VELOCITY of the {@link Node}
     */
    public setVelocity(_value: Vector3): void {
      let velocity: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.#rigidbody.setLinearVelocity(velocity);
    }

    /**
     * Get the current ANGULAR - VELOCITY of the {@link Node}
     */
    public getAngularVelocity(): Vector3 {
      let velocity: OIMO.Vec3 = this.#rigidbody.getAngularVelocity();
      return new Vector3(velocity.x, velocity.y, velocity.z);
    }


    /**
     * Sets the current ANGULAR - VELOCITY of the {@link Node}
     */
    public setAngularVelocity(_value: Vector3): void {
      let velocity: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.#rigidbody.setAngularVelocity(velocity);
    }


    /**
    * Applies a continous FORCE at the center of the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS.
    * The force is measured in newton, 1kg needs about 10 Newton to fight against gravity.
    */
    public applyForce(_force: Vector3): void {
      this.#rigidbody.applyForceToCenter(new OIMO.Vec3(_force.x, _force.y, _force.z));
    }

    /**
    * Applies a continous FORCE at a specific point in the world to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    */
    public applyForceAtPoint(_force: Vector3, _worldPoint: Vector3): void {
      this.#rigidbody.applyForce(new OIMO.Vec3(_force.x, _force.y, _force.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
    }

    /**
    * Applies a continous ROTATIONAL FORCE (Torque) to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    */
    public applyTorque(_rotationalForce: Vector3): void {
      this.#rigidbody.applyTorque(new OIMO.Vec3(_rotationalForce.x, _rotationalForce.y, _rotationalForce.z));
    }

    /**
    * Applies a instant FORCE at a point/rigidbodycenter to the RIGIDBODY in the three dimensions. Considering the rigidbod's MASS
    * Influencing the angular speed and the linear speed. 
    */
    public applyImpulseAtPoint(_impulse: Vector3, _worldPoint: Vector3 = null): void {
      _worldPoint = _worldPoint != null ? _worldPoint : this.getPosition();
      this.#rigidbody.applyImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
    }

    /**
    * Applies a instant FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
    * Only influencing it's speed not rotation.
    */
    public applyLinearImpulse(_impulse: Vector3): void {
      this.#rigidbody.applyLinearImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z));
    }

    /**
   * Applies a instant ROTATIONAL-FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
   * Only influencing it's rotation.
   */
    public applyAngularImpulse(_rotationalImpulse: Vector3): void {
      this.#rigidbody.applyAngularImpulse(new OIMO.Vec3(_rotationalImpulse.x, _rotationalImpulse.y, _rotationalImpulse.z));
    }

    /**
   * Changing the VELOCITY of the RIGIDBODY. Only influencing the linear speed not angular
   */
    public addVelocity(_value: Vector3): void {
      this.#rigidbody.addLinearVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /**
   * Changing the VELOCITY of the RIGIDBODY. Only influencing the angular speed not the linear
   */
    public addAngularVelocity(_value: Vector3): void {
      this.#rigidbody.addAngularVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
    }

    /** Stops the rigidbody from sleeping when movement is too minimal. Decreasing performance, for rarely more precise physics results */
    public deactivateAutoSleep(): void {
      this.#rigidbody.setAutoSleep(false);
    }

    public activateAutoSleep(): void {
      this.#rigidbody.setAutoSleep(true);
    }
    //#endregion

    //#region Collision
    /**
     * Checking for Collision with other Colliders and dispatches a custom event with information about the collider.
     * Automatically called in the RenderManager, no interaction needed.
     */
    public checkCollisionEvents(): void {
      let list: OIMO.ContactLink = this.#rigidbody.getContactLinkList(); //all physical contacts between colliding bodies on this rb
      let objHit: ComponentRigidbody; //collision consisting of 2 bodies, so Hit1/2
      let objHit2: ComponentRigidbody;
      let event: EventPhysics;  //The event that will be send and the informations added to it
      let normalImpulse: number = 0;
      let binormalImpulse: number = 0;
      let tangentImpulse: number = 0;
      let colPoint: Vector3;
      //ADD NEW Collision - That just happened
      for (let i: number = 0; i < this.#rigidbody.getNumContactLinks(); i++) {
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
        list = this.#rigidbody.getContactLinkList();
        for (let i: number = 0; i < this.#rigidbody.getNumContactLinks(); i++) {
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
     * Sends a ray through this specific body ignoring the rest of the world and checks if this body was hit by the ray,
     * returning info about the hit. Provides the same functionality and information a regular raycast does but the ray is only testing against this specific body.
     */
    public raycastThisBody(_origin: Vector3, _direction: Vector3, _length: number): RayHitInfo {
      let hitInfo: RayHitInfo = new RayHitInfo();
      let geometry: OIMO.Geometry = this.#rigidbody.getShapeList().getGeometry();
      let transform: OIMO.Transform = this.#rigidbody.getTransform();
      let scaledDirection: Vector3 = _direction.clone;
      scaledDirection.scale(_length);
      let endpoint: Vector3 = Vector3.SUM(scaledDirection, _origin.clone);
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
    //#endregion


    //#region Saving/Loading - Some properties might be missing, e.g. convexMesh (Float32Array)
    public serialize(): Serialization {
      let serialization: Serialization = this.getMutator();

      delete serialization.mtxPivot;
      delete serialization.active;

      serialization.typeBody = BODY_TYPE[this.#typeBody];
      serialization.typeCollider = COLLIDER_TYPE[this.#typeCollider];
      serialization.initialization = BODY_INIT[this.initialization];

      serialization.id = this.#id;
      serialization.pivot = this.mtxPivot.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization[super.constructor.name]);
      this.mtxPivot.deserialize(_serialization.pivot);
      this.#id = _serialization.id;
      this.mass = _serialization.mass || this.mass;
      this.dampTranslation = _serialization.dampTranslation || this.dampTranslation;
      this.dampRotation = _serialization.dampRotation || this.dampRotation;
      this.collisionGroup = _serialization.collisionGroup || this.collisionGroup;
      this.effectRotation = _serialization.effectRotation || this.effectRotation;
      this.effectGravity = _serialization.effectGravity || this.effectGravity;
      this.friction = _serialization.friction || this.friction;
      this.restitution = _serialization.restitution || this.restitution;
      this.isTrigger = _serialization.trigger || this.isTrigger;
      this.initialization = _serialization.initialization;

      this.initialization = <number><unknown>BODY_INIT[_serialization.initialization];
      this.typeBody = <number><unknown>BODY_TYPE[_serialization.typeBody];
      this.typeCollider = <number><unknown>COLLIDER_TYPE[_serialization.typeCollider];
      // this.create(this.mass, this.#typeBody, this.#typeCollider, this.collisionGroup, null, this.convexMesh);
      return this;
    }

    /** Change properties by an associative array */
    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);

      let callIfExist: Function = (_key: string, _setter: Function) => {
        if (_mutator[_key])
          _setter(_mutator[_key]);
      };

      callIfExist("friction", (_value: number) => this.friction = _value);
      callIfExist("restitution", (_value: number) => this.restitution = _value);
      callIfExist("mass", (_value: number) => this.mass = _value);
      callIfExist("dampTranslation", (_value: number) => this.dampTranslation = _value);
      callIfExist("dampRotation", (_value: number) => this.dampRotation = _value);
      callIfExist("effectGravity", (_value: number) => this.effectGravity = _value);
      callIfExist("collisionGroup", (_value: COLLISION_GROUP) => this.collisionGroup = _value);
      callIfExist("typeBody", (_value: string) => this.typeBody = parseInt(_value));
      callIfExist("typeCollider", (_value: string) => this.typeCollider = parseInt(_value));

      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);

      mutator.friction = this.friction;
      mutator.restitution = this.restitution;
      mutator.mass = this.mass;
      mutator.dampTranslation = this.dampTranslation;
      mutator.dampRotation = this.dampRotation;
      mutator.effectGravity = this.effectGravity;
      mutator.typeBody = this.#typeBody;
      mutator.typeCollider = this.#typeCollider;
      mutator.isTrigger = this.#isTrigger;

      // Object.preventExtensions(mutator);
      return mutator;
    }

    public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
      let types: MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.typeBody)
        types.typeBody = BODY_TYPE;
      if (types.typeCollider)
        types.typeCollider = COLLIDER_TYPE;
      if (types.initialization)
        types.initialization = BODY_INIT;
      return types;
    }

    public reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.convexMesh; //Convex Mesh can't be shown in the editor because float32Array is not a viable mutator
      delete _mutator.collisionMask;
      delete _mutator.isInitialized;
    }
    //#endregion

    //#region Creation
    private create(_mass: number = 1, _type: BODY_TYPE = BODY_TYPE.DYNAMIC, _colliderType: COLLIDER_TYPE = COLLIDER_TYPE.CUBE, _group: COLLISION_GROUP = Physics.settings.defaultCollisionGroup, _mtxTransform: Matrix4x4 = null, _convexMesh: Float32Array = null): void {
      //Setting up all incoming values to be internal values
      this.convexMesh = _convexMesh;
      this.#typeBody = _type;
      this.#collisionGroup = _group;
      this.#typeCollider = _colliderType;
      this.mass = _mass;
      this.#restitution = Physics.settings.defaultRestitution;
      this.#friction = Physics.settings.defaultFriction;
      this.collisionMask = Physics.settings.defaultCollisionMask;
      //Create the actual rigidbody in the OimoPhysics Space
      this.createRigidbody(_mass, _type, this.#typeCollider, _mtxTransform, this.#collisionGroup);
      this.#id = Physics.world.distributeBodyID();

      // Event Callbacks directly from OIMO Physics
      this.#callbacks = new OIMO.ContactCallback(); //fehm
      this.#callbacks.beginTriggerContact = this.triggerEnter;
      this.#callbacks.endTriggerContact = this.triggerExit;

      //Handling adding/removing the component
      this.addEventListener(EVENT.COMPONENT_ADD, this.addRigidbodyToWorld);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeRigidbodyFromWorld);
    }

    /** Creates the actual OimoPhysics Rigidbody out of informations the Fudge Component has. */
    private createRigidbody(_mass: number, _type: BODY_TYPE, _colliderType: COLLIDER_TYPE, _mtxTransform: Matrix4x4, _collisionGroup: COLLISION_GROUP = COLLISION_GROUP.DEFAULT): void {
      let oimoType: number; //Need the conversion from simple enum to number because if enum is defined as Oimo.RigidyBodyType you have to include Oimo to use FUDGE at all
      switch (_type) {
        case BODY_TYPE.DYNAMIC:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
        case BODY_TYPE.STATIC:
          oimoType = OIMO.RigidBodyType.STATIC;
          break;
        case BODY_TYPE.KINEMATIC:
          oimoType = OIMO.RigidBodyType.KINEMATIC;
          break;
        default:
          oimoType = OIMO.RigidBodyType.DYNAMIC;
          break;
      }

      // remove all previous shapes from world. Necessary?
      // while (this.#rigidbody && this.#rigidbody.getShapeList() != null)
      //   this.#rigidbody.removeShape(this.#rigidbody.getShapeList());

      let tmpTransform: Matrix4x4 = _mtxTransform == null ? super.node != null ? super.node.mtxWorld : Matrix4x4.IDENTITY() : _mtxTransform; //Get transform informations from the world, since physics does not care about hierarchy
      //Convert informations from Fudge to OimoPhysics and creating a collider with it, while also adding a pivot to derivate from the transform informations if needed
      let scale: OIMO.Vec3 = new OIMO.Vec3((tmpTransform.scaling.x * this.mtxPivot.scaling.x) / 2, (tmpTransform.scaling.y * this.mtxPivot.scaling.y) / 2, (tmpTransform.scaling.z * this.mtxPivot.scaling.z) / 2);
      let position: OIMO.Vec3 = new OIMO.Vec3(tmpTransform.translation.x + this.mtxPivot.translation.x, tmpTransform.translation.y + this.mtxPivot.translation.y, tmpTransform.translation.z + this.mtxPivot.translation.z);
      let rotation: OIMO.Vec3 = new OIMO.Vec3(tmpTransform.rotation.x + this.mtxPivot.rotation.x, tmpTransform.rotation.y + this.mtxPivot.rotation.y, tmpTransform.rotation.z + this.mtxPivot.rotation.z);
      this.createCollider(scale, _colliderType);
      //Setting informations about mass, position/rotation and physical reaction type
      this.#massData.mass = _mass; //_type != PHYSICS_TYPE.STATIC ? _mass : 0; //If a object is static it acts as if it has no mass
      this.#rigidbodyInfo.type = oimoType;
      this.#rigidbodyInfo.position = position;
      this.#rigidbodyInfo.rotation.fromEulerXyz(new OIMO.Vec3(rotation.x, rotation.y, rotation.z)); //Convert eulerAngles in degree to the internally used quaternions
      //Creating the actual rigidbody and it's collider
      this.#rigidbody = new OIMO.RigidBody(this.#rigidbodyInfo);
      this.#collider = new OIMO.Shape(this.#colliderInfo);
      //Filling the additional settings and informations the rigidbody needs. Who is colliding, how is the collision handled (damping, influence factors)
      this.#collider.userData = this;
      this.#collider.setCollisionGroup(_collisionGroup);
      this.#collider.setCollisionMask(this.collisionMask);
      this.#rigidbody.addShape(this.#collider);
      this.#rigidbody.setMassData(this.#massData);
      this.#rigidbody.getShapeList().setRestitution(this.#restitution);
      this.#rigidbody.getShapeList().setFriction(this.#friction);
      this.#rigidbody.getShapeList().setContactCallback(this.#callbacks);
      this.#rigidbody.setLinearDamping(this.#dampingLinear);
      this.#rigidbody.setAngularDamping(this.#dampingAngular);
      this.#rigidbody.setGravityScale(this.#effectGravity);
      this.#rigidbody.setRotationFactor(new OIMO.Vec3(this.#effectRotation.x, this.#effectRotation.y, this.#effectRotation.z));
    }

    /** Creates a collider a shape that represents the object in the physical world.  */
    private createCollider(_scale: OIMO.Vec3, _colliderType: COLLIDER_TYPE): void {
      let shapeConf: OIMO.ShapeConfig = new OIMO.ShapeConfig(); //Collider with geometry and infos like friction/restitution and more
      let geometry: OIMO.Geometry;
      if (this.typeCollider != _colliderType) //If the collider type was changed set the internal one new, else don't so there is not infinite set calls
        this.typeCollider = _colliderType;
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
      this.#colliderInfo = shapeConf; //the configuration informations that are used to add an actual collider to the rigidbody in createRigidbody
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
      Physics.world.removeRigidbody(this);
    }


    //#region private EVENT functions
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


    /**
    * Trigger EnteringEvent Callback, automatically called by OIMO Physics within their calculations.
    * Since the event does not know which body is the trigger iniator, the event can be listened to
    * on either the trigger or the triggered. (This is only possible with the Fudge OIMO Fork!)
    */
    private triggerEnter(contact: OIMO.Contact): void {
      let objHit: ComponentRigidbody; //collision consisting of 2 bodies, so Hit1/2
      let objHit2: ComponentRigidbody;
      let event: EventPhysics;  //The event that will be send and the informations added to it
      let colPoint: Vector3;

      //ADD NEW Triggering - That just happened
      let collisionManifold: OIMO.Manifold = contact.getManifold(); //Manifold = Additional informations about the contact
      objHit = contact.getShape1().userData;  //Userdata is used to transfer the ƒ.ComponentRigidbody, it's an empty OimoPhysics Variable
      //Only register the collision on the actual touch, not on "shadowCollide", to register in the moment of impulse calculation
      if (objHit == null || contact.isTouching() == false) // only act if the collision is actual touching, so right at the moment when a impulse is happening, not when shapes overlap
        return;
      objHit2 = contact.getShape2().userData;
      if (objHit2 == null || contact.isTouching() == false)
        return;
      let points: OIMO.ManifoldPoint[] = collisionManifold.getPoints(); //All points in the collision where the two bodies are touching, used to calculate the full impact
      let normal: OIMO.Vec3 = collisionManifold.getNormal();
      if (objHit2.triggerings.indexOf(objHit) == -1) { //Fire, if the hit object is not the Body itself but another and it's not already fired.
        let colPos: OIMO.Vec3 = objHit2.collisionCenterPoint(points, collisionManifold.getNumPoints()); //THE point of collision is the first touching point (EXTENSION: could be the center of all touching points combined)
        colPoint = new Vector3(colPos.x, colPos.y, colPos.z);
        // Impulses are 0 since, there are no forces/impulses at work, else this would not be a trigger, but a collision
        objHit2.triggerings.push(objHit); //Tell the object that the event for this object does not need to be fired again
        event = new EventPhysics(EVENT_PHYSICS.TRIGGER_ENTER, objHit, 0, 0, 0, colPoint, new Vector3(normal.x, normal.y, normal.z)); //Building the actual event, with what object did collide and informations about it
        objHit2.dispatchEvent(event); //Sending the given event
      }
      if (objHit.triggerings.indexOf(objHit2) == -1) { //Same as the above but for the case the SECOND hit object is not the body itself
        let colPos: OIMO.Vec3 = objHit.collisionCenterPoint(points, collisionManifold.getNumPoints());
        colPoint = new Vector3(colPos.x, colPos.y, colPos.z);
        // Impulses are 0 since, there are no forces/impulses at work, else this would not be a trigger, but a collision,
        // also the event is handled before the actual solving impulse step in OIMO
        objHit.triggerings.push(objHit2);
        event = new EventPhysics(EVENT_PHYSICS.TRIGGER_ENTER, objHit2, 0, 0, 0, colPoint, new Vector3(normal.x, normal.y, normal.z));
        objHit.dispatchEvent(event);
      }
    }

    /**
    * Trigger LeavingEvent Callback, automatically called by OIMO Physics within their calculations.
    * Since the event does not know which body is the trigger iniator, the event can be listened to
    * on either the trigger or the triggered. (This is only possible with the Fudge OIMO Fork!)
    */
    private triggerExit(contact: OIMO.Contact): void {
      //REMOVE OLD Triggering Body
      let objHit: ComponentRigidbody; //collision consisting of 2 bodies, so Hit1/2
      let objHit2: ComponentRigidbody;
      let event: EventPhysics;  //The event that will be send and the informations added to it
      objHit = contact.getShape1().userData;
      objHit2 = contact.getShape2().userData;

      // Remove both bodies in both cases, of self and other
      let index: number = objHit.triggerings.indexOf(objHit2); //Find object in the array
      if (index != -1) {
        objHit.triggerings.splice(index); //remove it from the array
        event = new EventPhysics(EVENT_PHYSICS.TRIGGER_EXIT, objHit2, 0, 0, 0);
        objHit.dispatchEvent(event);
      }
      index = objHit2.triggerings.indexOf(objHit); //Find object in the array
      if (index != -1) {
        objHit2.triggerings.splice(index); //remove it from the array
        event = new EventPhysics(EVENT_PHYSICS.TRIGGER_EXIT, objHit, 0, 0, 0);
        objHit2.dispatchEvent(event);
      }
    }
    //#endregion
  }
}
