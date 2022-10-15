///<reference path="../../../Physics/OIMOPhysics.d.ts"/>

namespace FudgeCore {
  /**
    * Manages the OIMO physics engine for FUDGE. Multiple instances may be created, one is active at a time.
    * All methods are static and use the currently active instance. At startup, a default instance is created and become the active instance
    * Attaching a {@link ComponentRigidbody} to a {@link Node} places a physics collider in the physics instance active at that time.
    * @author Marko Fehrenbach, HFU 2020
    */
  export class Physics {
    /** The SETTINGS that apply to the physical world. Ranging from things like sleeping, collisionShapeThickness and others */
    public static settings: PhysicsSettings = new PhysicsSettings(COLLISION_GROUP.DEFAULT, (COLLISION_GROUP.DEFAULT | COLLISION_GROUP.GROUP_1 | COLLISION_GROUP.GROUP_2 | COLLISION_GROUP.GROUP_3 | COLLISION_GROUP.GROUP_4));
    private static ƒactive: Physics = new Physics();

    /** The rendering of physical debug informations. Used internally no interaction needed.*/
    #debugDraw: PhysicsDebugDraw;
    /** The camera/viewport the physics are debugged to. Used internally no interaction needed. */
    #mainCam: ComponentCamera;

    private oimoWorld: OIMO.World;
    private bodyList: ComponentRigidbody[] = new Array();
    private jointList: Joint[] = new Array();

    public constructor() {
      if (typeof OIMO == "undefined") {// Check if OIMO Namespace was loaded, else do not use any physics. Check is needed to ensure FUDGE can be used without Physics
        Debug.error("OIMO physics engine not connected!");
        return null;
      }
      this.oimoWorld = new OIMO.World();
      this.#debugDraw = new PhysicsDebugDraw();  //Create a FUDGE Physics debugging handling object
      this.oimoWorld.setDebugDraw(this.#debugDraw.oimoDebugDraw); //Tell OimoPhysics where to debug to and how it will be handled
    }
    /**
     * Define the currently active Physics instance
     */
    public static set activeInstance(_physics: Physics) {
      Physics.ƒactive = _physics;
    }

    /** Get the currently active Physics instance */
    public static get activeInstance(): Physics {
      return Physics.ƒactive;
    }

    public static get debugDraw(): PhysicsDebugDraw {
      return Physics.ƒactive.#debugDraw;
    }
    public static get mainCam(): ComponentCamera {
      return Physics.ƒactive.#mainCam;
    }

    /**
    * Cast a RAY into the physical world from a origin point in a certain direction. Receiving informations about the hit object and the
    * hit point. Do not specify a _group to raycast the whole world, else only bodies within the specific group can be hit.
    */
    public static raycast(_origin: Vector3, _direction: Vector3, _length: number = 1, _debugDraw: boolean = false, _group: COLLISION_GROUP = COLLISION_GROUP.DEFAULT): RayHitInfo {
      let hitInfo: RayHitInfo = new RayHitInfo();
      let ray: OIMO.RayCastClosest = new OIMO.RayCastClosest();
      let begin: OIMO.Vec3 = new OIMO.Vec3(_origin.x, _origin.y, _origin.z);
      let end: OIMO.Vec3 = this.getRayEndPoint(begin, new Vector3(_direction.x, _direction.y, _direction.z), _length);
      ray.clear();
      if (_group == COLLISION_GROUP.DEFAULT) { //Case 1: Raycasting the whole world, normal mode
        Physics.ƒactive.oimoWorld.rayCast(begin, end, ray);
      } else { //Case2: Raycasting on each body in a specific group
        let allHits: RayHitInfo[] = new Array();
        Physics.ƒactive.bodyList.forEach(function (value: ComponentRigidbody): void {
          if (value.collisionGroup == _group) {
            hitInfo = value.raycastThisBody(_origin, _direction, _length);
            if (hitInfo.hit == true) { //Every hit is could potentially be the closest
              allHits.push(hitInfo);
            }
          }
        });
        allHits.forEach(function (value: RayHitInfo): void { //get the closest hitInfo
          if (value.hitDistance < hitInfo.hitDistance || hitInfo.hit == false) {
            hitInfo = value;
          }
        });
      }
      if (ray.hit) { //Fill in informations on the hit
        hitInfo.hit = true;
        hitInfo.hitPoint = new Vector3(ray.position.x, ray.position.y, ray.position.z);
        hitInfo.hitNormal = new Vector3(ray.normal.x, ray.normal.y, ray.normal.z);
        hitInfo.hitDistance = this.getRayDistance(_origin, hitInfo.hitPoint);
        hitInfo.rigidbodyComponent = ray.shape.userData;
        hitInfo.rayEnd = new Vector3(end.x, end.y, end.z);
        hitInfo.rayOrigin = _origin;
      } else {
        hitInfo.rayOrigin = _origin;
        hitInfo.hitPoint = new Vector3(end.x, end.y, end.z);
      }
      if (_debugDraw) { //Handle debugging
        Physics.ƒactive.#debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new Color(0, 1, 0, 1));
      }
      return hitInfo;
    }


    /**
    * Simulates the physical world. _deltaTime is the amount of time between physical steps, default is 60 frames per second ~17ms.
    * A frame timing can't be smaller than 1/30 of a second, or else it will be set to 30 frames, to have more consistent frame calculations.
    */
    public static simulate(_deltaTime: number = 1 / 60): void {
      if (Physics.ƒactive.jointList.length > 0)
        Physics.connectJoints(); //Connect joints if anything has happened between the last call to any of the two paired rigidbodies
      if (Time.game.getScale() != 0) { //If time is stopped do not simulate to avoid misbehaviour
        _deltaTime = _deltaTime > 1 / 30 ? 1 / 30 : _deltaTime; //If instead of a fixed rate the game framerate is used, make sure irregular timings are fixed to 30fps
        Physics.ƒactive.oimoWorld.step(_deltaTime * Time.game.getScale());  //Update the simulation by the given deltaTime and the FUDGE internal TimeScale
      }
    }

    /**
     * Draw information about the currently active instance using the {@link ComponentCamera} given
     */
    public static draw(_cmpCamera: ComponentCamera, _mode?: PHYSICS_DEBUGMODE): void {
      Physics.ƒactive.#debugDraw.setDebugMode(_mode);
      Physics.ƒactive.#mainCam = _cmpCamera;
      Physics.ƒactive.oimoWorld.debugDraw(); //Filling the physics world debug informations into the debug rendering handler
      Physics.ƒactive.#debugDraw.drawBuffers();
      Physics.ƒactive.#debugDraw.clearBuffers();  //Updates info about the current projection, resetting the points/lines/triangles that need to be drawn from debug
    }

    /**
      * Adjusts the transforms of the {@link ComponentRigidbody}s in the given branch to match their nodes or meshes
      */
    public static adjustTransforms(_branch: Node, _toMesh: boolean = false): void {
      Render.prepare(_branch, { ignorePhysics: true });
      for (let node of Render.nodesPhysics)
        node.getComponent(ComponentRigidbody).initialize();
    }

    /**
    * Get the applied gravitational force of the active instance. Default earth gravity = 9.81 m/s
    */
    public static getGravity(): Vector3 {
      let tmpVec: OIMO.Vec3 = Physics.ƒactive.oimoWorld.getGravity();
      return new Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
    }

    /**
    * Set the applied gravitational force of the active instance. Default earth gravity = 9.81 m/s
    */
    public static setGravity(_value: Vector3): void {
      let tmpVec: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      Physics.ƒactive.oimoWorld.setGravity(tmpVec);
    }

    /**
    * Add a new OIMO Rigidbody to the active instance, happens automatically when adding a FUDGE Rigidbody Component.
    */
    public static addRigidbody(_cmpRB: ComponentRigidbody): void {
      Physics.ƒactive.bodyList.push(_cmpRB);
      Physics.ƒactive.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
    }

    /**
    * Remove the OIMO Rigidbody to the active instance, happens automatically when removing a FUDGE Rigidbody Component
    */
    public static removeRigidbody(_cmpRB: ComponentRigidbody): void {
      // TODO: two lists are being managed, info might deviate. Cleanup!
      let oimoRigidBody: OIMO.RigidBody = _cmpRB.getOimoRigidbody();
      if (oimoRigidBody._world)
        oimoRigidBody._world.removeRigidBody(oimoRigidBody);
      // what if the rigidbodys oimo-world does not belong to the active instance?
      let id: number = Physics.ƒactive.bodyList.indexOf(_cmpRB);
      Physics.ƒactive.bodyList.splice(id, 1);
    }

    /**
    * Add a new OIMO Joint/Constraint to the active instance, happens automatically when adding a FUDGE Joint Component
    */
    public static addJoint(_cmpJoint: Joint): void {
      Physics.ƒactive.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
    }

    /**
    * Called internally to inform the physics system that a joint has a change of core properties and needs to be recreated.
    */
    public static changeJointStatus(_cmpJoint: Joint): void {
      if (Physics.ƒactive.jointList.indexOf(_cmpJoint) < 0)
        Physics.ƒactive.jointList.push(_cmpJoint);
    }

    /**
      * Remove the OIMO Joint/Constraint to the active instance, happens automatically when removing a FUDGE Joint Component
      */
    public static removeJoint(_cmpJoint: Joint): void {
      try {
        Physics.ƒactive.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
      } catch (_error: unknown) {
        Debug.fudge(_error);
      }
    }

    /** Returns all the ComponentRigidbodies that are known to the active instance. */
    public static getBodyList(): ComponentRigidbody[] {
      return Physics.ƒactive.bodyList;
    }

    /** Giving a ComponentRigidbody a specific identification number so it can be referenced in the loading process. And removed rb's can receive a new id. */
    public static distributeBodyID(): number {
      let freeId: number = 0;
      let free: boolean = false;
      Physics.ƒactive.bodyList.forEach((_value: ComponentRigidbody): void => {
        if (_value.id != freeId) {
          free = true;
        } else {
          free = false;
        }
        if (!free) {
          freeId++;
        }
      }
      );
      return freeId;
    }

    /** 
     * Connect all joints that are not connected yet. Used internally no user interaction needed. This functionality is called and needed to make sure joints connect/disconnect
     * if any of the two paired ComponentRigidbodies change.
     */
    public static connectJoints(): void { //Try to connect dirty joints until they are connected
      let jointsToConnect: Joint[] = Physics.ƒactive.jointList;
      Physics.ƒactive.jointList = [];
      jointsToConnect.forEach((_joint: Joint): void => {
        if (_joint.isConnected() == false)
          if (_joint.isActive)
            _joint.connect();
          else
            Physics.ƒactive.jointList.push(_joint);
      });
    }

    /** Remove all oimo joints and rigidbodies, so that they can be reused in another world  */
    public static cleanup(): void {
      let oimoWorld: OIMO.World = Physics.ƒactive.oimoWorld;
      if (oimoWorld != null) {
        //Resetting the world so a new world can be created, fix for re-opening a project in editor, making sure there are no old things calculated
        let jointsWorld: number = oimoWorld.getNumJoints();
        let bodiesWorld: number = oimoWorld.getNumRigidBodies();
        for (let body of Physics.ƒactive.bodyList)
          body.isInitialized = false;
        Physics.ƒactive.jointList = new Array(); // TODO: see if it would be smarter, do use these arrays. Definitely more intuitive...
        for (let i: number = 0; i < jointsWorld; i++) {
          let oimoJoint: OIMO.Joint = Physics.ƒactive.oimoWorld.getJointList();
          oimoWorld.removeJoint(oimoJoint);
        }
        for (let i: number = 0; i < bodiesWorld; i++) {
          let oimoBody: OIMO.RigidBody = oimoWorld.getRigidBodyList();
          oimoWorld.removeRigidBody(oimoBody);
        }
      }
    }

    // /** Returns the ComponentRigidbody with the given id. Used internally to reconnect joints on loading in the editor. */
    // private static getBodyByID(_id: number): ComponentRigidbody {
    //   let body: ComponentRigidbody = null;
    //   Physics.#activePhysics.bodyList.forEach((value: ComponentRigidbody): void => {
    //     if (value.id == _id) {
    //       body = value;
    //     }
    //   });
    //   return body;
    // }

    /** Internal function to calculate the endpoint of mathematical ray. By adding the multiplied direction to the origin. 
       * Used because OimoPhysics defines ray by start/end. But GameEngines commonly use origin/direction.
       */
    private static getRayEndPoint(start: OIMO.Vec3, direction: Vector3, length: number): OIMO.Vec3 {
      let origin: Vector3 = Recycler.get(Vector3);
      origin.set(start.x, start.y, start.z);
      let scaledDirection: Vector3 = direction.clone;
      scaledDirection.scale(length);
      let endpoint: Vector3 = Vector3.SUM(scaledDirection, origin);
      Recycler.store(scaledDirection);
      Recycler.store(endpoint);
      Recycler.store(origin);
      return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
    }

    /** Internal function to get the distance in which a ray hit by subtracting points from each other and get the square root of the squared product of each component. */
    private static getRayDistance(origin: Vector3, hitPoint: Vector3): number {
      let dx: number = origin.x - hitPoint.x;
      let dy: number = origin.y - hitPoint.y;
      let dz: number = origin.z - hitPoint.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }


    // /** Returns the actual used world of the OIMO physics engine. No user interaction needed - Only for advanced users that need to access it directly */
    public getOimoWorld(): OIMO.World {
      return Physics.ƒactive.oimoWorld;
    }

    // /** Updates all {@link Rigidbodies} known to the Physics.world to match their containers or meshes transformations */
    // private updateWorldFromWorldMatrix(_toMesh: boolean = false): void {
    //   for (let body of this.bodyList)
    //     body.updateFromWorld(_toMesh);
    // }
  }
}