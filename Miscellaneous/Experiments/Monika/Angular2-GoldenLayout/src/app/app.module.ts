import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { MainViewComponent } from './views/main-view/main-view.component';
import { SecondViewComponent } from './views/second-view/second-view.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, MainViewComponent, SecondViewComponent ],
  bootstrap:    [ AppComponent ],
  entryComponents: [MainViewComponent, SecondViewComponent] // reg entryComponents
})
export class AppModule { }
