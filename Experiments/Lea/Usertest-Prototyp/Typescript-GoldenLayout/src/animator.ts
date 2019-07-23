namespace GoldenLayoutTest {
    let myLayout: GoldenLayout;
    function create(){
        let menubar:HTMLElement = document.createElement("div");
        menubar.classList.add("navbar");
    
        let dropdown_file:HTMLElement = document.createElement("div");
        dropdown_file.classList.add ("dropdown");
    
        let file_content:HTMLElement = document.createElement("div");
        file_content.id = "File_Dropdown";
        file_content.classList.add("dropdown-content");
        let item_new:HTMLElement = document.createElement("a");
        item_new.innerHTML = "New File...";
        file_content.append(item_new);
        let item_open:HTMLElement = document.createElement("a");
        item_open.innerHTML = "Open File...";
        file_content.append(item_open);
        let item_Save:HTMLElement = document.createElement("a");
        item_Save.innerHTML = "Save";
        file_content.append(item_Save);
        let item_SaveAs:HTMLElement = document.createElement("a");
        item_SaveAs.innerHTML = "Save as...";
        file_content.append(item_SaveAs);
        let item_Import:HTMLElement = document.createElement("a");
        item_Import.innerHTML = "Import...";
        file_content.append(item_Import);
        let item_Export:HTMLElement = document.createElement("a");
        item_Export.innerHTML = "Save";
        file_content.append(item_Export);


        let file_button:HTMLButtonElement = document.createElement("button");
        file_button.classList.add("dropbutton");
        file_button.innerHTML = 'File<i class = "fa fa-caret-down"></i>';
    
        let dropdown_edit:HTMLElement = document.createElement("div");
        dropdown_edit.classList.add ("dropdown");

        let edit_content:HTMLElement = document.createElement("div");
        edit_content.id = "Edit_Dropdown";
        edit_content.classList.add("dropdown-content");
        let item_undo:HTMLElement = document.createElement("a");
        item_undo.innerHTML = "Undo";
        edit_content.append(item_undo);
        let item_redo:HTMLElement = document.createElement("a");
        item_redo.innerHTML = "Redo";
        edit_content.append(item_redo);
        let item_Copy:HTMLElement = document.createElement("a");
        item_Copy.innerHTML = "Copy";
        edit_content.append(item_Copy);
        let item_Paste:HTMLElement = document.createElement("a");
        item_Paste.innerHTML = "Paste";
        edit_content.append(item_Paste);
        let item_selectAll:HTMLElement = document.createElement("a");
        item_selectAll.innerHTML = "Select All";
        edit_content.append(item_selectAll);
        let item_deselectAll:HTMLElement = document.createElement("a");
        item_deselectAll.innerHTML = "Deselect All";
        edit_content.append(item_deselectAll);

        let edit_button:HTMLButtonElement = document.createElement("button");
        edit_button.classList.add("dropbutton");
        edit_button.innerHTML = 'Edit<i class = "fa fa-caret-down"></i>';
        edit_button.addEventListener("click", function(){
            edit_content.classList.toggle("show");
        })

        let dropdown_window:HTMLElement = document.createElement("div");
        dropdown_window.classList.add ("dropdown");

        let window_content:HTMLElement = document.createElement("div");
        window_content.id = "window_Dropdown";
        window_content.classList.add("dropdown-content");
        let item_materialEditor:HTMLElement = document.createElement("a");
        item_materialEditor.innerHTML = "Material Editor";
        window_content.append(item_materialEditor);
        let item_sketchEditor:HTMLElement = document.createElement("a");
        item_sketchEditor.innerHTML = "Sketch Editor";
        item_sketchEditor.addEventListener("click", sketchbutton);
        window_content.append(item_sketchEditor);
        let item_animator:HTMLElement = document.createElement("a");
        item_animator.innerHTML = "Scene Editor";
        item_animator.addEventListener("click", scenebutton);
        window_content.append(item_animator);
        let item_3D:HTMLElement = document.createElement("a");
        item_3D.innerHTML = "3D Model Editor";
        window_content.append(item_3D);
        let item_resetLayout:HTMLElement = document.createElement("a");
        item_resetLayout.innerHTML = "Reset Layout";
        window_content.append(item_resetLayout);

        let window_button:HTMLButtonElement = document.createElement("button");
        window_button.classList.add("dropbutton");
        window_button.innerHTML = 'Window<i class = "fa fa-caret-down"></i>';
        window_button.addEventListener("click", function(){
            window_content.classList.toggle("show");
        })

        let dropdown_editor:HTMLElement = document.createElement("div");
        dropdown_editor.classList.add ("dropdown");

        let editor_content:HTMLElement = document.createElement("div");
        editor_content.id = "add_Dropdown";
        editor_content.classList.add("dropdown-content");
        let item_tools:HTMLElement = document.createElement("a");
        item_tools.innerHTML = "Dopesheet";
        item_tools.addEventListener("click", addDopesheet);
        editor_content.append(item_tools);
        let item_viewport:HTMLElement = document.createElement("a");
        item_viewport.innerHTML = "Curveview";
        item_viewport.addEventListener("click", addCurveview);
        editor_content.append(item_viewport);
        let item_inspector:HTMLElement = document.createElement("a");
        item_inspector.innerHTML = "Inspector";
        item_inspector.addEventListener("click", addInspector);
        editor_content.append(item_inspector);
        let item_scene:HTMLElement = document.createElement("a");


        let editor_button:HTMLButtonElement = document.createElement("button");
        editor_button.classList.add("dropbutton");
        editor_button.innerHTML = 'Editor<i class = "fa fa-caret-down"></i>';
        editor_button.addEventListener("click", function(){
            editor_content.classList.toggle("show");
        })

        let dropdown_tools:HTMLElement = document.createElement("div");
        dropdown_tools.classList.add ("dropdown");

        let tools_content:HTMLElement = document.createElement("div");
        tools_content.id = "tools_Dropdown";
        tools_content.classList.add("dropdown-content");
        let item_play:HTMLElement = document.createElement("a");
        item_play.innerHTML = "Play/Stop Animation";
        tools_content.append(item_play);
        let item_pause:HTMLElement = document.createElement("a");
        item_pause.innerHTML = "Pause Animation";
        tools_content.append(item_pause);
        let item_slowdown:HTMLElement = document.createElement("a");
        item_slowdown.innerHTML = "Slow Down Playback";
        tools_content.append(item_slowdown);
        let item_speedup:HTMLElement = document.createElement("a");
        item_speedup.innerHTML = "Speed Up Playback";
        tools_content.append(item_speedup);
        let item_skipback:HTMLElement = document.createElement("a");
        item_skipback.innerHTML = "Skip to previous Keyframe";
        tools_content.append(item_skipback);
        let item_skipforw:HTMLElement = document.createElement("a");
        item_skipforw.innerHTML = "Skip to next Keyframe";
        tools_content.append(item_skipforw);
        let item_label:HTMLElement = document.createElement("a");
        item_label.innerHTML = "Add Label";
        tools_content.append(item_label);
        let item_event:HTMLElement = document.createElement("a");
        item_event.innerHTML = "Add Event";
        tools_content.append(item_event);
        let item_keyframe:HTMLElement = document.createElement("a");
        item_keyframe.innerHTML = "Add Keyframe";
        tools_content.append(item_keyframe);

        let tools_button:HTMLButtonElement = document.createElement("button");
        tools_button.classList.add("dropbutton");
        tools_button.innerHTML = 'Tools<i class = "fa fa-caret-down"></i>';
        tools_button.addEventListener("click", function(){
            tools_content.classList.toggle("show");
        })


        let dropdown_help:HTMLElement = document.createElement("div");
        dropdown_help.classList.add ("dropdown");

        let help_content:HTMLElement = document.createElement("div");
        help_content.id = "help_Dropdown";
        help_content.classList.add("dropdown-content");
        let item_tutorial:HTMLElement = document.createElement("a");
        item_tutorial.innerHTML = "Tutorial";
        help_content.append(item_tutorial);
        let item_about:HTMLElement = document.createElement("a");
        item_about.innerHTML = "About";
        help_content.append(item_about);

        let help_button:HTMLButtonElement = document.createElement("button");
        help_button.classList.add("dropbutton");
        help_button.innerHTML = 'Help<i class = "fa fa-caret-down"></i>';
        help_button.addEventListener("click", function(){
            help_content.classList.toggle("show");
        })

        
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

        let root:HTMLElement = document.getElementById("menu");
        
        root.append(menubar);
    }
    
    create();

    let savedState: string;
    let stage:number = 0;
    // let file:HTML = "test.html"
    let config: GoldenLayout.Config = {
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
                }]
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
    myLayout.init();

    function stateupdate() {
        let state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('animatorstate', state);
    }


    function createDopesheetComponent(container:any, state:any)
    {
        let image:HTMLImageElement = document.createElement("img");
        image.classList.add("fakeTimeline");
        image.src = "AnimationEditor.png";
        container.getElement().append(image);
    }
    function createCurveviewComponent(container: any, state: any) {
        let image:HTMLImageElement = document.createElement("img");
        image.classList.add("fakeTimeline");
        image.src = "AnimationEditor.png";
        container.getElement().append(image);
    }

    function createInspectorComponent(container:any, state:any)
    {        
        // let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
        // let legend: HTMLLegendElement = document.createElement("legend");
        // legend.innerHTML = "Transform";
        // let toggleButton: HTMLButtonElement = document.createElement("button");
        // toggleButton.addEventListener("click", toggleFoldElement);
        // toggleButton.innerHTML = "v";
        // legend.appendChild(toggleButton);
        // fieldset.appendChild(legend);
        // legend.classList.add("unfoldable");
        let label_name:HTMLDivElement = document.createElement("div");
        label_name.classList.add("text");
        label_name.innerHTML = "Name";
        let input_name:HTMLInputElement = document.createElement("input");
        label_name.append(input_name);
        container.getElement().append(label_name);
        let label_sps:HTMLDivElement = document.createElement("div");
        label_sps.classList.add("text");
        label_sps.innerHTML = "SPS";
        let input_sps:HTMLInputElement = document.createElement("input");
        label_sps.append(input_sps);
        container.getElement().append(label_sps);
        let label_fps:HTMLDivElement = document.createElement("div");
        label_fps.classList.add("text");
        label_fps.innerHTML = "FPS";
        let input_fps:HTMLInputElement = document.createElement("input");
        label_fps.append(input_fps);
        container.getElement().append(label_fps);

        let label_play:HTMLDivElement = document.createElement("div");
        label_play.classList.add("text");
        label_play.innerHTML = "Play Mode";
        let play_select:HTMLSelectElement = document.createElement("select");
        let option_standard:HTMLOptionElement = document.createElement("option");
        option_standard.value = "standard";
        option_standard.text = "Start -> Finish";
        let option_loop:HTMLOptionElement = document.createElement("option");
        option_loop.value = "loop";
        option_loop.text = "Loop";
        play_select.options.add(option_standard);
        play_select.options.add(option_loop);
        label_play.appendChild(play_select);
        container.getElement().append(label_play);

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
        let toolbar_image:HTMLImageElement = document.createElement("img");
        toolbar_image.src = "animation_toolbar.png";
        toolbar_image.classList.add("fake-buttons");
        container.getElement().append(toolbar_image);

 
        let inv_button: HTMLSpanElement = document.createElement("button");
        inv_button.id = "Invisibutton";
        container.getElement().append(inv_button);
        let label_button: HTMLSpanElement = document.createElement("button");
        label_button.innerHTML = '<img src = "icons/label.png">';
        label_button.classList.add("contrButton");
        label_button.classList.add("tooltip");
        let label_tooltip:HTMLSpanElement = document.createElement("span");
        label_tooltip.classList.add("tooltiptext");
        label_tooltip.innerHTML = "Add Label"
        label_button.append(label_tooltip);
        // button.addEventListener("click", buttonpressed);
        container.getElement().append(label_button);

        let event_button: HTMLSpanElement = document.createElement("button");
        event_button.innerHTML = '<img src = "icons/event.png">';
        event_button.classList.add("contrButton");
        event_button.classList.add("tooltip");
        let event_tooltip:HTMLSpanElement = document.createElement("span");
        event_tooltip.classList.add("tooltiptext");
        event_tooltip.innerHTML = "Add Event"
        event_button.append(event_tooltip);
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(event_button);

        let keyframe_button: HTMLSpanElement = document.createElement("button");
        keyframe_button.innerHTML = '<img src = "icons/Keyframe.png">';
        keyframe_button.classList.add("contrButton");
        keyframe_button.classList.add("tooltip");
        let keyframe_tooltip:HTMLSpanElement = document.createElement("span");
        keyframe_tooltip.classList.add("tooltiptext");
        keyframe_tooltip.innerHTML = "Add Keyframe"
        keyframe_button.append(keyframe_tooltip);
        //button.addEventListener("click", buttonpressed);
        container.getElement().append(keyframe_button);

        let container_position:HTMLElement = document.createElement("div");
        container_position.classList.add("fieldset_content");
        let label_position:HTMLDivElement = document.createElement("div");
        label_position.innerHTML = "Position";
        let position_label_x:HTMLDivElement = document.createElement("div");
        position_label_x.innerHTML = "X";
        let position_input_x:HTMLInputElement = document.createElement("input");
        container_position.append(label_position);
        container_position.append(position_label_x);
        position_label_x.append(position_input_x);
        let position_label_y:HTMLDivElement = document.createElement("div");
        position_label_y.innerHTML = "Y";
        let position_input_y:HTMLInputElement = document.createElement("input");
        container_position.append(position_label_y);
        position_label_y.append(position_input_y);
        let position_label_z:HTMLDivElement = document.createElement("div");
        position_label_z.innerHTML = "Z";
        let position_input_z:HTMLInputElement = document.createElement("input");
        container_position.append(position_label_z);
        position_label_z.append(position_input_z);

        let container_rotation:HTMLElement = document.createElement("div");
        container_rotation.classList.add("fieldset_content");
        let label_rotation:HTMLDivElement = document.createElement("div");
        label_rotation.innerHTML = "Rotation";
        let rotation_label_x:HTMLDivElement = document.createElement("div");
        rotation_label_x.innerHTML = "X";
        let rotation_input_x:HTMLInputElement = document.createElement("input");
        container_rotation.append(label_rotation);
        label_rotation.append(rotation_label_x);
        rotation_label_x.append(rotation_input_x);
        let rotation_label_y:HTMLDivElement = document.createElement("div");
        rotation_label_y.innerHTML = "Y";
        let rotation_input_y:HTMLInputElement = document.createElement("input");
        container_rotation.append(rotation_label_y);
        rotation_label_y.append(rotation_input_y);
        let rotation_label_z:HTMLDivElement = document.createElement("div");
        rotation_label_z.innerHTML = "Z";
        let rotation_input_z:HTMLInputElement = document.createElement("input");
        container_rotation.append(rotation_label_z);
        rotation_label_z.append(rotation_input_z);

        let container_scale:HTMLElement = document.createElement("div");
        container_scale.classList.add("fieldset_content");
        let label_scale:HTMLDivElement = document.createElement("div");
        label_scale.innerHTML = "Scale";
        let scale_label_x:HTMLDivElement = document.createElement("div");
        scale_label_x.innerHTML = "X";
        let scale_input_x:HTMLInputElement = document.createElement("input");
        container_scale.append(label_scale);
        container_scale.append(scale_label_x);
        scale_label_x.append(scale_input_x);
        let scale_label_y:HTMLDivElement = document.createElement("div");
        scale_label_y.innerHTML = "Y";
        let scale_input_y:HTMLInputElement = document.createElement("input");
        container_scale.append(scale_label_y);
        scale_label_y.append(scale_input_y);
        let scale_label_z:HTMLDivElement = document.createElement("div");
        scale_label_z.innerHTML = "Z";
        let scale_input_z:HTMLInputElement = document.createElement("input");
        container_scale.append(scale_label_z);
        scale_label_z.append(scale_input_z);

        let container_pivot:HTMLElement = document.createElement("div");
        container_pivot.classList.add("fieldset_content");
        let label_pivot:HTMLDivElement = document.createElement("div");
        label_pivot.innerHTML = "Pivot Point";
        let pivot_label_x:HTMLDivElement = document.createElement("div");
        pivot_label_x.innerHTML = "X";
        let pivot_input_x:HTMLInputElement = document.createElement("input");
        container_pivot.append(label_pivot);
        container_pivot.append(pivot_label_x);
        pivot_label_x.append(pivot_input_x);
        let pivot_label_y:HTMLDivElement = document.createElement("div");
        pivot_label_y.innerHTML = "Y";
        let pivot_input_y:HTMLInputElement = document.createElement("input");
        container_pivot.append(pivot_label_y);
        pivot_label_y.append(pivot_input_y);
        let pivot_label_z:HTMLDivElement = document.createElement("div");
        pivot_label_z.innerHTML = "Z";
        let pivot_input_z:HTMLInputElement = document.createElement("input");
        container_pivot.append(pivot_label_z);
        pivot_label_z.append(pivot_input_z);

        container.getElement().append(container_position);
        container.getElement().append(container_rotation);
        container.getElement().append(container_scale);
        container.getElement().append(container_pivot);
    }

    function createPersistentComponent(container: any, state: any) {
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
        return container
    }
    function scenebutton(){
        window.location.href = "editor.html";     
    }
    function sketchbutton(){
        window.location.href = "sketch.html";     
    }
    function addDopesheet(e:MouseEvent)
    {
        let newItemConfig = {
            title: 'Dopesheet',
            type: 'component',
            componentName: 'Dopesheet',
            componentState: { label: 'A' }
        };

        myLayout.root.contentItems[ 0 ].addChild( newItemConfig );
    }
    function addCurveview(e:MouseEvent)
    {
        let newItemConfig = {
            title: 'Curveview',
            type: 'component',
            componentName: 'Curveview',
            componentState: { label: 'A' }
        };

        myLayout.root.contentItems[ 0 ].addChild( newItemConfig );
    }
    function addInspector(e:MouseEvent)
    {
        let newItemConfig = {
            title: 'Inspector',
            type: 'component',
            componentName: 'Inspector',
            componentState: { label: 'A' }
        };

        myLayout.root.contentItems[ 0 ].addChild( newItemConfig );
    }
    function closeMenues(e:MouseEvent){
        let menu:HTMLElement = <HTMLElement>document.getElementById("menu").firstChild;
        let children:HTMLCollection = menu.children
        
        for(let child of children)
        {
            let innerChildren:HTMLCollection = child.children;
            for(let innerChild of innerChildren)
            {
                if(innerChild.classList.contains("show"))
                {
                    innerChild.classList.remove("show");
                }
            }
        }
        let target:HTMLElement = <HTMLElement>e.target;
        console.log(target);
        if(target.classList.contains("dropbutton"))
        {
            let dropchildren:HTMLCollection = target.parentElement.children;
            for(let dropchild of dropchildren)
            {
                console.log(dropchild)
                if(dropchild.classList.contains("dropdown-content"))
                {
                    console.log("found you");
                    dropchild.classList.add("show");
                }
            }
        }
    }

    function toggleFoldElement(_event:MouseEvent)
    {
        _event.preventDefault();
        if (_event.target != _event.currentTarget) return;
        let target: HTMLElement = <HTMLElement>_event.target;
        let foldTarget = target.parentElement.parentElement;
        let foldToggle: Boolean;
        //Toggle the folding behaviour of the Folding Target
        foldTarget.classList.contains("fieldset_folded") ? foldToggle = false : foldToggle = true;
        foldToggle == true ? foldTarget.classList.add("fieldset_folded") : foldTarget.classList.remove("fieldset_folded");
        foldToggle == true ? target.innerHTML = ">" : target.innerHTML = "v";
        let children: HTMLCollection = foldTarget.children;

        // for (let i = 0; i < children.length; i++) {
        for (let child of children) {
            // let child: HTMLElement = <HTMLElement>children[i];
            if (!child.classList.contains("unfoldable")) {
                foldToggle == true ? child.classList.add("folded") : child.classList.remove("folded");
            }
        }
    }

    window.addEventListener("click", closeMenues);
}