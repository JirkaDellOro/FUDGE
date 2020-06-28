///<reference path="../../../Physics/OIMOPhysics.d.ts"/>

namespace FudgeCore {

  /**
  * Main Physics Class to hold information about the physical representation of the scene
  * @author Marko Fehrenbach, HFU, 2020
  */
  export class Physics {

    /** The PHYSICAL WORLD that gives every [[Node]] with a ComponentRigidbody a physical representation and moves them accordingly to the laws of the physical world. */
    public static world: Physics = Physics.initializePhysics();
    /** The SETTINGS that apply to the physical world. Ranging from things like sleeping, collisionShapeThickness and others */
    public static settings: PhysicsSettings;

    private oimoWorld: OIMO.World;
    private bodyList: ComponentRigidbody[] = new Array();
    private triggerBodyList: ComponentRigidbody[] = new Array();
    private jointList: ComponentJoint[] = new Array();
    public debugDraw: PhysicsDebugDraw;
    public mainCam: ComponentCamera;



    /**
   * Creating a physical world to represent the [[Node]] Scene Tree. Call once before using any physics functions or
   * rigidbodies.
   */
    public static initializePhysics(): Physics {
      if (typeof OIMO !== 'undefined' && this.world == null) { //Check if OIMO Namespace was loaded, else do not use any physics. Check is needed to ensure FUDGE can be used without Physics
        this.world = new Physics();
        this.settings = new PhysicsSettings(PHYSICS_GROUP.DEFAULT, (PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 | PHYSICS_GROUP.GROUP_2 | PHYSICS_GROUP.GROUP_3 | PHYSICS_GROUP.GROUP_4));
        this.world.createWorld();
        this.world.debugDraw = new PhysicsDebugDraw();
        this.world.oimoWorld.setDebugDraw(this.world.debugDraw.oimoDebugDraw);
      }
      return this.world;
    }

    /**
  * Cast a RAY into the physical world from a origin point in a certain direction. Receiving informations about the hit object and the
  * hit point.
  */
    public static raycast(_origin: Vector3, _direction: Vector3, _length: number = 1, _group: PHYSICS_GROUP = PHYSICS_GROUP.DEFAULT): RayHitInfo {
      let hitInfo: RayHitInfo = new RayHitInfo();
      let ray: OIMO.RayCastClosest = new OIMO.RayCastClosest();
      let begin: OIMO.Vec3 = new OIMO.Vec3(_origin.x, _origin.y, _origin.y);
      let end: OIMO.Vec3 = this.getRayEndPoint(begin, new Vector3(_direction.x, _direction.y, _direction.z), _length);
      ray.clear();
      if (_group == PHYSICS_GROUP.DEFAULT) { //Case 1: Raycasting the whole world, normal mode
        Physics.world.oimoWorld.rayCast(begin, end, ray);
      } else { //Raycasting on each body in a specific group
        let allHits: RayHitInfo[] = new Array();
        this.world.bodyList.forEach(function (value: ComponentRigidbody): void {
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
      if (ray.hit) {
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
      if (Physics.settings.debugDraw) {
        Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new Color(0, 1, 0, 1));
      }
      return hitInfo;
    }


    /**
  * Starts the physical world by checking that each body has the correct values from the Scene Tree
  */
    public static start(_sceneTree: Node): void {
      RenderManager.setupTransformAndLights(_sceneTree);
      this.world.updateWorldFromWorldMatrix();
    }

    private static getRayEndPoint(start: OIMO.Vec3, direction: Vector3, length: number): OIMO.Vec3 {
      let origin: Vector3 = new Vector3(start.x, start.y, start.z); //Raycast Endpoint equals Startpoint + Direction*Length
      let scaledDirection: Vector3 = direction;
      scaledDirection.scale(length);
      let endpoint: Vector3 = Vector3.SUM(origin, scaledDirection);
      return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
    }

    private static getRayDistance(origin: Vector3, hitPoint: Vector3): number {
      let dx: number = origin.x - hitPoint.x;
      let dy: number = origin.y - hitPoint.y;
      let dz: number = origin.z - hitPoint.z;

      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }


    public getBodyList(): ComponentRigidbody[] {
      return this.bodyList;
    }

    public getTriggerList(): ComponentRigidbody[] {
      return this.triggerBodyList;
    }

    /**
  * Getting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
  */
    public getSolverIterations(): number {
      return Physics.world.oimoWorld.getNumPositionIterations();
    }

    /**
  * Setting the solver iterations of the physics engine. Higher iteration numbers increase accuracy but decrease performance
  */
    public setSolverIterations(_value: number): void {
      Physics.world.oimoWorld.setNumPositionIterations(_value);
      Physics.world.oimoWorld.setNumVelocityIterations(_value);
    }

    /**
  * Get the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
  */
    public getGravity(): Vector3 {
      let tmpVec: OIMO.Vec3 = Physics.world.oimoWorld.getGravity();
      return new Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
    }

    /**
  * Set the applied gravitational force to physical objects. Default earth gravity = 9.81 m/s
  */
    public setGravity(_value: Vector3): void {
      let tmpVec: OIMO.Vec3 = new OIMO.Vec3(_value.x, _value.y, _value.z);
      Physics.world.oimoWorld.setGravity(tmpVec);
    }

    /**
  * Adding a new OIMO Rigidbody to the OIMO World, happens automatically when adding a FUDGE Rigidbody Component
  */
    public addRigidbody(_cmpRB: ComponentRigidbody): void {
      this.bodyList.push(_cmpRB);
      Physics.world.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
    }

    /**
  * Removing a OIMO Rigidbody to the OIMO World, happens automatically when removing a FUDGE Rigidbody Component
  */
    public removeRigidbody(_cmpRB: ComponentRigidbody): void {
      let id: number = this.bodyList.indexOf(_cmpRB);
      this.bodyList.splice(id, 1);
      Physics.world.oimoWorld.removeRigidBody(_cmpRB.getOimoRigidbody());
    }

    /**
* Adding a new OIMO Joint/Constraint to the OIMO World, happens automatically when adding a FUDGE Joint Component
*/
    public addJoint(_cmpJoint: ComponentJoint): void {
      Physics.world.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
    }

    /**
    * Removing a OIMO Joint/Constraint to the OIMO World, happens automatically when removeing a FUDGE Joint Component
    */
    public removeJoint(_cmpJoint: ComponentJoint): void {
      Physics.world.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
    }

    /**
  * Simulates the physical world. _deltaTime is the amount of time between physical steps, default is 60 frames per second ~17ms
  */
    public simulate(_deltaTime: number = 1 / 60): void {
      if (this.jointList.length > 0)
        this.connectJoints();
      Physics.world.oimoWorld.step(_deltaTime * Time.game.getScale());
      if (Physics.world.mainCam != null && Physics.settings.debugDraw == true) { //Get Cam from viewport instead of setting it for physics
        Physics.world.debugDraw.begin();
        Physics.world.oimoWorld.debugDraw();
      }
    }

    public registerTrigger(_rigidbody: ComponentRigidbody): void {
      if (this.triggerBodyList.indexOf(_rigidbody) == -1)
        this.triggerBodyList.push(_rigidbody);
    }

    public unregisterTrigger(_rigidbody: ComponentRigidbody): void {
      let id: number = this.bodyList.indexOf(_rigidbody);
      this.bodyList.splice(id, 1);
    }

    public connectJoints(): void { //Try to connect dirty joints until they are connected
      let jointsToConnect: ComponentJoint[] = new Array(); //Copy Array because removing/readding in the connecting
      this.jointList.forEach(function (value: ComponentJoint): void {
        jointsToConnect.push(value);
      });
      this.jointList.splice(0, this.jointList.length);
      jointsToConnect.forEach((value: ComponentJoint): void => {
        if (value.checkConnection() == false) {
          value.connect();
        }
      });
    }

    /**
    * Called internally to inform the physics system that a joint has a change of core properties like ComponentRigidbody and needs to
    * be recreated.
    */
    public changeJointStatus(_cmpJoint: ComponentJoint): void {
      this.jointList.push(_cmpJoint);
    }

    private updateWorldFromWorldMatrix(): void {
      let bodiesToUpdate: ComponentRigidbody[] = new Array(); //Copy Array because removing/readding in the updateFromworld
      this.bodyList.forEach(function (value: ComponentRigidbody): void {
        bodiesToUpdate.push(value);
      });

      bodiesToUpdate.forEach(function (value: ComponentRigidbody): void {
        value.updateFromWorld();
      });
    }

    private createWorld(): void {
      Physics.world.oimoWorld = new OIMO.World();
    }

  }


}