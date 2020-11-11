namespace Try {
  console.log("Load Try");
  //   export module ScriptModule {
  export class Try {
    public content: string = "default";
    constructor(_content: string) {
      console.log("Creating Test with ", _content);
      this.content = _content;
      console.log("Try knows ", Test);
    }
  } 
}