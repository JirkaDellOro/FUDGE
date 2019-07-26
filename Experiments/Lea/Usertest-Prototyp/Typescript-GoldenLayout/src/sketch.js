var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    let myLayout;
    function create() {
        let menubar = document.createElement("div");
        menubar.classList.add("navbar");
        let dropdown_file = document.createElement("div");
        dropdown_file.classList.add("dropdown");
        let file_content = document.createElement("div");
        file_content.id = "File_Dropdown";
        file_content.classList.add("dropdown-content");
        let item_new = document.createElement("a");
        item_new.innerHTML = "New File...";
        file_content.append(item_new);
        let item_open = document.createElement("a");
        item_open.innerHTML = "Open File...";
        file_content.append(item_open);
        let item_Save = document.createElement("a");
        item_Save.innerHTML = "Save";
        file_content.append(item_Save);
        let item_SaveAs = document.createElement("a");
        item_SaveAs.innerHTML = "Save as...";
        file_content.append(item_SaveAs);
        let item_Import = document.createElement("a");
        item_Import.innerHTML = "Import...";
        file_content.append(item_Import);
        let item_Export = document.createElement("a");
        item_Export.innerHTML = "Save";
        file_content.append(item_Export);
        let file_button = document.createElement("button");
        file_button.classList.add("dropbutton");
        file_button.innerHTML = 'File<i class = "fa fa-caret-down"></i>';
        let dropdown_edit = document.createElement("div");
        dropdown_edit.classList.add("dropdown");
        let edit_content = document.createElement("div");
        edit_content.id = "Edit_Dropdown";
        edit_content.classList.add("dropdown-content");
        let item_undo = document.createElement("a");
        item_undo.innerHTML = "Undo";
        edit_content.append(item_undo);
        let item_redo = document.createElement("a");
        item_redo.innerHTML = "Redo";
        edit_content.append(item_redo);
        let item_Copy = document.createElement("a");
        item_Copy.innerHTML = "Copy";
        edit_content.append(item_Copy);
        let item_Paste = document.createElement("a");
        item_Paste.innerHTML = "Paste";
        edit_content.append(item_Paste);
        let item_selectAll = document.createElement("a");
        item_selectAll.innerHTML = "Select All";
        edit_content.append(item_selectAll);
        let item_deselectAll = document.createElement("a");
        item_deselectAll.innerHTML = "Deselect All";
        edit_content.append(item_deselectAll);
        let edit_button = document.createElement("button");
        edit_button.classList.add("dropbutton");
        edit_button.innerHTML = 'Edit<i class = "fa fa-caret-down"></i>';
        edit_button.addEventListener("click", function () {
            edit_content.classList.toggle("show");
        });
        let dropdown_window = document.createElement("div");
        dropdown_window.classList.add("dropdown");
        let window_content = document.createElement("div");
        window_content.id = "window_Dropdown";
        window_content.classList.add("dropdown-content");
        let item_sketchEditor = document.createElement("a");
        item_sketchEditor.innerHTML = "Scene Editor";
        item_sketchEditor.addEventListener("click", scenebutton);
        window_content.append(item_sketchEditor);
        let item_animator = document.createElement("a");
        item_animator.innerHTML = "Animation Editor";
        item_animator.addEventListener("click", animatorbutton);
        window_content.append(item_animator);
        let item_3D = document.createElement("a");
        item_3D.innerHTML = "3D Model Editor";
        window_content.append(item_3D);
        let window_button = document.createElement("button");
        window_button.classList.add("dropbutton");
        window_button.innerHTML = 'Editor<i class = "fa fa-caret-down"></i>';
        window_button.addEventListener("click", function () {
            window_content.classList.toggle("show");
        });
        let dropdown_editor = document.createElement("div");
        dropdown_editor.classList.add("dropdown");
        let editor_content = document.createElement("div");
        editor_content.id = "add_Dropdown";
        editor_content.classList.add("dropdown-content");
        let item_tools = document.createElement("a");
        item_tools.innerHTML = "Toolbar";
        item_tools.addEventListener("click", addToolbar);
        editor_content.append(item_tools);
        let item_viewport = document.createElement("a");
        item_viewport.innerHTML = "Viewport";
        item_viewport.addEventListener("click", addViewport);
        editor_content.append(item_viewport);
        let item_inspector = document.createElement("a");
        item_inspector.innerHTML = "Inspector";
        item_inspector.addEventListener("click", addInspector);
        editor_content.append(item_inspector);
        let item_scene = document.createElement("a");
        item_scene.innerHTML = "Scene Explorer";
        item_scene.addEventListener("click", addScene);
        editor_content.append(item_scene);
        let item_resetLayout = document.createElement("a");
        item_resetLayout.innerHTML = "Reset Layout";
        editor_content.append(item_resetLayout);
        let editor_button = document.createElement("button");
        editor_button.classList.add("dropbutton");
        editor_button.innerHTML = 'Window<i class = "fa fa-caret-down"></i>';
        editor_button.addEventListener("click", function () {
            editor_content.classList.toggle("show");
        });
        let dropdown_tools = document.createElement("div");
        dropdown_tools.classList.add("dropdown");
        let tools_content = document.createElement("div");
        tools_content.id = "tools_Dropdown";
        tools_content.classList.add("dropdown-content");
        let item_select = document.createElement("a");
        item_select.innerHTML = "Selection Tool";
        tools_content.append(item_select);
        let item_translate = document.createElement("a");
        item_translate.innerHTML = "Move Selection";
        tools_content.append(item_translate);
        let item_rotate = document.createElement("a");
        item_rotate.innerHTML = "Rotate Selection";
        tools_content.append(item_rotate);
        let item_scale = document.createElement("a");
        item_scale.innerHTML = "Scale Selection";
        tools_content.append(item_scale);
        let item_pan = document.createElement("a");
        item_pan.innerHTML = "Pan View";
        tools_content.append(item_pan);
        let item_draw = document.createElement("a");
        item_draw.innerHTML = "Draw Shape";
        tools_content.append(item_draw);
        let item_combine = document.createElement("a");
        item_combine.innerHTML = "Combine Selection";
        tools_content.append(item_combine);
        let item_allign = document.createElement("a");
        item_allign.innerHTML = "Align Shape";
        tools_content.append(item_allign);
        let tools_button = document.createElement("button");
        tools_button.classList.add("dropbutton");
        tools_button.innerHTML = 'Tools<i class = "fa fa-caret-down"></i>';
        tools_button.addEventListener("click", function () {
            tools_content.classList.toggle("show");
        });
        let dropdown_help = document.createElement("div");
        dropdown_help.classList.add("dropdown");
        let help_content = document.createElement("div");
        help_content.id = "help_Dropdown";
        help_content.classList.add("dropdown-content");
        let item_tutorial = document.createElement("a");
        item_tutorial.innerHTML = "Tutorial";
        help_content.append(item_tutorial);
        let item_about = document.createElement("a");
        item_about.innerHTML = "About";
        help_content.append(item_about);
        let help_button = document.createElement("button");
        help_button.classList.add("dropbutton");
        help_button.innerHTML = 'Help<i class = "fa fa-caret-down"></i>';
        help_button.addEventListener("click", function () {
            help_content.classList.toggle("show");
        });
        dropdown_file.append(file_button);
        dropdown_file.append(file_content);
        menubar.append(dropdown_file);
        dropdown_edit.append(edit_button);
        dropdown_edit.append(edit_content);
        menubar.append(dropdown_edit);
        dropdown_window.append(window_button);
        dropdown_window.append(window_content);
        menubar.append(dropdown_window);
        dropdown_editor.append(editor_button);
        dropdown_editor.append(editor_content);
        menubar.append(dropdown_editor);
        dropdown_tools.append(tools_button);
        dropdown_tools.append(tools_content);
        menubar.append(dropdown_tools);
        dropdown_help.append(help_button);
        dropdown_help.append(help_content);
        menubar.append(dropdown_help);
        let root = document.getElementById("menu");
        root.append(menubar);
    }
    create();
    let savedState;
    let stage = 0;
    // let file:HTML = "test.html"
    let config = {
        content: [{
                type: 'row',
                content: [{
                        type: 'component',
                        componentName: 'Scene Explorer',
                        title: "Scene Explorer",
                        componentState: { label: 'A' }
                    },
                    {
                        type: 'component',
                        componentName: 'Viewport',
                        title: "Viewport",
                        componentState: { label: 'D' }
                    },
                    {
                        type: 'column',
                        content: [{
                                type: 'component',
                                componentName: 'Inspector',
                                title: "Inspector",
                                componentState: { label: 'B' }
                            },
                            {
                                type: 'component',
                                componentName: 'Menubar',
                                title: "Menubar",
                                componentState: { label: 'C' }
                            }]
                    }]
            }]
    };
    myLayout = new GoldenLayout(config);
    savedState = localStorage.getItem('sketchstate');
    // let state:GoldenLayout.ComponentConfig = myLayout.toConfig();
    if (savedState !== null) {
        myLayout = new GoldenLayout(JSON.parse(savedState));
    }
    else {
        myLayout = new GoldenLayout(config);
    }
    //Layout Changes - listener
    // let s:SimpleComponent = new SimpleComponent();
    // console.log(s);
    myLayout.on('stateChanged', stateupdate);
    myLayout.registerComponent('Viewport', createViewportComponent);
    myLayout.registerComponent('Scene Explorer', createExplorerComponent);
    myLayout.registerComponent('Inspector', createInspectorComponent);
    myLayout.registerComponent('Menubar', createToolComponent);
    myLayout.init();
    function stateupdate() {
        let state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('sketchstate', state);
    }
    function createbuttonpressed() {
        if (stage == 0) {
            myLayout.emit('create-button');
            stage += 1;
        }
    }
    function selectbuttonpressed() {
        if (stage == 1) {
            myLayout.emit('select-button');
            stage += 1;
        }
    }
    function rotatebuttonpressed() {
        if (stage == 2) {
            myLayout.emit('rotate-button');
        }
    }
    function hidebuttonpressed() {
        myLayout.emit('hide-button');
    }
    function shaderbuttonpressed() {
        myLayout.emit('button-hit');
    }
    function scriptbuttonpressed() {
        if (stage >= 2) {
            myLayout.emit('script-button');
        }
    }
    function animatorbutton() {
        window.location.href = "animator.html";
    }
    function createToolComponent(container, state) {
        let select_button = document.createElement("button");
        select_button.classList.add("ToolButton");
        select_button.innerHTML = '<img src = "icons/select.png">';
        container.getElement().append(select_button);
        let pan_button = document.createElement("button");
        pan_button.classList.add("ToolButton");
        pan_button.innerHTML = '<img src = "icons/hand.png">';
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(pan_button);
        let move_button = document.createElement("button");
        move_button.innerHTML = '<img src="icons/movetool.png">';
        move_button.classList.add("ToolButton");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(move_button);
        let rotate_button = document.createElement("button");
        rotate_button.innerHTML = '<img src = "icons/rotate.png">';
        rotate_button.classList.add("ToolButton");
        container.getElement().append(rotate_button);
        let scale_button = document.createElement("button");
        scale_button.innerHTML = '<img src = "icons/Scale_v2.png">';
        scale_button.classList.add("ToolButton");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(scale_button);
        let pen_button = document.createElement("button");
        pen_button.classList.add("ToolButton");
        pen_button.innerHTML = '<img src = "icons/PenTool.png">';
        container.getElement().append(pen_button);
        let combine_button = document.createElement("button");
        combine_button.classList.add("ToolButton");
        combine_button.innerHTML = '<img src = "icons/combine.png">';
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(combine_button);
        let allign_button = document.createElement("button");
        allign_button.innerHTML = '<img src="icons/align.png">';
        allign_button.classList.add("ToolButton");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(allign_button);
    }
    function createViewportComponent(container, state) {
        let image = document.createElement("img");
        image.addEventListener("click", selectbuttonpressed);
        image.src = "SketchEditor_canvas.png";
        image.classList.add("sketch_canvas");
        container.getElement().append(image);
        myLayout.on('create-button', function () {
            image.src = "SketchEditor_canvas.png";
        });
        myLayout.on('select-button', function () {
            image.src = "SketchEditor_canvas.png";
        });
        myLayout.on('rotate-button', function () {
            image.src = "SketchEditor_canvas.png";
        });
        myLayout.on('hide-button', function () {
            image.classList.toggle("folded");
        });
    }
    function createInspectorComponent(container, state) {
        // let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
        // let legend: HTMLLegendElement = document.createElement("legend");
        // legend.innerHTML = "Transform";
        // let toggleButton: HTMLButtonElement = document.createElement("button");
        // toggleButton.addEventListener("click", toggleFoldElement);
        // toggleButton.innerHTML = "v";
        // legend.appendChild(toggleButton);
        // fieldset.appendChild(legend);
        // legend.classList.add("unfoldable");
        let fieldset_Properties = document.createElement("fieldset");
        let legend = document.createElement("legend");
        let toggleButton = document.createElement("img");
        toggleButton.classList.add("fold_button");
        toggleButton.addEventListener("click", toggleFoldElement);
        toggleButton.src = 'icons/foldable_open.png';
        legend.appendChild(toggleButton);
        let title = document.createElement("span");
        title.innerHTML = "Properties";
        legend.append(title);
        fieldset_Properties.appendChild(legend);
        legend.classList.add("unfoldable");
        let container_Properties = document.createElement("div");
        container_Properties.classList.add("fieldset_content");
        let label_fillcolor = document.createElement("div");
        label_fillcolor.classList.add("column1");
        label_fillcolor.innerHTML = "Fill Color";
        let input_fillcolor = document.createElement("input");
        input_fillcolor.type = "color";
        input_fillcolor.classList.add("column2");
        container_Properties.append(label_fillcolor);
        container_Properties.append(input_fillcolor);
        let label_linecolor = document.createElement("div");
        label_linecolor.innerHTML = "Line Color";
        label_linecolor.classList.add("column1");
        let input_linecolor = document.createElement("input");
        input_linecolor.type = "color";
        input_linecolor.classList.add("column2");
        container_Properties.append(label_linecolor);
        container_Properties.append(input_linecolor);
        let label_linewidth = document.createElement("div");
        label_linewidth.innerHTML = "Line Width";
        label_linewidth.classList.add("column1");
        let input_linewidth = document.createElement("input");
        input_linewidth.classList.add("column2");
        container_Properties.append(label_linewidth);
        container_Properties.append(input_linewidth);
        let label_order = document.createElement("div");
        label_order.innerHTML = "Order";
        label_order.classList.add("column1");
        let input_order = document.createElement("input");
        input_order.classList.add("column2");
        container_Properties.append(label_order);
        container_Properties.append(input_order);
        fieldset_Properties.append(container_Properties);
        container.getElement().append(fieldset_Properties);
    }
    function createPersistentComponent(container, state) {
        if (!typeof window.localStorage) {
            container.getElement().append('<h2 class="err">Your browser doesn\'t support localStorage.</h2>');
            return;
        }
        // Create the input
        let input = $('<input type="text" />');
        container.getElement().append('<h2>I\'ll be saved to localStorage</h2>', input);
        // Set the initial / saved state
        if (state.label) {
            input.val(state.label);
        }
        // Store state updates
        input.on('change', function () {
            container.setState({
                label: input.val()
            });
        });
        return container;
    }
    function createExplorerComponent(container, state) {
        let dropdown_add = document.createElement("div");
        dropdown_add.classList.add("add_dropdown");
        let add_content = document.createElement("div");
        add_content.id = "add_Dropdown";
        add_content.classList.add("dropdown-content");
        let item_Cube = document.createElement("a");
        item_Cube.innerHTML = "Add Rectangle";
        add_content.append(item_Cube);
        let item_sphere = document.createElement("a");
        item_sphere.innerHTML = "Add Circle";
        add_content.append(item_sphere);
        let item_pyramid = document.createElement("a");
        item_pyramid.innerHTML = "Add Pyramid";
        add_content.append(item_pyramid);
        let add_button = document.createElement("button");
        add_button.classList.add("dropbutton");
        add_button.id = "add_button";
        add_button.innerHTML = 'Add Node<i class = "fa fa-caret-down"></i>';
        add_button.addEventListener("click", function () {
            add_content.classList.toggle("show");
        });
        dropdown_add.append(add_button);
        dropdown_add.append(add_content);
        container.getElement().append(dropdown_add);
        window.addEventListener("click", function (_event) {
            let target = _event.target;
            if (target.id != "add_button") {
                add_content.classList.remove("show");
            }
        });
        let container_explorer = document.createElement('div');
        container.getElement().append(container_explorer);
    }
    function addToolbar(e) {
        let newItemConfig = {
            title: 'Menubar',
            type: 'component',
            componentName: 'Menubar',
            componentState: { label: 'A' }
        };
        myLayout.root.contentItems[0].addChild(newItemConfig);
    }
    function addViewport(e) {
        let newItemConfig = {
            title: 'Viewport',
            type: 'component',
            componentName: 'Viewport',
            componentState: { label: 'A' }
        };
        myLayout.root.contentItems[0].addChild(newItemConfig);
    }
    function addScene(e) {
        let newItemConfig = {
            title: 'Scene Explorer',
            type: 'component',
            componentName: 'Scene Explorer',
            componentState: { label: 'A' }
        };
        myLayout.root.contentItems[0].addChild(newItemConfig);
    }
    function addInspector(e) {
        let newItemConfig = {
            title: 'Inspector',
            type: 'component',
            componentName: 'Inspector',
            componentState: { label: 'A' }
        };
        myLayout.root.contentItems[0].addChild(newItemConfig);
    }
    function scenebutton() {
        window.location.href = "editor.html";
    }
    function closeMenues(e) {
        let menu = document.getElementById("menu").firstChild;
        let children = menu.children;
        for (let child of children) {
            let innerChildren = child.children;
            for (let innerChild of innerChildren) {
                if (innerChild.classList.contains("show")) {
                    innerChild.classList.remove("show");
                }
            }
        }
        let target = e.target;
        console.log(target);
        if (target.classList.contains("dropbutton")) {
            let dropchildren = target.parentElement.children;
            for (let dropchild of dropchildren) {
                console.log(dropchild);
                if (dropchild.classList.contains("dropdown-content")) {
                    console.log("found you");
                    dropchild.classList.add("show");
                }
            }
        }
    }
    function toggleFoldElement(_event) {
        _event.preventDefault();
        if (_event.target != _event.currentTarget)
            return;
        let target = _event.target;
        let foldTarget = target.parentElement.parentElement;
        let foldToggle;
        //Toggle the folding behaviour of the Folding Target
        foldTarget.classList.contains("fieldset_folded") ? foldToggle = false : foldToggle = true;
        foldTarget.classList.toggle("fieldset_folded");
        if (foldToggle == true) {
            target.src = "icons/foldable_closed.png";
        }
        else {
            target.src = "icons/foldable_open.png";
        }
        // foldToggle == true ?  : foldTarget.classList.remove("fieldset_folded");
        // foldToggle == true ? target.innerHTML = "<img scr ='icons/Keyframe.png'>" : target.innerHTML = "<img scr='icons/event.png'>";
        let children = foldTarget.children;
        // for (let i = 0; i < children.length; i++) {
        for (let child of children) {
            // let child: HTMLElement = <HTMLElement>children[i];
            if (!child.classList.contains("unfoldable")) {
                child.classList.toggle("folded");
            }
        }
    }
    window.addEventListener("click", closeMenues);
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=sketch.js.map