This folder contains the logs of the core-developer meetings. Filenames must start with the date in the form yymmdd.

This readme-file describes in a few words the contents of each log and the major issues discussed  

# April 16th 2020
Discussion on a stateless particle system as a graph of functions
 [Whiteboard](200416_Whiteboard_ParticleSystem.jpg)

# September 2nd 2019
Views should deriviate from an (abstract) base class called View. Those are contained within the Panel, which are managed by the PanelManager.  
Communication of the Views should be done by adding an EventListener to the parent Panel Object (the Class Instance, not the DOM Object) and dispatching the events on the Panel as well. Same structure for Panel Communication: Attach Eventlistener and dispatch events on the PanelManager. [diagrams](190902_Views.svg)  
Views and Panels contain a `deconstruct()` function to remove the event listeners when they are removed from Fudge to prevent memory leaks.

Maybe views (and panels) will need an ID to know which one has been closed. those IDs can probably be generated in the upper instance. 

PanelTemplates should allow for premade Panels for users to use. As of current state it should consist of a GL.ItemConfig, where the `componentName` (if it's a type: component) describes which View to initiate (probably using an ENUM?). Can be passed to Panel in constructor to override the default construction of the Panel. PanelTemplate could be an interface if it didn't have to register itself into the PanelManager. Maybe explore .json loading instead?

# August 21st 2019
Jirka coded template for Editor. GLViewContainer renamed to Panel. Scribble updated
[Scribble](190821_Editor.png)  

# August 19th 2019

In Cologne, during devcom/gamecom, Lukas & Jirka discuss the design of the multiview editor in a single-window-applikation after multiwindow was discarded. Foundation now is a single instance of GoldenLayout. Introduction of a general view container that hosts a ViewData by default. More views may be added to the container by the user or as preset configurations. ViewData (aka Inspector in Unity or Properties in Animation) always displays the properties of the element currently selected in the container, independent of the view it was selected in.  
[Scribble](190819_Editor.png)  
The user can open new containers, thus basically configuring editors for simultaneously working on different parts of a project.  

# August 15th 2019

In the start up screen the user can open editors, projects and files.
It was decided that we need a project explorer as main window of FUDGE (If you close this, all the other editors get closed too)
Included are the project structure as a tree view and the console for debugging as well as project settings, preferences and build options.

Scene editor is now called Node editor

# August 14th 2019
Better photos of the group:
[:smile:](190814_Gruppenfoto1.jpg) 
[:smile:](190814_Gruppenfoto2.jpg) 
[:angry:](190814_Gruppenfoto3.jpg) 

# August 12th 2019 ❇❇❇
## Birth of FUDGE

[Namespaces, Versioning, Packaging Build referencing](190813_Namespaces_Packaging.jpg) all were discussed and resulted in [this wiki page](https://github.com/JirkaDellOro/FUDGE/wiki/Project-Structure,-Namespaces,-Versioning-and-Releases).

In addition, it was decided that the compiled FUDGE code is to be included in the standalone executable of the editor.

Photos of the group:
[:smile:](190812_Gruppenfoto1.jpg) 
[:angry:](190812_Gruppenfoto2.jpg) 

# August 8th 2019
[Whiteboard](190808_Whiteboard.jpg)

## Time
Jirka and Lukas discuss how to implement a Time Class, where it is needed and what capabilities it needs. That includes:  
- A static GameTime, reachable through `Time.game`.
- Animations have an individual Time class instance, that may be linked to the GameTime in its speed modifier.
- This means that the Time Class needs to fire an Event if their speed is changed, so the Animation can be notified and set her own speed accordingly.  
- More Events: setTimeout and setIntervall. Need to scale with changes in speed with the remaining time at the moment of the change. 
- Audio has its own built-in time, the component should offer a way to scale with gametime.  
- Other applications that are further away in the future:
  - prerendering spritesheets
  - postrendering game/sequence

This change also means that the Loop Class should add multiple ways to fire its looping events:  
- as fast as possible using requestAnimationFrame
- timebased: using Frames Per Second relative to...
  - Realtime
  - GameTime

## Animation
### Playmode
The Animation gets 3 different plamodes: 
- Framebased, which will jump to the next frame every update cycle, independent of time  
- Continous, which will jump to the exact point in time that the animation should be at, independent of FPS of the Animation  
- Rastered, which will jump to the correct frame, dependent on the time, according to the FPS of the Animation  
If it is either of the framebased options, the first and last frame should only appear once if the Animation is in PINGPONG mode.

### Events
Events should be triggered depending on the playmode:
- Framebased or Rastered: At the first moment the frame that includes the Event is drawn. _!This means, that an Event that is supposed to happen after the last frame will likely not be fired!_  
- Continous: In an update cycle all Events between this one and the last cycle shall be fired.

# August 5th 2019
[Whiteboard](190805_Whiteboard.jpg)
## Animation
Jirka and Lukas discuss changes to the Animation Object. Animation is to be turned into a resource, moving all time calculations into the ComponentAnimator and using the Animation as a quasi-static value provider.  
Changes to the way the AnimationSequence is saved have also been discussed: Instead of being mapped to just the name, the structure of the serialisation of the node is used to hold the information about where to use what animation. This is also the structure that the "Mutator" will be returned. The Node needs information on what to do with this Mutator, without becoming a Mutable itself.

# July 25th 2019
after the presentation of the usertest results it was decided to rename the menu bar item "window" into "layout" and the "editor" menu item into "window".
To do until big merge: Styleguide and assets for all elements.

# July 25th 2019
[Whiteboard](190725_Whiteboard.jpg) | [Notes](190726_NotesOnResourceSerialization.jpg)
## Serialization
Lukas and Jirka discuss how to separate resources, that are referenced multiple time, from single instances of objects referencing those resources when serializing FUDGE data. Conclusion was to try an approach using an additional interface "Resource" that simply requires an implementation of an id for a resource (should be called `idResource`). This way the serializer can test an object for being a resource, fetch its id and use this to complete the serialization of the referencing object or, if id is yet undefined, serialize that resource first, save it to a resource area (depending on the structure to save serialization to), create the id and then do the above. Instead of using just a random number as id, the id may carry more information such as the type of resource, the name or the date of creation.   
Serializer, a static class at this point of time, should support serializer instances, so that multpiple serializers can hold data, and contain the logic for the separation. Serializables should remain as stupid as possible.
## Network
Falco showed the basic datachannel connection established via Signaling Server. It'S functioning and pretty stable, therefore the next steps can happen. Next step being: Creating an authoritative Server, where every client creates a datachannel connection with and to the Server only. No Peer To Peer outside of that. 
The question of "does the server code need to be a seperate application running outside the game or not?" came up. Server and Clientcode can be derived from another class "NetworkClient" which, when implemented by a node, subscribes the node to networkevents. Futher seperation can be achieved by a simple boolean. Hosting is then possible, having a player run the serverlogic while playing at the same time
Next the topic of identifying Networked Nodes came up. How the ID is assigned requires experimenting, most likely the server will assign unique IDs based on the commands it gets. Nodes that exist on game-start can simply have iterating IDs.
On that note: How do objects handle NetworkCommands? We arrived at the conclusion that event-driven command logic might be a good solution. Not every potential network-object has to subscribe, only the parents node. Searching a childnode by ID can be handled by the parent node, minimizing the event-subscriptions. 
Destroying objects might become tricky, because JavaScript has no Destructor and using an ObjectManager can block GarbageCollection, making it non-viable.
For now we do layercake. Next step is working ahtoritative server, then figuring out how best to assign IDs to networked objects. Once that is done, first syncing experiments can be done, which will allow networked games on a rudimentary level.  

Addition by Jirka: an idea is to Subclass ComponentScript to ComponentScriptServer and ComponentScriptClient. To do networking, either or both must be used on the appropriate nodes and again subclassed and network-ids are automatically given to only those nodes.

## UI: 
After pre-discussing the Usertest, we talked about whether it would be more practical to use a single "FUDGE" Window that encompases all the editors, or if multiple Editor Windows would be more sensible. 
We concluded that a multi-window approach could be best, as it gives some speration between the editor contexts but further research into whether something like that is even possible needs to be done first.

The "foldable" buttons should be replaced with something stylable by CSS. The "label" and "event" icons will be replaced with their icons derived from UML.
The fieldsets from the animation editor should be smaller and the next frame has the hotkey next frame button + Ctrl.

Monika: is communication via multiple windows (editors) possible in electron? 
        inspector values can annd should be broken down into exponentials -> num, to exponential

# July 18th 2019
The clickdummy for the usertest was presented by Lea Stegk and Monika Galkewitsch, desired changes are listed in the log.([1](190718_NotizenLS))
Also talked and re-capped the Jobs the FUDGE UI need to do, as well as discussing a rough design for how Gizmos should be handled internally in the FUDGE Core and how a KeyManager could function for FUDGE ([2](190718_ViewportEditor_Keymanager_FUDGEUI.txt))([Whiteboard](190718_Whiteboard.JPG))

# July 11th 2019
Presentation Mindmap as list of FUDGE functions ([Mindmap](https://github.com/JirkaDellOro/FUDGE/blob/master/Miscellaneous/Experiments/Lea/FUDGE%20UI.mm))
Should the inspector be there / paired per editor? Singleton? Selectable? 
([Whiteboard](190711_Whiteboard_saving.jpg))
+Rough overview over tasks for the usertest

# June 26th 2019
Clarified details about the FUDGE UI
-> The gizmos axis are color coded: red=y, green=z, blue=x 
->  What kind of Windows will FUDGE need? Scene Editor, Animation Editor, Sketch Editor, Modelling Editor
-> Sketch Editor outputs results in own data format and can be inserted in the "inspector" under the "material"* property as a sprite or    texture                             * properties right now are shader and coat, the latter includes color ant texture

All editors (even if not existan yet) need rough guidelines so their look is unified

Clarified details about the UX Usertest
-> Excercises people will have to do for the Usertest? - Creation of simple 2D/3D objects in scene editor -> animation editor ->            scripting

Clarifying Structure of UI Components
([Whiteboard](190626_Whiteboard_full.JPG))

# June 19th 2019
Presentation moodboard by Lea: Preferred are simple HTML elements, flat design (no dropshadows for buttons), icons are used for easily identifiable elements that won´t be extended, labeled buttons for elements that can´t be touched
Principle: the users work needs to be in the spotlight, not the interface

# May 23rd 2019
Discussion about creation of a prototype for usertests (tool: Adobe XD?, methods: A/B tests, navigation)

# May 14th 2019
Discussion over the structure of the UI System.

# May 2nd 2019
Discussion on the requirements the UI System has to fullfil. ([1](190502_UI_System_Discussion))

# Apr 16th 2019
Upload Doodles for Vector Editor ([1](190416_VE_Doodle.jpg)) as well as Animation Editor ([1](190416_AE_Doodle1.jpg), [2](190416_AE_Doodle2.jpg)).

# Apr 15th 2019
Discussion on Basic Usage Scheme on the example of the Vector Edtior. [Whiteboard](190415_Whiteboard_VE_UI_Discussion.jpg)

Toolbesprechung Vektoreditor

Tools: 
Select (boxselect, multiselect)
Add (vertice to existing object, new path)
Transorm (move, scale, rotate)
Create Shape (square, triangle, circle)
(Combine)
Move canvas
Freeform kann über on/off toggle automatisch geschlossen werden

-> Schlussfolgerung: Werkzeuge sind für Konsistenz zwischen mit 3D Editor sinnvoll

# Apr 11th 2019
Discussion on Keyboard shortcuts for the 2D/3D Editor

[Results](190411%2016.23.21.jpg)

Pre-Disussion about UI structure between Monika and Lea
[Results](190411_UI%20Dicussion%20Monika%20Lea.jpg)

We will use Golden Layout. PhosphorJS is only useful for single page applications, wcDocker doesn´t support pop-in and is frankly confusing to use after collapsing some panels (where do they go, can´t put them back). Docspawns and gridsters websites doesn´t exist anymore. jQuery Layout and ExtJS don´t support reordering windows, as well as Isotope. Also ExtJS wants a sign-up and only has a license for one year, afterwards fees start at 495$.
Isotope only allows filtering and sorting of its contents, it has no draggable interactions just like Masonry.


# Apr 10th 2019
Presentation of [Transfer.Mutable](https://jirkadelloro.github.io/FUDGE/Core/reference/classes/fudge.mutable.html), its workflow and [how to use it](190410_Whiteboard1.jpg). Also, there was discussion about [how to handle multiple Viewports on one Canvas as well as Events on those Viewports/Canvas](190410_Whiteboard2.jpg) and how to implement them ([proposal](http://Link_missing)).
All Members showed off what they were working on: [WebAudioAPI Overview](190410_Whiteboard4.jpg), [Animator Thoughts and Proposals](190410_Whiteboard3.jpg).

[Animation Editor Work](190410_Notizen_LS.md)

# Mar 27th 2019
Interfaces for Animation and UI (and more?) compatibility/accessability. init/change (name is subject to change) function that handles changes on an object by using a generic JS Object.  
[Whiteboard](190327_Whiteboard.jpg)  
[Relevant for VectorEditor and Animator](190327_Notizen_LS.md)

# Mar 20th 2019
Die Möglichkeit, Szenen zu speichern und zu laden muss gegeben werden
Szenen werden in JSON gespeichert und können dort auch ohne den Editor bearbeitet werden (Z.b. Erstellung eines neuen Objektes)

Gibt es Bedarf, FUDGE auf Node laufen zu lassen?

DOM Eventsteuerung

Ansatzstelle Serialisation (Jede Komponente verfügt über serialize/deserialize)([1](190319%20Protokoll%20LM))

# Mar 18th 2019
Presentation of the Core as it stands, general thoughts about it.  
[Relevant for Animator and VectorEditor](190318_Notizen_LS.md)

# Feb 20th 2019
Discussion on UI  
[Whiteboard](190220_Whiteboard_UI.jpg)

# Jan 15th 2019  
[Overview WebXR, ARCore etc,](190115-WebXR-ARCore-WebGL-JS_KF.jpg)  
[PhoneGap CLI table and some notes to WebXR](190115_Notizen_KF.md)  

# Jan 8th 2019
[Datenstrukturplanung Vektoreditor](190108_Notizen_LS.md)
# Dec 18th 2018
[error with the child_process.spawn and child_process.exec](181218_Notizen_KF.txt)  
[First prototype of the vectoreditor, problems with it and further plans with it](181218_Notizen_LS.md)
# Dec 11th 2018
Issue with a Typescript error [#10](https://github.com/JirkaDellOro/FUDGE/issues/10)  
# Dec 4th 2018
[General thoughts about the Engine and the Animator (and Lukas' Jobs)](181204_Notizen_LS.md)  
[General Information about about Meeting Contents](181204_Protokoll_TD)  
[Objects in WebXR](181129_WebXR.png)  
# Nov 27th 2018
[Some Information about Meeting Contents](181127_Protokoll_TD)
# Nov 20th 2018
[General contents of the meeting](181120_Notizen_KF.txt)
# Nov 13th 2018
[General thoughts about the Engine, the Animator and the 2D Vector Editor](181113_Notizen_LS.md)  
[Some more general information about the Engine](181113_Notizen_KF.txt)
# Sep 13th 2018
First meeting. Basic structure for scenetree and components. [Whiteboard](180913_Whiteboard_Scenetree.jpg)  
[General information about the Engine](180913_Notizen_KF.txt)
