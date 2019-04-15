import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { Container } from 'golden-layout';
import * as jQuery from 'jquery';
import * as GoldenLayout from 'golden-layout';
import { SharedService } from "./../../shared.service";

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
})
export class MainViewComponent implements OnInit {
  constructor(
    //inject parent container
    @Inject("Container") public container: Container,
    @Inject("GoldenLayout") public layout: GoldenLayout,
    private detector: ChangeDetectorRef,
    public service: SharedService
  ) {
  }

  get width() {
    return this.container.width
  }
  get height() {
    return this.container.height
  }
  set width(val:number) {
    this.container.setSize(val, this.height);
  }
  set height(val:number) {
    this.container.setSize(this.width, val);
  }

  ngOnInit() {


    this.container.on("resize", _ => {
      //we need to tell angular that something was changed
      this.detector.detectChanges();
    })

    console.log("main view initialized");
  }
  ngOnDestroy(): void {
    console.log("main view destroyed");
  }
}
