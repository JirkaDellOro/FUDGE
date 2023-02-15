# FUDGE Tests

- Open the console (F12 or Ctrl+Shift+I), since many test also or solely show output to the console!
- Testing online on jirkadelloro.github.io/FUDGE only tests the development branch. Test other branches locally using a local server.
- Use of markdown viewer is recommended when testing locally to use this README.md
- Here is only a selection of test that are already enhanced with explanation and user guidelines
- Find more tests in the folder "Miscellaneous"

## Animation

- [PaymodesTriggerLabel](Animation/PlaymodesTriggerLabel/Test.html)  
  Test the triggering of animation events and jumping to labels defined in the animation.
- [Serialization](Animation/Serialization/Test.html)  
  Test the de-/serialization of animations.

## Audio

- [Audio Graph Insertion](Audio/GraphInsertion/Test.html)  
  Test the insertion of a graph of arbitrary complexity into a ComponentAudio.
- [Branch Mixing](Audio/BranchMix/Test.html)  
  Test the handling of the WebAudio context to mix the audiosignals of selected branches in the scene graph.
- [SpatialSound](Audio/SpatialSound/Test.html)  
  Complex test for spatial stereo audio. Orbit the camera around the world origin, move an audio source and adjust the panner cones.

## Controls

- [Controls](Controls/Test.html)  
  Test the amplifictation, delay and the proportional, integral or differential processing of inputs.

## Debug

- [Debug](Debug/Test.html)  
  Test the debug class that routes log-messages, warnings or error-messages to various outputs.
- [Output](Debug/ScreenToRayToScreen/Test.html)  
  Test debug output to various targets.

## Mesh

- [Mesh](Mesh/Test.html)  
  Display the built-in meshes.

## Net

- [Client](Net/Client/index.html)
- Server: start with `node Server.js <port>` in folder Test/Net/Server
  Test connectivity between Server and Clients with WebSockets and between Clients as peer-to-peer connections with RTC and the automatic setup of a mesh structure or an authoritative peer. Disable public firewall!

## Physics

- [Welding](Physics/Convex_ChairTest/FudgePhysics_ConvexWelding.html)  
  Concave objects consisting of boxes welded together using welding joints fall from the sky and bounce around.
- [Joints](Physics/Phase2_Joints/Main.html)  
  Test all joint types and collisions.
- There are more tests in the folder, view locally.

## Picking

- [PickComponent](Picking/PickComponent/MeshZoo.html)
  Test different picking methods using ComponentPick
- [PickShader](Picking/PickShader/Picking.html)
  Test picking using the pick shader with overlapping quads

## Random

- [Random](Random/Test.html)  
  Test various formats and methods to create structures and information using random numbers.

## Rectangles

- [Collision](Rectangles/Collision/Test.html)  
  Test the collision detection of rectangles and the calculation of the overlapping area.
- [MapRectangles](Rectangles/MapRectangles/Test.html)  
  Test the mapping of one Rectangle onto another used for viewport framing.

## Resources

- [Graph](Resources/Graph/Test.html)  
  Test the creation, serialization, deserialization and recreation of a graph and graphinstances.
- [SubclassRegistration](Resources/SubclassRegistration/Test.html)  
  Test the registration of all classes creating resources which is crucial for deserialization

## Skeleton

[SkeletonTest](Skeleton/SkeletonTest.html)  
Skeleton with two bones moving, deforming a cylinder  
[SkeletonImportTest](Skeleton/SkeletonImportTest.html)  
Import obj-file with skeleton animation, needs fix

## Sprite

- [Sprites](Sprite/Test.html)  
  Test the spriteclass and spritesheets as defined in Aid at this point of time (11/2021). Sprites should be handled by Animation later.

## StateMachine

[StateMachine](StateMachine/Test.html)  
Standalone state machine and ComponentStateMachine running parallel.

## Time

- [Time](Time/Test.html)  
  Test the handling of time, the core game loop and timer events.

## VR

- [Audio in VR](VR/Audio/AudioTest.html)  
  Test the spatial Audio in VR.
- [Controller in VR](VR/Controller/ControllerTest.html)  
  Test the capabilities of controller mapping in VR.
- [Immersive in VR](VR/Immersive/ImmersiveTest.html)  
  Test the immersion in VR.
- [Physics in VR](VR/Physics/PhysicsTest.html)  
  Test the physics in VR.
- [Rays in VR](VR/Rays/RayTest.html)  
  Test the rays and the capabilities (Grabbing and Teleportation) of it in VR.
