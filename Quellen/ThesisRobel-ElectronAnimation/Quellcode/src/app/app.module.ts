import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { EditorComponent } from './editor/editor.component';
import { HierarchyComponent } from './editor/hierarchy/hierarchy.component';
import { TransformComponent } from './editor/transform/transform.component';
import { MaterialComponent } from './editor/material/material.component';

import { NgxElectronModule } from 'ngx-electron';

import { MeshesComponent } from './editor/meshes/meshes.component';
import { BoxComponent } from './editor/meshes/box/box.component';
import { SphereComponent } from './editor/meshes/sphere/sphere.component';
import { CylinderComponent } from './editor/meshes/cylinder/cylinder.component';
import { PlaneComponent } from './editor/meshes/plane/plane.component';
import { DiscComponent } from './editor/meshes/disc/disc.component';
import { TorusComponent } from './editor/meshes/torus/torus.component';
import { GroundComponent } from './editor/meshes/ground/ground.component';

import { GlobalsService } from './services/globals.service';
import { PlayerComponent } from './animation/player/player.component';
import { AnimationDisplayComponent } from './animation/animation-display/animation-display.component';
import { AnimTimelineComponent } from './animation/anim-timeline/anim-timeline.component';
import { AnimCreateComponent } from './animation/anim-create/anim-create.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    EditorComponent,
    HierarchyComponent,
    TransformComponent,
    MaterialComponent,
    MeshesComponent,
    BoxComponent,
    SphereComponent,
    CylinderComponent,
    PlaneComponent,
    DiscComponent,
    TorusComponent,
    GroundComponent,
    PlayerComponent,
    AnimationDisplayComponent,
    AnimTimelineComponent,
    AnimCreateComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule
  ],
  providers: [
    GlobalsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
