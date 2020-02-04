///<reference types="../../Build/Fudge"/>

namespace Fudge {
  export class ViewAnimationTemplate extends PanelTemplate {
    constructor() {
      super();
      this.config = {
        type: "column",
        content: [
          {
            type: "row",
            content: [
              {
                type: "component",
                componentName: Fudge.VIEW.PORT,
                title: "Viewport"
              },
              {
                type: "component",
                componentName: Fudge.VIEW.DATA,
                title: "Inspector"
              }
            ]
          },
          {
            type: "component",
            componentName: Fudge.VIEW.ANIMATION,
            title: "Animator"
          }
        ]
      };
    }
  }
}