/// <reference types="golden-layout" />
declare let myLayout: GoldenLayout;
declare let savedState: string;
declare function init(): void;
declare function stateupdate(): void;
declare function createSimpleComponent(container: any, state: any): void;
declare function createPersistentComponent(container: any, state: any): any;
