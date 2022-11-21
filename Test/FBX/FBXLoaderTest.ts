///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");
    console.log(loader.nodes);
    console.log(loader.getObjects());
  }
}