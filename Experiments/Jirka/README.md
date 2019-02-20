# Jirka's experiments for FUDGE
## Console
Small program to demonstrate the various helpful possibility the console offers.
## EventSystem
A first draft of an implementation of an eventsystem for Fudge, since DomScene appears to be far slower.
## Scripttests
Experiments for embeding und using a hierarchy of script-type objects. See details in the readme-file in the folder
## Shapes
Experiments for a 2D-scene- and -component-hierarchy. Some of the component structures may be a foundation for Fudge. Most interestingly, all 2D-shapes (also circle, rectangle) are made of splines. Certainly a way to go for the vectorgraphics part
## Curves
Interactive demonstration of the Quadratic- and Beziersplines the CanvasRenderingContext offers and a visualization of the parameters used.
## Animate
Using an HTML5-Export from Adobe Animate in a TypeScript environment. May give insights and ideas on how to organize hierarchies and animations using Create.js and the like.
## ClassGetterSetter
Just a simple test using getters and setters in TypeScript.
## DomScene
Experiments using the HTML-Dom-Nodes as base for a FudgeNode. Expectation was, that iterations and the like perform better than implementations in JavaScript, since their built at lower levels.
## Generics
Some fundamental experiments with Generics
## ImagesAndSound
Loading images and sound and playing, pausing sound
## JSONTest
First tests for serialization and deserialization of objects linked in an hierarchical structure (SceneTree)
## RenderHTMLandSVG
Render SVG on the canvas and render HTML through SVG on the canvas
## ResponsiveCanvas
Just rescaling the canvas to the current browserwindow
## Vector
An old 2D-vector-class needed e.g. for the curves example
## WebGLTest1
First very primitve experments with WebGL
## x3dom
Simple example file for x3dom
## NameSpace
Testing namespace/module structure and naming conventions (just a proposal to use ƒ as alias for Fudge)
## ObjectManager
Factory to create and reuse instances of arbitrary classes. First iteration on optimization to avoid the carbage collector blocking animations