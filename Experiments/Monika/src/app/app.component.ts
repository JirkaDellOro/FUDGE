import { Component } from '@angular/core';
import jQuery from "jquery";
import GoldenLayout from "golden-layout";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My First Angular App!';
  private layout: GoldenLayout = null;
}
