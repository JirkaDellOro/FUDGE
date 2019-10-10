# Animation

## Classdiagramm
![click here if it doesn't show up](http://www.plantuml.com/plantuml/proxy?fmt=svg&cache=no&src=https://jirkadelloro.github.io/FUDGE/Documentation/Design/Animation.puml)

## How the playback works

### Basics

Every Animation has, among other things, an Animation Structure. This Animation Structure is created from the Serialsation of the Node it is attached to. From that it will replace all Animateable values with AnimationSequences.  
The Sequences hold an array of AnimationKeys, which are the heart of every animation.  
The Keys keep an AnimationFunction between them, which represents the difference between the keys using a cubic function.

The Animation has a method `getMutated(time: number)`, which will return the AnimationStructure as a Mutator, where the Sequences are replaced with the values at that given time.
Because the same Animation can be played simultanously but not necessarily synchronous on various Nodes, the evaluation needs to happen indepedently, which is why the ComponentAnimator takes the role of the administrator of this Animation.  
When played back, the Animation will return the Mutator, the CompononentAnimator will take it to the node it's attached to which then will `applyAnimation()` the animation to its children and components.

### The weird but functional approach to playing the animation back

It's easy enough to run this animation like that. Continous, forward, normal. But this is where the issue arises: FUDGE is supposed to allow for other playmodes, including backwards, framebased/rastered and the combination of these two. After multiple different approaches that never went anywhere productive or had multiple problems, we came to a (imo) pretty neat solution that looks like this:

You have the standard sequence of keys. If now you want to play the sequence backwards, the Animation will generate a reverse copy of the sequence

## How the Events work