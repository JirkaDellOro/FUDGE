import { Component, ComponentFactoryResolver, ApplicationRef, Injector, NgZone, ComponentRef } from '@angular/core';
import * as jQuery from 'jquery';
import * as GoldenLayout from 'golden-layout';
import { MainViewComponent } from './views/main-view/main-view.component';
import { SecondViewComponent } from './views/second-view/second-view.component';
import { Content } from '@angular/compiler/src/render3/r3_ast';

type NgComponent<T> = { new(...params: any[]): T };

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Angular';
  private layout: GoldenLayout = null;
  private config = {
    settings: {
      showPopoutIcon: false //Angular SPA. it will not be working in multi window app
    },
    content: [{
      type: 'column',
      content: [{
        type: 'row',
        height: 70,
        content:[{
          type: 'component',
          componentName: 'main',
          title: 'Scene Explorer',
          width: 20
      },
      {
          type: 'component',
          componentName: 'second',
          title: 'Viewport',
          width: 60
      },
      {
        type: 'component',
        componentName: 'second',
        title: 'Inspector',
        width: 20
    }]},
      {
          type: 'row',
          content: [{
              type: 'component',
              componentName: 'third',
              title: 'File Explorer',
              height: 30,
              width: 100
          }]
      }]
    }]
};
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private zone: NgZone
  ) {

    this.layout = new GoldenLayout(this.config);

    //reg components. this components must be registered in angular as entryComponents (see app.module.ts)
    this.registerComponent("main", MainViewComponent);
    this.registerComponent("second", MainViewComponent);
    this.registerComponent("third", MainViewComponent);
    this.registerComponent("fourth", MainViewComponent);
    this.registerComponent("fifth", SecondViewComponent);
    this.registerComponent("sixth", SecondViewComponent);
    this.registerComponent("test", MainViewComponent);
    this.registerComponent("test2", SecondViewComponent);

    this.layout.init();
  }

  registerComponent<T>(componentName: string, entryComponent: NgComponent<T>) {

    this.layout.registerComponent(componentName, (container: GoldenLayout.Container) => {

      var component: ComponentRef<T>;

      //create angular component in angular zone and append it in to layout container
      this.zone.run(_ => {
        component = this.createComponent(entryComponent, container);
        const view = (<any>component.hostView).rootNodes[0] as HTMLElement;
        container.getElement().append(view);
      });

      //destroy angular component
      container.on("destroy", () => {
        this.zone.run(_ => {
          this.destroyComponent(component);
        });
      });
    });
  }

  createComponent<T>(entryComponent: NgComponent<T>, container: GoldenLayout.Container) {
    const factory = this.componentFactoryResolver.resolveComponentFactory<T>(entryComponent);

    //inject container to component; we can get this value in component constructor
    const injector = Injector.create([
      { provide: "Container", useValue: container },
      { provide: "GoldenLayout", useValue: this.layout }
    ], this.injector);

    const component = factory.create(injector);
    this.appRef.attachView(component.hostView);

    return component;
  }

  destroyComponent(component: ComponentRef<any>) {
    this.appRef.detachView(component.hostView);
    component.destroy();
  }

}
