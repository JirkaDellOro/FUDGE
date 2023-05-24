/// <reference path="Debug/DebugTarget.ts"/>
/// <reference path="Debug/Debug.ts"/>
// / <reference path="Time/Time.ts"/>
/// <reference path="Event/Event.ts"/>
/// <reference path="Serialization/Mutable.ts"/>
/// <reference path="Serialization/Serializer.ts"/> 
/// <reference path="Graph/Node.ts"/>
/// <reference path="Component/Component.ts"/>
/// <reference path="Recycle/RecycableArray.ts"/>
/// <reference path="Render/RenderWebGL.ts"/>
/// <reference path="Render/RenderInjectorTexture.ts"/>
/// <reference path="Physics/HelpersPhysics.ts"/>
/// <reference path="Physics/Joint.ts"/>
/// <reference path="Physics/JointAxial.ts"/>


//global functions
function ifNumber(_check: number, _default: number): number {
  return typeof _check == "undefined" ? _default : _check;
}