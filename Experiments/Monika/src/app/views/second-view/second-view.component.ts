import { Component, OnInit, Inject } from '@angular/core';
import { Container } from 'golden-layout';
import { SharedService } from "./../../shared.service";

@Component({
  selector: 'app-second-view',
  templateUrl: './second-view.component.html',
})
export class SecondViewComponent implements OnInit {

  constructor(
    @Inject("Container") public container:Container,
    public service:SharedService
  ) { }

  get tabTitle(){
    return this.container.title
  }
  set tabTitle(val:string){
    this.container.setTitle(val);
  }

  ngOnInit() {
    console.log("second view initialized");
  }
  ngOnDestroy(){
    console.log("second view destroyed");
  }

}
