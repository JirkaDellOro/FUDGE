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
        item_sketchEditor.innerHTML = "Sketch Editor";
        item_sketchEditor.addEventListener("click", sketchbutton);
        window_content.append(item_sketchEditor);
        let item_animator = document.createElement("a");
        item_animator.innerHTML = "Scene Editor";
        item_animator.addEventListener("click", scenebutton);
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
        item_tools.innerHTML = "Dopesheet";
        item_tools.addEventListener("click", addDopesheet);
        editor_content.append(item_tools);
        let item_viewport = document.createElement("a");
        item_viewport.innerHTML = "Curveview";
        item_viewport.addEventListener("click", addCurveview);
        editor_content.append(item_viewport);
        let item_inspector = document.createElement("a");
        item_inspector.innerHTML = "Inspector";
        item_inspector.addEventListener("click", addInspector);
        editor_content.append(item_inspector);
        let item_scene = document.createElement("a");
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
        let item_play = document.createElement("a");
        item_play.innerHTML = "Play/Stop Animation";
        tools_content.append(item_play);
        let item_pause = document.createElement("a");
        item_pause.innerHTML = "Pause Animation";
        tools_content.append(item_pause);
        let item_slowdown = document.createElement("a");
        item_slowdown.innerHTML = "Slow Down Playback";
        tools_content.append(item_slowdown);
        let item_speedup = document.createElement("a");
        item_speedup.innerHTML = "Speed Up Playback";
        tools_content.append(item_speedup);
        let item_skipback = document.createElement("a");
        item_skipback.innerHTML = "Skip to previous Keyframe";
        tools_content.append(item_skipback);
        let item_skipforw = document.createElement("a");
        item_skipforw.innerHTML = "Skip to next Keyframe";
        tools_content.append(item_skipforw);
        let item_label = document.createElement("a");
        item_label.innerHTML = "Add Label";
        tools_content.append(item_label);
        let item_event = document.createElement("a");
        item_event.innerHTML = "Add Event";
        tools_content.append(item_event);
        let item_keyframe = document.createElement("a");
        item_keyframe.innerHTML = "Add Keyframe";
        tools_content.append(item_keyframe);
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
                        componentName: 'Curveview',
                        title: "Curveview",
                        componentState: { label: 'A' }
                    },
                    {
                        type: 'component',
                        componentName: 'Dopesheet',
                        title: "Dopesheet",
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
                                componentName: 'Viewport',
                                title: "Viewport",
                                componentState: { label: 'B' }
                            },
                            {
                                type: 'component',
                                componentName: 'Menubar',
                                title: "Menubar",
                                componentState: { label: 'B' }
                            }
                        ]
                    }]
            }]
    };
    myLayout = new GoldenLayout(config);
    savedState = localStorage.getItem('animatorstate');
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
    myLayout.registerComponent('Dopesheet', createDopesheetComponent);
    myLayout.registerComponent('Curveview', createCurveviewComponent);
    myLayout.registerComponent('Inspector', createInspectorComponent);
    myLayout.registerComponent('Viewport', createViewportComponent);
    myLayout.registerComponent('Menubar', createToolComponent);
    myLayout.init();
    function stateupdate() {
        let state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('animatorstate', state);
    }
    function createDopesheetComponent(container, state) {
        let image = document.createElement("img");
        image.classList.add("fakeTimeline");
        image.src = "AnimationEditor.png";
        myLayout.on('create-button', function () {
            image.classList.add("cube");
            image.src = "AnimationEditor_keyframe.png";
        });
        container.getElement().append(image);
    }
    function createCurveviewComponent(container, state) {
        let image = document.createElement("img");
        image.src = "AnimationEditor.png";
        image.classList.add("fakeTimeline");
        myLayout.on('create-button', function () {
            image.classList.add("cube");
            image.src = "AnimationEditorCurveView.png";
        });
        container.getElement().append(image);
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
        let content = document.createElement("div");
        content.classList.add("fieldset_content");
        let label_name = document.createElement("div");
        label_name.classList.add("text");
        label_name.classList.add("column1");
        label_name.innerHTML = "Name";
        let input_name = document.createElement("input");
        input_name.classList.add("column1");
        label_name.append(input_name);
        content.append(label_name);
        let label_sps = document.createElement("div");
        label_sps.classList.add("column2");
        label_sps.classList.add("text");
        label_sps.innerHTML = "SPS";
        let input_sps = document.createElement("input");
        input_sps.classList.add("column2");
        label_sps.append(input_sps);
        content.append(label_sps);
        let label_play = document.createElement("div");
        label_play.classList.add("text");
        label_play.classList.add("column1");
        label_play.innerHTML = "Play Mode";
        let play_select = document.createElement("select");
        let option_standard = document.createElement("option");
        option_standard.value = "standard";
        option_standard.text = "Start -> Finish";
        let option_loop = document.createElement("option");
        option_loop.value = "loop";
        option_loop.text = "Loop";
        play_select.options.add(option_standard);
        play_select.options.add(option_loop);
        label_play.appendChild(play_select);
        content.append(label_play);
        let label_fps = document.createElement("div");
        label_fps.classList.add("text");
        label_fps.classList.add("column2");
        label_fps.innerHTML = "FPS";
        let input_fps = document.createElement("input");
        label_fps.append(input_fps);
        content.append(label_fps);
        let button_container = document.createElement("div");
        // let play_button: HTMLSpanElement = document.createElement("button");
        // play_button.classList.add("contrButton");
        // play_button.innerHTML = '<img src = "icons/select.png">';
        // container.getElement().append(play_button);
        // let pause_button: HTMLSpanElement = document.createElement("button");
        // pause_button.classList.add("contrButton");
        // pause_button.innerHTML = '<img src = "icons/hand.png">';
        // //button.addEventListener("click", buttonpressed);
        // container.getElement().append(pause_button);
        // let slow_button: HTMLSpanElement = document.createElement("button");
        // slow_button.innerHTML = '<img src="icons/movetool.png">';
        // slow_button.classList.add("contrButton");
        // //button.addEventListener("click", buttonpressed);
        // container.getElement().append(slow_button);
        // let fast_button: HTMLSpanElement = document.createElement("button");
        // fast_button.innerHTML = '<img src = "icons/rotate.png">';
        // fast_button.classList.add("contrButton");
        // container.getElement().append(fast_button);
        // let skipback_button: HTMLSpanElement = document.createElement("button");
        // skipback_button.innerHTML = '<img src = "icons/Scale_v2.png">';
        // skipback_button.classList.add("contrButton");
        // //button.addEventListener("click", buttonpressed);
        // container.getElement().append(skipback_button);
        // let skipforw_button: HTMLSpanElement = document.createElement("button");
        // skipforw_button.innerHTML = '<img src = "icons/Scale_v2.png">';
        // skipforw_button.classList.add("contrButton");
        // //button.addEventListener("click", buttonpressed);
        // container.getElement().append(skipforw_button);
        let toolbar_image = document.createElement("img");
        toolbar_image.classList.add("column1");
        toolbar_image.src = "animation_toolbar.png";
        toolbar_image.classList.add("fake-buttons");
        button_container.append(toolbar_image);
        let inv_button = document.createElement("button");
        inv_button.classList.add("column1");
        inv_button.id = "Invisibutton";
        button_container.append(inv_button);
        let label_button = document.createElement("button");
        label_button.classList.add("column1");
        label_button.innerHTML = '<img src = "icons/label.png">';
        label_button.classList.add("contrButton");
        label_button.classList.add("tooltip");
        let label_tooltip = document.createElement("span");
        label_tooltip.classList.add("tooltiptext");
        label_tooltip.innerHTML = "Add Label";
        label_button.append(label_tooltip);
        // button.addEventListener("click", buttonpressed);
        button_container.append(label_button);
        let event_button = document.createElement("button");
        event_button.classList.add("column1");
        event_button.innerHTML = '<img src = "icons/event.png">';
        event_button.classList.add("contrButton");
        event_button.classList.add("tooltip");
        let event_tooltip = document.createElement("span");
        event_tooltip.classList.add("tooltiptext");
        event_tooltip.innerHTML = "Add Event";
        event_button.append(event_tooltip);
        //button.addEventListener("click", buttonpressed);
        button_container.append(event_button);
        let keyframe_button = document.createElement("button");
        keyframe_button.classList.add("column1");
        keyframe_button.innerHTML = '<img src = "icons/Keyframe.png">';
        keyframe_button.classList.add("contrButton");
        keyframe_button.classList.add("tooltip");
        keyframe_button.addEventListener("click", function () {
            myLayout.emit('create-button');
        });
        let keyframe_tooltip = document.createElement("span");
        keyframe_tooltip.classList.add("tooltiptext");
        keyframe_tooltip.innerHTML = "Add Keyframe";
        keyframe_button.append(keyframe_tooltip);
        //button.addEventListener("click", buttonpressed);
        button_container.append(keyframe_button);
        let container_properties = document.createElement("div");
        container_properties.classList.add("fieldset_content");
        let label_position = document.createElement("div");
        label_position.classList.add("column1");
        label_position.innerHTML = "Position";
        let position_label_x = document.createElement("div");
        position_label_x.classList.add("column2");
        position_label_x.innerHTML = "X";
        let position_input_x = document.createElement("input");
        position_input_x.classList.add("column3");
        container_properties.append(label_position);
        container_properties.append(position_label_x);
        container_properties.append(position_input_x);
        let position_label_y = document.createElement("div");
        position_label_y.classList.add("column2");
        position_label_y.innerHTML = "Y";
        let position_input_y = document.createElement("input");
        position_input_y.classList.add("column3");
        container_properties.append(position_label_y);
        container_properties.append(position_input_y);
        let position_label_z = document.createElement("div");
        position_label_z.classList.add("column2");
        position_label_z.innerHTML = "Z";
        let position_input_z = document.createElement("input");
        position_input_z.classList.add("column3");
        container_properties.append(position_label_z);
        container_properties.append(position_input_z);
        let label_rotation = document.createElement("div");
        label_rotation.classList.add("column1");
        label_rotation.innerHTML = "Rotation";
        let rotation_label_x = document.createElement("div");
        rotation_label_x.classList.add("column2");
        rotation_label_x.innerHTML = "X";
        let rotation_input_x = document.createElement("input");
        rotation_input_x.classList.add("column3");
        container_properties.append(label_rotation);
        container_properties.append(rotation_label_x);
        container_properties.append(rotation_input_x);
        let rotation_label_y = document.createElement("div");
        rotation_label_y.classList.add("column2");
        rotation_label_y.innerHTML = "Y";
        let rotation_input_y = document.createElement("input");
        rotation_input_y.classList.add("column3");
        container_properties.append(rotation_label_y);
        container_properties.append(rotation_input_y);
        let rotation_label_z = document.createElement("div");
        rotation_label_z.classList.add("column2");
        rotation_label_z.innerHTML = "Z";
        let rotation_input_z = document.createElement("input");
        rotation_input_z.classList.add("column3");
        container_properties.append(rotation_label_z);
        container_properties.append(rotation_input_z);
        let label_scale = document.createElement("div");
        label_scale.classList.add("column1");
        label_scale.innerHTML = "Scale";
        let scale_label_x = document.createElement("div");
        scale_label_x.classList.add("column2");
        scale_label_x.innerHTML = "X";
        let scale_input_x = document.createElement("input");
        scale_input_x.classList.add("column3");
        container_properties.append(label_scale);
        container_properties.append(scale_label_x);
        container_properties.append(scale_input_x);
        let scale_label_y = document.createElement("div");
        scale_label_y.classList.add("column2");
        scale_label_y.innerHTML = "Y";
        let scale_input_y = document.createElement("input");
        scale_input_y.classList.add("column3");
        container_properties.append(scale_label_y);
        container_properties.append(scale_input_y);
        let scale_label_z = document.createElement("div");
        scale_label_z.classList.add("column2");
        scale_label_z.innerHTML = "Z";
        let scale_input_z = document.createElement("input");
        scale_input_z.classList.add("column3");
        container_properties.append(scale_label_z);
        container_properties.append(scale_input_z);
        let label_pivot = document.createElement("div");
        label_pivot.classList.add("column1");
        label_pivot.innerHTML = "Pivot";
        let pivot_label_x = document.createElement("div");
        pivot_label_x.classList.add("column2");
        pivot_label_x.innerHTML = "X";
        let pivot_input_x = document.createElement("input");
        pivot_input_x.classList.add("column3");
        container_properties.append(label_pivot);
        container_properties.append(pivot_label_x);
        container_properties.append(pivot_input_x);
        let pivot_label_y = document.createElement("div");
        pivot_label_y.classList.add("column2");
        pivot_label_y.innerHTML = "Y";
        let pivot_input_y = document.createElement("input");
        pivot_input_y.classList.add("column3");
        container_properties.append(pivot_label_y);
        container_properties.append(pivot_input_y);
        let pivot_label_z = document.createElement("div");
        pivot_label_z.classList.add("column2");
        pivot_label_z.innerHTML = "Z";
        let pivot_input_z = document.createElement("input");
        pivot_input_z.classList.add("column3");
        container_properties.append(pivot_label_z);
        container_properties.append(pivot_input_z);
        container.getElement().append(content);
        container.getElement().append(button_container);
        container.getElement().append(container_properties);
    }
    function createViewportComponent(container, state) {
        let image = document.createElement("img");
        image.src = "Cube_selected.png";
        image.classList.add("cube_gizmo");
        container.getElement().append(image);
        myLayout.on('rotate', function () {
            image.classList.add("cube_gizmo");
            image.src = "Cube_gizmo2.png";
            image.addEventListener("click", function () {
                myLayout.emit("create-button");
            });
        });
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
        rotate_button.addEventListener("click", function () {
            myLayout.emit("rotate");
        });
        container.getElement().append(rotate_button);
        let scale_button = document.createElement("button");
        scale_button.innerHTML = '<img src = "icons/scale_v3.png">';
        scale_button.classList.add("ToolButton");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(scale_button);
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
    function scenebutton() {
        window.location.href = "editor.html";
    }
    function sketchbutton() {
        window.location.href = "sketch.html";
    }
    function addDopesheet(e) {
        let newItemConfig = {
            title: 'Dopesheet',
            type: 'component',
            componentName: 'Dopesheet',
            componentState: { label: 'A' }
        };
        myLayout.root.contentItems[0].addChild(newItemConfig);
    }
    function addCurveview(e) {
        let newItemConfig = {
            title: 'Curveview',
            type: 'component',
            componentName: 'Curveview',
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
//# sourceMappingURL=animator.js.map