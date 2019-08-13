import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalsService } from '../../services/globals.service';
import { AbstractMesh } from 'babylonjs';

@Component({
  selector: 'app-hierarchy',
  templateUrl: './hierarchy.component.html',
  styleUrls: ['./hierarchy.component.css']
})
export class HierarchyComponent implements OnInit, OnDestroy {

  private sceneList: HTMLDetailsElement;
  private nodeChangeSubscription: Subscription;
  private selectedMeshSubscription: Subscription;

  constructor(private globals: GlobalsService) { }

  ngOnInit() {
    this.sceneList = <HTMLDetailsElement>document.getElementById('scene');
    this.sceneList.addEventListener('dragover', this.dragOverHandler);
    this.sceneList.addEventListener('drop', this.dropHandler);

    this.nodeChangeSubscription = this.globals.sceneTree.subscribe(this.receiveNodeChange);
    this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.getSelectedMesh);
  }

  private getSelectedMesh = (_mesh: AbstractMesh) => {
    // last selected node
    const selected: HTMLElement = document.getElementById('selected');
    if (selected) {
      selected.removeAttribute('id');
    }
    if (_mesh) {
      const node: HTMLElement = document.getElementById(_mesh.id);
      const child: HTMLSummaryElement = <HTMLSummaryElement>node.firstElementChild;
      child.id = 'selected';
    }
  }

  private receiveNodeChange = (_data: string[]) => {
    if (_data === undefined) {
      this.removeAllNodes();
      return;
    }
    if (_data[1] === 'add') {
      this.addNode(_data[0], _data[2]);
    }
    if (_data[1] === 'remove') {
      this.removeNode(_data[0]);
    }
  }

  private selectMesh = (_event: MouseEvent) => {
    const target: HTMLElement = <HTMLElement>_event.target;
    if (target.parentElement.id !== 'camera' && target.parentElement.id !== 'light') {
      this.globals.selectedMesh.next(this.globals.scene.getMeshByID(target.parentElement.id));
    }
  }

  private dragStart = (_event: DragEvent) => {
    const target: HTMLElement = <HTMLElement>_event.target;
    _event.dataTransfer.setData('id', target.id);
  }

  private dragOverHandler = (_event: DragEvent) => {
    _event.preventDefault();
  }

  private dropHandler = (_event: DragEvent) => {
    const target: HTMLElement = <HTMLElement>_event.target;
    const data: string = _event.dataTransfer.getData('id');
    const node: HTMLElement = document.getElementById(data);
    const parent: HTMLElement = target.parentElement;

    if (parent.id === 'camera' || parent.id === 'light') {
      return;
    }
    // check if same drag and drop target
    if (parent.id === data) {
      return;
    }
    // check if drag target is child of drop target
    if (node.contains(parent)) {
      return;
    }
    parent.appendChild(node);
    this.setParent(node.id, parent.id);
  }

  private addNode(_nodeName: string, _parentNode: string = 'scene'): void {
    const newListItem: HTMLDetailsElement = <HTMLDetailsElement>document.createElement('DETAILS');
    newListItem.id = _nodeName;
    newListItem.className = 'childNode';
    newListItem.open = true;
    newListItem.draggable = true;
    newListItem.addEventListener('drop', this.dropHandler);
    newListItem.addEventListener('dragover', this.dragOverHandler);
    newListItem.addEventListener('dragstart', this.dragStart);
    newListItem.addEventListener('click', this.selectMesh);

    const summary: HTMLSummaryElement = document.createElement('SUMMARY');
    summary.innerHTML = _nodeName;

    newListItem.appendChild(summary);
    document.getElementById(_parentNode).appendChild(newListItem);
  }

  private removeNode(_nodeName: string): void {
    const node: HTMLElement = document.getElementById(_nodeName);
    node.parentElement.removeChild(node);
  }

  private setParent(_mesh: string, _parent: string): void {
    this.globals.scene.getMeshByID(_mesh).parent = this.globals.scene.getMeshByID(_parent);
  }

  private removeAllNodes(): void {
    const nodes = document.getElementsByClassName('childNode');
    while (nodes.length > 0) {
      nodes[0].parentNode.removeChild(nodes[0]);
    }
  }

  ngOnDestroy() {
    this.nodeChangeSubscription.unsubscribe();
    this.selectedMeshSubscription.unsubscribe();
  }
}
