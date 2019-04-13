# Animator
## Addendum

Thanks to lots of math and the friendly help of [this random internet stranger](https://math.stackexchange.com/questions/3173469/calculate-cubic-equation-from-two-points-and-two-slopes-variably/3173881#3173881), the animation curve between two Key(frame)s can be described as a cubic equation (<img src="https://latex.codecogs.com/gif.latex?f(x)=ax^3&plus;bx^2&plus;cx&plus;d" title="f(x)=ax^3+bx^2+cx+d" alt="If image doesn't load properly after a few seconds, please reload the page"/>).  

Calculating the variables of this function is costly to calculate, so it should be run as rarely as possible, aka only when a recalculation is necessary (when a Key is moved). Also, handling x0 as 0 by moving the point on the x axis allows for a much easier linear system to calculate a-d.  

Before conversion:  

<img src="https://latex.codecogs.com/gif.latex?\left\{&space;\begin{array}{rcl}&space;a&=&&space;\frac{\left(m_0&plus;m_1\right)&space;\left(x_0-x_1\right)-2&space;y_0&plus;2&space;y_1}{\left(x_0-x_1\right){}^3}&space;\\&space;b&=&&space;\frac{-m_0&space;\left(x_0-x_1\right)&space;\left(x_0&plus;2&space;x_1\right)&plus;m_1&space;\left(-2&space;x_0^2&plus;x_1&space;x_0&plus;x_1^2\right)&plus;3&space;\left(x_0&plus;x_1\right)&space;\left(y_0-y_1\right)}{\left(x_0-x_1\right){}^3}&space;\\&space;c&=&&space;\frac{m_1&space;x_0&space;\left(x_0-x_1\right)&space;\left(x_0&plus;2&space;x_1\right)-x_1&space;\left(m_0&space;\left(-2&space;x_0^2&plus;x_1&space;x_0&plus;x_1^2\right)&plus;6&space;x_0&space;\left(y_0-y_1\right)\right)}{\left(x_0-x_1\right){}^3}&space;\\&space;d&=&&space;\frac{\left(x_0-3&space;x_1\right)&space;y_1&space;x_0^2&plus;x_1&space;\left(x_0&space;\left(x_1-x_0\right)&space;\left(m_1&space;x_0&plus;m_0&space;x_1\right)-x_1&space;\left(x_1-3&space;x_0\right)&space;y_0\right)}{\left(x_0-x_1\right){}^3}&space;\\&space;\end{array}&space;\right." title="\left\{ \begin{array}{rcl} a&=& \frac{\left(m_0+m_1\right) \left(x_0-x_1\right)-2 y_0+2 y_1}{\left(x_0-x_1\right){}^3} \\ b&=& \frac{-m_0 \left(x_0-x_1\right) \left(x_0+2 x_1\right)+m_1 \left(-2 x_0^2+x_1 x_0+x_1^2\right)+3 \left(x_0+x_1\right) \left(y_0-y_1\right)}{\left(x_0-x_1\right){}^3} \\ c&=& \frac{m_1 x_0 \left(x_0-x_1\right) \left(x_0+2 x_1\right)-x_1 \left(m_0 \left(-2 x_0^2+x_1 x_0+x_1^2\right)+6 x_0 \left(y_0-y_1\right)\right)}{\left(x_0-x_1\right){}^3} \\ d&=& \frac{\left(x_0-3 x_1\right) y_1 x_0^2+x_1 \left(x_0 \left(x_1-x_0\right) \left(m_1 x_0+m_0 x_1\right)-x_1 \left(x_1-3 x_0\right) y_0\right)}{\left(x_0-x_1\right){}^3} \\ \end{array} \right." alt="If image doesn't load properly after a few seconds, please reload the page"/>

After Conversion:  

<img src="https://latex.codecogs.com/gif.latex?\left\{&space;\begin{array}{rcl}&space;a&=&&space;\frac{\left(-x_1\right)\left(m_0&plus;m_1\right)&space;-2&space;y_0&plus;2&space;y_1}{\left(-x_1\right){}^3}&space;\\&space;b&=&&space;\frac{m_1-m_0-3ax_1^2}{2x_1}&space;\\&space;c&=&&space;m_0&space;\\&space;d&=&&space;y_0&space;\\&space;\end{array}&space;\right." title="\left\{ \begin{array}{rcl} a&=& \frac{\left(-x_1\right)\left(m_0+m_1\right) -2 y_0+2 y_1}{\left(-x_1\right){}^3} \\ b&=& \frac{m_1-m_0-3ax_1^2}{2x_1} \\ c&=& m_0 \\ d&=& y_0 \\ \end{array} \right." alt="If image doesn't load properly after a few seconds, please reload the page" />

_Math images added with the help from https://www.codecogs.com/latex/eqneditor.php_

Thus an easy way to calculate the value of the animation in connection to the time has been found [and implemented exemplary here](https://jirkadelloro.github.io/FUDGE/Experiments/Lukas/Canvas/10_animation2/).

## News
A Class Hierarchy for the Animation Objects has been proposed and refined. [Whiteboard](https://github.com/JirkaDellOro/FUDGE/blob/master/Design/Logs/190410_Whiteboard3.jpg), [Beautiful UML](http://www.plantuml.com/plantuml/proxy?fmt=svg&cache=no&src=https://jirkadelloro.github.io/FUDGE/Experiments/Lukas/PlantUML/01_Classdiagram/Animations.puml).

Things that need to be considered in addition:  
- Numbers can be animated easily. But what about booleans?
- using Frame Labels to allow for an "animated animation", so the animation of Enums?
- How are Animations looping?
- What about slowdown/speedup?
- Make sure rootmotion can be applied! Might need to be done one level higher.
- When prerendered, the FPS should be directly infered from the Animation Editor
- Animation Events

# Vector Editor

A List of User Input Events has been established. Those need to be clearly specified and coordinated with the UI and UX Team. Prevention of Overlaps is needed.  
Once these are well established, a Input-Scheme can be found. Current Proposals:
- One big Handler Class/Object/Function, that calls the appropriate Functions depending on the prequisites
- Every Action is its own Object, called by a centralised Eventhandler, which tests itself whether it should be running with the given circumstances  
- Actions are part of the Editor Class and all add their own Eventlistener, leading to multiple Eventlisteners of the same type (e.g. click/mousemove would have a lot of different listeners).
- UI and UX need to be involved for the creation of the VE UI.

# General

- Mutator and Serialisation seperated. Mutator used to get AnimateableMutator as well as to mutate Object during runtime. Serialisation now only used for saving and loading permanently.  
Serialisation will require you to explicitly add what needs to be saved. On the contrary the mutator will add everything and will ask you to remove what you don't want mutated.  
The Mutator ignores accessability of variables and thus private or protected variables need to be removed specifically if they shouldn't be mutateable. Functions and non-mutateable attributes are ignored by default.  
- There is a global EVENT Enumeration now. It should be used instead of defining events via error-prone strings. Currently Global for all of FUDGE, is considered to be split if the amount of Events gets too big.  
- FUDGE now has a ♥-beat. It sits in Fudge.Loop and fires EVENT.ANIMATION_FRAME on every answer of window.requestAnimationFram
