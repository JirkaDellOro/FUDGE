namespace Test {
  console.log("Load Test0");
  //   export module ScriptModule {
  export class Test0 {
    public content: string = "default";
    constructor(_content: string) {
      console.log("Creating Test with ", _content);
      this.content = _content;
      console.log("Test0 knows ", Try);
    }
  } 
}