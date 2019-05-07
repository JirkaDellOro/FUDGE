class simpleComponent
{
    public constructor(container:any, state:any)
    {
        let element:HTMLSpanElement = document.createElement("span");
        element.innerHTML = "<h2>hamanamahanahama</h2>";
        container.getElement().html(element);
    }
}