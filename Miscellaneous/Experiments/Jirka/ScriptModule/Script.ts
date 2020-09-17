export class Test {
  public content: string = "default";
  constructor(_content: string) {
    console.log("Creating Test with ", _content);
    this.content = _content;
  }
}