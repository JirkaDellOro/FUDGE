namespace Test {
  console.log("Load Test1");
  //   export module ScriptModule {
  export class Test1 {
    public content: string = "default";
    constructor(_content: string) {
      console.log("Creating Test with ", _content);
      this.content = _content;
      console.log("Test1 knows ", Try);
    }
  } 
}