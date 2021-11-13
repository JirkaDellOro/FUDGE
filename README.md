<img src="https://jirkadelloro.github.io/FUDGE/Miscellaneous/Logo/FudgeLogoText.png" onload="document.querySelector('h1').style.visibility='hidden'"/>  

# Welcome!
FUDGE is a lightweight open-source game engine and editor created for educating students in an academic environment in the field of design and development of games and highly interactive applications. It may also be used as a rapid prototyping tool to easly convey and evaluate ideas for applications and games and as a tool to create educational games.

# Setup Runtime Environment
Include the script FudgeCore.js in the head of your HTML-page for the minimal setup.  
```html 
<script src="https://jirkadelloro.github.io/FUDGE/Core/Build/FudgeCore.js"></script>
```
See and examine this example of a [minimal scene on codepen](https://codepen.io/JirkaDellOro/pen/VwzveRP)

# Setup Editor Environment
- clone this repository
- install modules required by typing `npm install` in a terminal on the FUDGE-folder
- start the editor by typing `electron Editor/Electron` or `npm run-script run` or envoking the file FUDGE.bat using the mouse 

# Learn
## Overview
To get started with FUDGE, please browse through the [Wiki](https://github.com/JirkaDellOro/FUDGE/wiki) to learn about the core concepts and the inner workings of FUDGE. Doing so will grant you an intuitive understanding extremely helpful for further working with FUDGE.

## Repository Structure
Find the source code on [Github](https://github.com/JirkaDellOro)  
### Core  
Contains the core functionality of FUDGE needed to create games. For many games it's sufficient to work only with this module.  
See this [diagram](https://jirkadelloro.github.io/FUDGE/Documentation/Design/FUDGECoreClassdiagram.svg) to get an overview of its structure.  
Visit the [reference](https://JirkaDellOro.github.io/FUDGE/Documentation/Reference/Core/modules/FudgeCore.html) for detailed explanation.  
### Physics  
Contains an adapted version of the Oimo-Physics-Engine that works with FUDGE  
### UserInterface  
Contains the classes for easy and even automatic creation of graphical interfaces using the mutator concept (see Wiki). This module is heavily used in the editor and can be used and extended for games.  
Visit the [reference](https://JirkaDellOro.github.io/FUDGE/Documentation/Reference/UserInterface/modules/FudgeUserInterface.html) for detailed explanation.  
### Net  
Contains components for gaming over networks. This module is not fully evaluated yet.
Visit the [reference for FudgeServer](https://jirkadelloro.github.io/FUDGE/Documentation/Reference/Net/index.html)
and the [reference for FudgeClient](https://JirkaDellOro.github.io/FUDGE/Documentation/Reference/Net/modules/FudgeNet.html)
### Aid  
Contains collections of classes for convenience, bundling and simplifying common procedures.  
Visit the [reference](https://JirkaDellOro.github.io/FUDGE/Documentation/Reference/Aid/modules/FudgeAid.html) for detailed explanation.    

<hr/>  

### Editor  
The directory of the actual standalone editor to be executed with Electron or packed as executable by an Electron packager
### Documentation
Contains the design logs, diagrams (partially used in the wiki), tutorials and the API-References.  
### Test  
Contains programs to test the functionality of various components of FUDGE separately, thus also serve as a resource for learning about those functionalities and how to set them up. Use a local server to run the tests locally on your machine.  
### Miscellaneous	
A collection of various other helpful documents and resources

# Call for papers
## ToDo
- Cameratransformation, Axonometry and VR
- Diegetic User-Interface
- Grapheditor/Wiring for Shader and Animation
- Light and Shadow
- Primitve 3D-Models and 2D-Shapes 
- Importer for standard file formats
- Runtime-Recording for Replay
- Undo/Rollback
- Selection-Sets to store temporary Groups
- Advanced texturing
- Input-Manager  
## In Progress
- Skeleton System
- Particle Editor
## Done  

| Name               | Area                              |
|--------------------|-----------------------------------|
| Robel Teklezgi     | Foundation WebGL/Angular/Electron |
| Jascha Karagöl     | Foundation Scenetree              |
| Kathrin Fuhrer     | AR-Core with FUDGE and Electron   |
| Lukas Scheuerle    | Sketch- and Animation System      |
| Thomas Dorner      | Foundation Audio                  |
| Falco Böhnke       | Net-Components                    |
| Monika Galkewitsch | UI-Components                     |
| Lea Stegk          | UI-Design                         |
| Elke Scherffius    | Tutorials                         |
| Marko Fehrenbach   | Physics                           |
| Jonas Plotzky      | Particlesystem                    |
| Robin Schwab       | Modeller                          |
| Luis Keck          | Shader-System                     |
| Marius König       | Integration Golden Layout 2       |
