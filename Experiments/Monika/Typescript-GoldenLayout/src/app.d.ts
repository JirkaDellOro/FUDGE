/// <reference types="golden-layout" />
declare let myLayout: GoldenLayout;
declare let savedState: string;
declare let config: GoldenLayout.Config;
declare function stateupdate(): void;
declare function createSimpleComponent(container: any, state: any): void;
declare function createPersistentComponent(state: string): GoldenLayout.Container;
