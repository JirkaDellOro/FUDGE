# Physics
FUDGE has integrated [OIMO Physics](https://github.com/saharan/OimoPhysics/tree/adapting_4.0.0) for it's physics calculations. The actual integration includes the smooth usage of the functionality that OimoPhysics provides within the systems that FUDGE established. 
It includes the usage of Rigidbody Physics with realistic behaviour, and a wide variety of shapes. Raycasting and informationtransfer, collision and trigger events to control gamelogic. And also the connection of rigidbodies with joints to build
realistic physical connections. Fudge is using specifically tailored PhysicsComponents to communicate with OimoPhysics, that might not include all possible functions that OimoPhysics offers. It does not include any softbody physics or similar behaviour which is not the goal of a lightweight physics implementation.

To use Physics within FUDGE you only need to reference the OimoPhysics.js in this Folder in your HTML.

**OIMO was forked and changed/fixed to be used within Fudge, so use this version provided. Questions? Open a Fudge issue.**