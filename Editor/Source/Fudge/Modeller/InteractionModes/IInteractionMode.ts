namespace Fudge {
  import ƒ = FudgeCore;
  export interface IInteractionMode {
    readonly type: INTERACTION_MODE;
    selection: Array<number>;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;
    // selector: Selector;

    // constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node, selection: Array<number> = []) {
    //   this.viewport = viewport;
    //   this.editableNode = editableNode;
    //   this.selection = selection;
    // }

    onmousedown(_event: ƒ.EventPointer): void;
    onmouseup(_event: ƒ.EventPointer): string;
    onmove(_event: ƒ.EventPointer): void;
    // save states at the end
    onkeydown(_pressedKey: string): void;
    onkeyup(_pressedKey: string): string;
    update(): void;
    // fix this tomorrow
    getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
    contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void; 

    initialize(): void;
    cleanup(): void;
    animate(): void;
    updateAfterUndo(): void;

    // /* returns its state in json or null, if nothing was altered */
    // abstract onmousedown(_event: ƒ.EventPointer): void;
    // abstract onmouseup(_event: ƒ.EventPointer): string;
    // abstract onmove(_event: ƒ.EventPointer): void;
    // // save states at the end
    // abstract onkeydown(_pressedKey: string): void;
    // abstract onkeyup(_pressedKey: string): string;
    // abstract update(): void;
    // // fix this tomorrow
    // abstract getContextMenuItems(_callback: ContextMenuCallback): Electron.MenuItem[];
    // abstract contextMenuCallback(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.Event): void; 

    // abstract initialize(): void;
    // abstract cleanup(): void;

    // public animate = () => {
    //   this.drawCircleAtVertex();
    //   this.drawCircleAtSelection();
    // }

    // public updateAfterUndo(): void {
    //   for (let i: number = 0; i < this.selection.length; i++) {
    //     if (this.selection[i] >= (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length) {
    //       this.selection.splice(i, 1);
    //       i--;
    //     }
    //   }
    //   this.update();
    // }

    // protected getPosRenderFrom(_event: ƒ.EventPointer): ƒ.Vector2 {
    //   let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
    //   return this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getCanvasRectangle().height - mousePos.y));
    // }

    // protected createNormalArrows(): void {
    //   this.removeNormalArrows();
    //   let mesh: ƒ.Mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
    //   for (let i: number = 0; i < mesh.vertices.length; i += 3) {
    //     let vertex: ƒ.Vector3 = new ƒ.Vector3(mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]);
    //     let normal: ƒ.Vector3 = new ƒ.Vector3(mesh.normalsFace[i], mesh.normalsFace[i + 1], mesh.normalsFace[i + 2]);
    //     let normalArrow: ƒ.Node = new ƒAid.Node("normal", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat));
    //     let shaft: ƒ.Node = new ƒAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshCube());
    //     let head: ƒ.Node = new ƒAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshPyramid());
    //     shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
    //     head.mtxLocal.translateZ(0.5);
    //     head.mtxLocal.rotateX(90);
    //     head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
  
    //     shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
    //     head.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
  
    //     normalArrow.addChild(shaft);
    //     normalArrow.addChild(head);
    //     normalArrow.mtxLocal.translation = vertex;
    //     let vector: ƒ.Vector3 = ƒ.Vector3.SUM(vertex, normal);
    //     try {
    //       normalArrow.mtxLocal.lookAt(vector);
    //     } catch {
    //       if (normal.y > 0) {
    //         normalArrow.mtxLocal.rotateX(-90);
    //       } else {
    //         normalArrow.mtxLocal.rotateX(90);
    //       }
    //     }
    //     this.viewport.getGraph().addChild(normalArrow);
    //   }
    //   IInteractionMode.normalsAreDisplayed = true;
    // }

    // protected removeNormalArrows(): void {
    //   for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
    //     this.viewport.getGraph().removeChild(node);
    //   }
    //   IInteractionMode.normalsAreDisplayed = false;

    // }

    
    // protected copyVertices(): Map<number, ƒ.Vector3> {
    //   let vertices: UniqueVertex[] = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices;
    //   let copyOfSelectedVertices: Map<number, ƒ.Vector3> = new Map();
    //   for (let vertexIndex of this.selection) {
    //     copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
    //   }
    //   return copyOfSelectedVertices;
    // }

    // protected getPointerPosition(_event: ƒ.EventPointer, distance: number): ƒ.Vector3 {
    //   let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
    //   return ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, distance));
    // }

    // protected getDistanceFromRayToCenterOfNode(_event: ƒ.EventPointer, distance: number): ƒ.Vector3 {
    //   return ƒ.Vector3.DIFFERENCE(this.getPointerPosition(_event, distance), (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection));
    // }
    
    // // protected getDistanceFromCameraToCenterOfNode(): number {
    // //   return ƒ.Vector3.DIFFERENCE((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection), this.viewport.camera.pivot.translation).magnitude;
    // // }

    // protected getDistanceFromCameraToCenterOfNode(): number {
    //   return ƒ.Vector3.DIFFERENCE((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection), this.viewport.camera.getContainer().mtxWorld.translation).magnitude;
    // }

    // private drawCircleAtVertex(): void {
    //   let crx2d: CanvasRenderingContext2D = this.viewport.getCanvas().getContext("2d");
    //   for (let vertex of (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices) {
    //     let pos: ƒ.Vector2 = this.viewport.pointWorldToClient(vertex.position);
    //     crx2d.beginPath();
    //     crx2d.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
    //     crx2d.fillStyle = "black";

    //     crx2d.fill();
    //   }
    // }

    // private drawCircleAtSelection(): void {
    //   let crx2d: CanvasRenderingContext2D = this.viewport.getCanvas().getContext("2d");
    //   for (let vertex of this.selection) {
    //     let pos: ƒ.Vector2 = this.viewport.pointWorldToClient((<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices[vertex].position);
    //     crx2d.beginPath();
    //     crx2d.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    //     crx2d.fillStyle = "white";
    //     crx2d.fill();
    //   }
    // }
  }
}