# FUDGE Tests
- Open the console (F12 or Ctrl+Shift+I), since many test also or solely show output to the console!
- Testing online on jirkadelloro.github.io/FUDGE only tests the master branch. Test other branches locally using a local server.
- Use of markdown viewer is recommended when testing locally to use this README.md
- Here is only a selection of test that are already enhanced with explanation and user guidelines
- Find more tests in the folder "Miscellaneous"

## Audio
- [Audio Graph Insertion](Audio/GraphInsertion/Test.html)  
Test the insertion of a graph of arbitrary complexity into a ComponentAudio.    
- [Branch Mixing](Audio/BranchMix/Test.html)  
Test the handling of the WebAudio context to mix the audiosignals of selected branches in the scene graph.    
- [SpatialSound](Audio/SpatialSound/Test.html)  
Complex test for spatial stereo audio. Orbit the camera around the world origin, move an audio source and adjust the panner cones.

<!-- 
## Events
- [EventPassing](Events/EventPassing/Test.html)   
In der Konsole sollten mehrere Events angezeigt werden und der Fokus soll nach dem Anklicken eines Viewports mit den Pfeiltasten steuerbar sein.

- [Propagation](Events/Propagation/Test.html)   
Hier soll kein Fehler in der Konsole auftauchen, auch sollte unter jeder Überschrift etwas stehen.

- [ScreenPoint](Events/ScreenPoint/Test.html)  
Bei dem Anklicken an einer beliebigen Stelle des Viewports soll ein realistischer Wert in der Konsole ausgegeben werden.

## Scripting
- [Script](Scripting/Basic/Test.html)  
In der Konsole soll ein Mutator bis 20 hochzählen und es sollen keine Fehler ausgegeben werden. Bei 11 startet ein zweiter Count bis 20.  
- [State Machine](Scripting/StateMachine/Test.html)  
To be described 

## Rendering
- [MultiVieportMultiCanvas](WebGL/MultiViewportMultiCanvas/Test.html)  
  Ein gleiches Objekt soll in 4 verschiedenen Viewports aus 4 Blickrichtungen angezeigt werden.  
- [RectMapping](WebGL/TestRectMapping/Test.html)  
Die Dimension und Auflösung des Viewport soll auf Änderungen in den Transformationsfeldern auf der rechten Seite reagieren. Entsprechend des Framings, siehe [Framing](../Documentation/Design/Framing.svg)  

## Resources
- [NodeResource](Transfer/NodeResource/Test.html)   
Im Viewport sollen viele Pyramiden angezeigt werden, um die ein anderes Objekt kreist.  
- [ResourceManager](Transfer/ResourceManager/Test.html)   
Graph und interne Resourcen speichern und zusammen mit externen laden und Graph rekonstruieren  

## Shading
- [Light](Shading/Light/Light.html)  
Hier soll eine sich drehende Pyramide angezeigt werden, die ihre Farben auf den Seiten ändert.
- [LightMoving](Shading/LightMoving/LightMoving.html)     
Hier soll eine Pyramide gezeigt werden, um die sich mehrere Lichter in verschiedenen Farben drehen.

- [Texture](Shading/Textures/TextureTest.html)   
Hier sollen Würfel gezeigt werden, auf denen eine Fudge-Textur zu sehen ist.  

## Time
- [TimeLoop](Time/Test.html)   
Nachdem die FPS Zahl des Loops geändert wurde, soll sich der grüne Balken je nach Mode-Einstellung füllen. Der Loop kann an Animation-Requests (frame_request), Realtime (Systemzeit) oder Gametime (welche ein beliebiges Time-Objekt sein kann) gekoppelt werden (time.Game ist die automatisch startende GameTime)  

## Transfer
- [Serializer](Transfer/Serializer/Test.html)  
Hier sollen keine Fehler ausgeworfen werden. Es muss geschaut werden, dass ein Originalobjekt erstellt wird und mit einem rekonstruiertem Objekt verglichen wird.

- [ScriptSerialization](Transfer/ScriptSerialization/Test.html)  
Bei diesem Test muss geschaut werden, das es keine Errors außer Mismatches gibt.

- [Mutable](Transfer/Mutable/Test.html)  
Hier soll ein Quader zu sehen sein, der sich verformt und seine Position ändert.

- [MutateMatrix](Transfer/MutateMatrix/Test.html)  
Hier soll in der Console eine Matrix als Unterpunkt verschiedener Funktionen zu sehen sein.  

## Animation
- [AnimatorComponent](Animation/AnimatorComponent/Test.html)  

## UserInterface
- [UserInterface](UserInterface/scr/app.html)  

## Rectangle
- [Collision](Rectangles/Collision/Test.html)

## Mesh Generierung
- [Sphere](Mesh/Sphere/Test.html)  
Hier sollen zwei Kugeln zu sehen sein - eine mit Flat Shading und die andere mit einer Erde-Textur.

- [Torus](Mesh/Torus/Test.html)  
Hier sollen zwei Tori zu sehen sein - einer mit Flat Shading und der andere mit einer Erde-Textur.

- [HeightMap](Mesh/HeightMap/Test.html)  
Hier sollen zwei durch eine Sinusfunktion (anhand von X und Z Koordinaten des Grids) generierte Gridmeshes angezeigt werden. Eine mit Flat Shading und eines mit einer Erde-Textur.
-->