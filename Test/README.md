# FUDGE Tests
## Events
- [EventPassing](Events/EventPassing/index.html)   
In der Konsole sollten mehrere Events angezeigt werden und der Fokus soll nach dem Anklicken eines Viewports mit den Pfeiltasten steuerbar sein.

- [Propagation](Events/Propagation/index.html)   
Hier soll kein Fehler in der Konsole auftauchen, auch sollte unter jeder Überschrift etwas stehen.

- [ScreenPoint](Events/ScreenPoint/index.html)  
Bei dem Anklicken an einer beliebigen Stelle des Viewports soll ein realistischer Wert in der Konsole ausgegeben werden.

## Scripting
- [Script](Scripting/index.html)  
In der Konsole soll ein Mutator bis 20 hochzählen und es sollen keine Fehler ausgegeben werden. Bei 11 startet ein zweiter Count bis 20.
## Rendering
- [MultiVieportMultiCanvas](WebGL/MultiViewportMultiCanvas/index.html)  
  Ein gleiches Objekt soll in 4 verschiedenen Viewports aus 4 Blickrichtungen angezeigt werden.

- [RectMapping](WebGL/TestRectMapping/index.html)  
Die Dimension und Auflösung des Viewport soll auf Änderungen in den Transformationsfeldern auf der rechten Seite reagieren. Entsprechend des Framings, siehe [Framing](../Documentation/Design/Framing.svg)
## Resources
- [NodeResource](Resources/NodeResource/index.html)   
Im Viewport sollen viele Pyramiden angezeigt werden, um die ein anderes Objekt kreist.
## Shading
- [Light](Shading/Light/Light.html)  
Hier soll eine sich drehende Pyramide angezeigt werden, die ihre Farben auf den Seiten ändert.
- [LightMoving](Shading/LightMoving/LightMoving.html)     
Hier soll eine Pyramide gezeigt werden, um die sich mehrere Lichter in verschiedenen Farben drehen.

- [Texture](Shading/Textures/TextureTest.html)   
Hier sollen Würfel gezeigt werden, auf denen eine Fudge-Textur zu sehen ist.
## Time
- [TimeLoop](Time/index.html)   
Nachdem die FPS Zahl des Loops geändert wurde, soll sich der grüne Balken je nach Mode-Einstellung füllen. Der Loop kann an Animation-Requests (frame_request), Realtime (Systemzeit) oder Gametime (welche ein beliebiges Time-Objekt sein kann) gekoppelt werden (time.Game ist die automatisch startende GameTime)
## Transfer
- [Serializer](Transfer/Serializer/index.html)  
Hier sollen keine Fehler ausgeworfen werden. Es muss geschaut werden, dass ein Originalobjekt erstellt wird und mit einem rekonstruiertem Objekt verglichen wird.

- [ScriptSerialization](Transfer/ScriptSerialization/index.html)  
Bei diesem Test muss geschaut werden, das es keine Errors außer Mismatches gibt.

- [Mutable](Transfer/Mutable/index.html)  
Hier soll ein Quader zu sehen sein, der sich verformt und seine Position ändert.

- [MutateMatrix](Transfer/MutateMatrix/index.html)  
Hier soll in der Console eine Matrix als Unterpunkt verschiedener Funktionen zu sehen sein.  

## Animation
- [AnimatorComponent](Animation/AnimatorComponent/index.html)  
## UserInterface
- [UserInterface](UserInterface/scr/app.html)
