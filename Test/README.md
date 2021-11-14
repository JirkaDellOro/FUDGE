# FUDGE Tests
- Open the console (F12 or Ctrl+Shift+I), since many test also or solely show output to the console!
- Testing online on jirkadelloro.github.io/FUDGE only tests the master branch. Test other branches locally using a local server.
- Use of markdown viewer is recommended when testing locally to use this README.md
- Here is only a selection of test that are already enhanced with explanation and user guidelines
- Find more tests in the folder "Miscellaneous"

## Animation
- [PaymodesTriggerLabel](Test\Animation\PlaymodesTriggerLabel\Test.html)  
Test the triggering of animation events and jumping to labels defined in the animation.
- [Serialization](Test\Animation\Serialization\Test.html)  
Test the de-/serialization of animations.
## Audio
- [Audio Graph Insertion](Audio/GraphInsertion/Test.html)  
Test the insertion of a graph of arbitrary complexity into a ComponentAudio.    
- [Branch Mixing](Audio/BranchMix/Test.html)  
Test the handling of the WebAudio context to mix the audiosignals of selected branches in the scene graph.    
- [SpatialSound](Audio/SpatialSound/Test.html)  
Complex test for spatial stereo audio. Orbit the camera around the world origin, move an audio source and adjust the panner cones.
## Controls
- [Controls](Test\Controls\Test.html)  
Test the amplifictation, delay and the proportional, integral or differential processing of inputs.
## Debug
- [Debug](Test\Debug\Test.html)
Test the debug class that routes log-messages, warnings or error-messages to various outputs.
## Mesh
- [Mesh](Test\Mesh\Test.html)
Display the built-in meshes.
## Net
- [Client](Test\Net\Client\index.html)
- Server: start with `node Server.js <port>`  
Test connectivity between Server and Clients with WebSockets and between Clients as peer-to-peer connections with RTC and the automatic setup of a mesh structure or an authoritative peer.
## Physics
- [Welding](Test\Physics\Convex_ChairTest\FudgePhysics_ConvexWelding.html)
Concave objects consisting of boxes welded together using welding joints fall from the sky and bounce around. 
- [Joints](Test\Physics\Phase2_Joints\Main.html)
Test all joint types and collisions.