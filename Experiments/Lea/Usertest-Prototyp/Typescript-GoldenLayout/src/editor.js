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
        let item_project = document.createElement("a");
        item_project.innerHTML = "Ressource Manager";
        item_project.addEventListener("click", addRessource);
        editor_content.append(item_project);
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
        /*let item_animator:HTMLElement = document.createElement("a");
        item_animator.innerHTML = "Animation Editor";
        tools_dropdown.append(item_animator);
        let item_resetLayout:HTMLElement = document.createElement("a");
        item_resetLayout.innerHTML = "Reset Layout";
        tools_dropdown.append(item_resetLayout);*/
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
                        type: 'component',
                        componentName: 'Ressource Manager',
                        title: "Ressource Manager",
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
    savedState = localStorage.getItem('scenestate');
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
    myLayout.registerComponent('Ressource Manager', createRessourceComponent);
    myLayout.registerComponent('Inspector', createInspectorComponent);
    myLayout.registerComponent('Menubar', createToolComponent);
    myLayout.init();
    function stateupdate() {
        let state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('scenestate', state);
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
    function sketchbutton() {
        window.location.href = "sketch.html";
    }
    function createToolComponent(container, state) {
        let button_container = document.createElement("div");
        let select_button = document.createElement("button");
        select_button.classList.add("ToolButton");
        select_button.classList.add("tooltip");
        select_button.innerHTML = '<img src = "icons/select.png">';
        container.getElement().append(select_button);
        let select_tooltip = document.createElement("span");
        select_tooltip.classList.add("tooltiptext");
        select_tooltip.innerHTML = "Select";
        select_button.append(select_tooltip);
        let pan_button = document.createElement("button");
        pan_button.classList.add("ToolButton");
        pan_button.classList.add("tooltip");
        pan_button.innerHTML = '<img src = "icons/hand.png">';
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(pan_button);
        let panview_tooltip = document.createElement("span");
        panview_tooltip.classList.add("tooltiptext");
        panview_tooltip.innerHTML = "Pan View";
        pan_button.append(panview_tooltip);
        let translate_button = document.createElement("button");
        translate_button.innerHTML = '<img src="icons/movetool.png">';
        translate_button.classList.add("ToolButton");
        translate_button.classList.add("tooltip");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(translate_button);
        let translate_tooltip = document.createElement("span");
        translate_tooltip.classList.add("tooltiptext");
        translate_tooltip.innerHTML = "Translate";
        translate_button.append(translate_tooltip);
        let rotate_button = document.createElement("button");
        rotate_button.innerHTML = '<img src = "icons/rotate.png">';
        rotate_button.classList.add("ToolButton");
        rotate_button.classList.add("tooltip");
        rotate_button.addEventListener("click", rotatebuttonpressed);
        container.getElement().append(rotate_button);
        let rotate_tooltip = document.createElement("span");
        rotate_tooltip.classList.add("tooltiptext");
        rotate_tooltip.innerHTML = "Rotate";
        rotate_button.append(rotate_tooltip);
        let scale_button = document.createElement("button");
        scale_button.innerHTML = '<img src = "icons/scale_v3.png">';
        scale_button.classList.add("ToolButton");
        scale_button.classList.add("tooltip");
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(scale_button);
        let scale_tooltip = document.createElement("span");
        scale_tooltip.classList.add("tooltiptext");
        scale_tooltip.innerHTML = "Scale";
        scale_button.append(scale_tooltip);
    }
    function createViewportComponent(container, state) {
        let image = document.createElement("img");
        image.addEventListener("click", selectbuttonpressed);
        image.src = "empty.png";
        container.getElement().append(image);
        myLayout.on('create-button', function () {
            image.classList.add("cube");
            image.src = "Cube.png";
        });
        myLayout.on('select-button', function () {
            image.classList.add("cube_selected");
            image.src = "Cube_selected.png";
        });
        myLayout.on('rotate-button', function () {
            image.classList.add("cube_gizmo");
            image.src = "Cube_rotationGizmo3.png";
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
        let fieldset_container = document.createElement("div");
        fieldset_container.classList.add("fieldset_container");
        let fieldset_transform = document.createElement("fieldset");
        let legend_transform = document.createElement("legend");
        let toggleButton_transform = document.createElement("img");
        toggleButton_transform.classList.add("fold_button");
        toggleButton_transform.addEventListener("click", toggleFoldElement);
        toggleButton_transform.src = 'icons/foldable_open.png';
        legend_transform.appendChild(toggleButton_transform);
        let title_transform = document.createElement("span");
        title_transform.innerHTML = "Transform";
        legend_transform.append(title_transform);
        fieldset_transform.appendChild(legend_transform);
        legend_transform.classList.add("unfoldable");
        let container_position = document.createElement("div");
        container_position.classList.add("fieldset_transform");
        let label_position = document.createElement("label");
        label_position.classList.add("column1-6");
        label_position.innerHTML = "Position";
        let position_label_x = document.createElement("label");
        position_label_x.classList.add("column1");
        position_label_x.innerHTML = "X";
        let position_input_x = document.createElement("input");
        position_input_x.classList.add("column2");
        container_position.append(label_position);
        container_position.append(position_label_x);
        container_position.append(position_input_x);
        let position_label_y = document.createElement("label");
        position_label_y.classList.add("column3");
        position_label_y.innerHTML = "Y";
        let position_input_y = document.createElement("input");
        position_input_y.classList.add("column4");
        container_position.append(position_label_y);
        container_position.append(position_input_y);
        let position_label_z = document.createElement("label");
        position_label_z.classList.add("column5");
        position_label_z.innerHTML = "Z";
        let position_input_z = document.createElement("input");
        position_input_z.classList.add("column6");
        container_position.append(position_label_z);
        container_position.append(position_input_z);
        fieldset_transform.append(container_position);
        let container_rotation = document.createElement("div");
        container_rotation.classList.add("fieldset_transform");
        let label_rotation = document.createElement("label");
        label_rotation.classList.add("column1-6");
        label_rotation.innerHTML = "Rotation";
        let rotation_label_x = document.createElement("label");
        rotation_label_x.classList.add("column1");
        rotation_label_x.innerHTML = "X";
        let rotation_input_x = document.createElement("input");
        rotation_input_x.classList.add("column2");
        container_rotation.append(label_rotation);
        container_rotation.append(rotation_label_x);
        container_rotation.append(rotation_input_x);
        let rotation_label_y = document.createElement("label");
        rotation_label_y.classList.add("column3");
        rotation_label_y.innerHTML = "Y";
        let rotation_input_y = document.createElement("input");
        rotation_input_y.classList.add("column4");
        container_rotation.append(rotation_label_y);
        container_rotation.append(rotation_input_y);
        let rotation_label_z = document.createElement("label");
        rotation_label_z.classList.add("column5");
        rotation_label_z.innerHTML = "Z";
        let rotation_input_z = document.createElement("input");
        rotation_input_z.classList.add("column6");
        container_rotation.append(rotation_label_z);
        container_rotation.append(rotation_input_z);
        fieldset_transform.append(container_rotation);
        let container_scale = document.createElement("div");
        // container_scale.classList.add("fieldset_content");
        container_scale.classList.add("fieldset_transform");
        let label_scale = document.createElement("label");
        label_scale.classList.add("column1-6");
        label_scale.innerHTML = "Scale";
        let scale_label_x = document.createElement("label");
        scale_label_x.innerHTML = "X";
        scale_label_x.classList.add("column1");
        let scale_input_x = document.createElement("input");
        scale_input_x.classList.add("column2");
        container_scale.append(label_scale);
        container_scale.append(scale_label_x);
        container_scale.append(scale_input_x);
        let scale_label_y = document.createElement("label");
        scale_label_y.innerHTML = "Y";
        scale_label_y.classList.add("column3");
        let scale_input_y = document.createElement("input");
        scale_input_y.classList.add("column4");
        container_scale.append(scale_label_y);
        container_scale.append(scale_input_y);
        let scale_label_z = document.createElement("label");
        scale_label_z.innerHTML = "Z";
        scale_label_z.classList.add("column5");
        let scale_input_z = document.createElement("input");
        scale_input_z.classList.add("column6");
        container_scale.append(scale_label_z);
        container_scale.append(scale_input_z);
        fieldset_transform.append(container_scale);
        let fieldset_mesh = document.createElement("fieldset");
        let legend_mesh = document.createElement("legend");
        let toggleButton_mesh = document.createElement("img");
        toggleButton_mesh.classList.add("fold_button");
        toggleButton_mesh.addEventListener("click", toggleFoldElement);
        toggleButton_mesh.src = 'icons/foldable_open.png';
        legend_mesh.appendChild(toggleButton_mesh);
        let title_mesh = document.createElement("span");
        title_mesh.innerHTML = "Mesh";
        legend_mesh.append(title_mesh);
        fieldset_mesh.appendChild(legend_mesh);
        legend_mesh.classList.add("unfoldable");
        let container_mesh = document.createElement("div");
        container_mesh.classList.add("fieldset_mesh");
        let label_mesh = document.createElement("label");
        label_mesh.classList.add("column1");
        label_mesh.innerHTML = "Mesh";
        let mesh_input = document.createElement("input");
        mesh_input.classList.add("column2");
        container_mesh.append(label_mesh);
        container_mesh.append(mesh_input);
        fieldset_mesh.append(container_mesh);
        let fieldset_material = document.createElement("fieldset");
        let legend_material = document.createElement("legend");
        let toggleButton_material = document.createElement("img");
        toggleButton_material.classList.add("fold_button");
        toggleButton_material.addEventListener("click", toggleFoldElement);
        toggleButton_material.src = 'icons/foldable_open.png';
        legend_material.appendChild(toggleButton_material);
        let title_material = document.createElement("span");
        title_material.innerHTML = "Material";
        legend_material.append(title_material);
        fieldset_material.appendChild(legend_material);
        legend_material.classList.add("unfoldable");
        let container_material = document.createElement("div");
        container_material.classList.add("fieldset_material");
        let label_material = document.createElement("label");
        label_material.classList.add("column1");
        label_material.innerHTML = "Material";
        let material_input = document.createElement("input");
        material_input.classList.add("column2");
        container_material.append(label_material);
        container_material.append(material_input);
        let shader_select = document.createElement("select");
        shader_select.classList.add("column3");
        let option_standard = document.createElement("option");
        option_standard.value = "standard";
        option_standard.text = "Standard Shader";
        let option_cel = document.createElement("option");
        option_cel.value = "celshader";
        option_cel.text = "CelShader";
        shader_select.options.add(option_standard);
        shader_select.options.add(option_cel);
        container_material.append(shader_select);
        fieldset_material.append(container_material);
        let dropdown_add = document.createElement("div");
        dropdown_add.classList.add("add_dropdown");
        let add_content = document.createElement("div");
        add_content.id = "add_Dropdown";
        add_content.classList.add("dropdown-content");
        let item_transform = document.createElement("a");
        item_transform.innerHTML = "Add Transform Component";
        item_transform.addEventListener("click", createbuttonpressed);
        add_content.append(item_transform);
        let item_script = document.createElement("a");
        item_script.innerHTML = "Add Script Component";
        item_script.addEventListener("click", function () {
            let fieldset_script = document.createElement("fieldset");
            let legend_script = document.createElement("legend");
            let toggleButton_script = document.createElement("img");
            toggleButton_script.classList.add("fold_button");
            toggleButton_script.addEventListener("click", toggleFoldElement);
            toggleButton_script.src = 'icons/foldable_open.png';
            legend_script.appendChild(toggleButton_script);
            let title_script = document.createElement("span");
            title_script.innerHTML = "NewScript.ts";
            legend_script.append(title_script);
            fieldset_script.appendChild(legend_script);
            legend_script.classList.add("unfoldable");
            let container_script = document.createElement("div");
            container_script.classList.add("fieldset_content");
            let label_script = document.createElement("label");
            label_script.classList.add("fieldset_label");
            label_script.innerHTML = "Script";
            let script_input = document.createElement("input");
            script_input.classList.add("fieldset_input");
            container_script.append(label_script);
            container_script.append(script_input);
            fieldset_script.append(container_script);
            fieldset_container.append(fieldset_script);
        });
        add_content.append(item_script);
        let item_material = document.createElement("a");
        item_material.innerHTML = "Add Material Component";
        add_content.append(item_material);
        let add_button = document.createElement("button");
        add_button.classList.add("addnodebutton");
        add_button.id = "add_button";
        add_button.innerHTML = 'Add Component<i class = "fa fa-caret-down"></i>';
        add_button.addEventListener("click", function () {
            add_content.classList.toggle("show");
        });
        //please work
        dropdown_add.append(add_button);
        dropdown_add.append(add_content);
        window.addEventListener("click", function (_event) {
            let target = _event.target;
            if (target.id != "add_button") {
                add_content.classList.remove("show");
            }
        });
        myLayout.on('select-button', function () {
            fieldset_container.append(fieldset_transform);
            fieldset_container.append(fieldset_mesh);
            fieldset_container.append(fieldset_material);
            container.getElement().append(fieldset_container);
            container.getElement().append(dropdown_add);
        });
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
        item_Cube.innerHTML = "Add Box";
        item_Cube.addEventListener("click", createbuttonpressed);
        add_content.append(item_Cube);
        let item_sphere = document.createElement("a");
        item_sphere.innerHTML = "Add Sphere";
        add_content.append(item_sphere);
        let item_pyramid = document.createElement("a");
        item_pyramid.innerHTML = "Add Pyramid";
        add_content.append(item_pyramid);
        let item_cylinder = document.createElement("a");
        item_cylinder.innerHTML = "Add Cylinder";
        add_content.append(item_cylinder);
        let item_Capsule = document.createElement("a");
        item_Capsule.innerHTML = "Add Capsule";
        add_content.append(item_Capsule);
        let item_plane = document.createElement("a");
        item_plane.innerHTML = "Add Plane";
        add_content.append(item_plane);
        let add_button = document.createElement("button");
        add_button.classList.add("addnodebutton");
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
        myLayout.on("create-button", function () {
            let hideButton = document.createElement("button");
            hideButton.classList.add("hide-button");
            hideButton.innerHTML = "<img src='eye.png'>";
            hideButton.addEventListener("click", hidebuttonpressed);
            hideButton.addEventListener("click", function () {
                hideButton.classList.toggle("hide-pressed");
                if (hideButton.classList.contains("hide-pressed")) {
                    hideButton.innerHTML = "<img src='eye_closed.png'>";
                }
                else {
                    hideButton.innerHTML = "<img src='eye.png'>";
                }
            });
            let label_cube = document.createElement("a");
            label_cube.innerHTML = "Box";
            container_explorer.append(hideButton);
            container_explorer.append(label_cube);
        });
        container.getElement().append(container_explorer);
    }
    function createRessourceComponent(container, state) {
        let container_ressource = document.createElement("div");
        container_ressource.classList.add("ressource_explorer");
        let folder_src = document.createElement("img");
        folder_src.src = "icons/folder.png";
        folder_src.classList.add("column1");
        let folder_models = document.createElement("img");
        folder_models.src = "icons/folder.png";
        folder_models.classList.add("column2");
        container_ressource.append(folder_src);
        container_ressource.append(folder_models);
        let label_src = document.createElement("div");
        label_src.innerHTML = "src";
        label_src.classList.add("column1");
        container_ressource.append(label_src);
        let label_models = document.createElement("div");
        label_models.innerHTML = "models";
        label_models.classList.add("column2");
        container_ressource.append(label_models);
        container.getElement().append(container_ressource);
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
    function addRessource(e) {
        let newItemConfig = {
            title: 'Ressource Manager',
            type: 'component',
            componentName: 'Ressource Manager',
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
        if (target.classList.contains("dropbutton")) {
            let dropchildren = target.parentElement.children;
            for (let dropchild of dropchildren) {
                console.log(dropchild);
                if (dropchild.classList.contains("dropdown-content")) {
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
//# sourceMappingURL=editor.js.map