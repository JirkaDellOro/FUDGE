///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>
var ParticleSystemTest;
///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>
(function (ParticleSystemTest) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    let root = new f.Node("Root");
    let particlesSystem1;
    let particlesSystem2;
    let viewport;
    let inputParticleNum1;
    let inputParticleNum2;
    let inputEffectName;
    let cmpParticleSystem1;
    let cmpParticleSystem2;
    async function hndLoad(_event) {
        f.Render.initialize(true, false);
        f.Render.setDepthTest(false);
        f.Render.setBlendMode(f.BLEND.PARTICLE);
        inputParticleNum1 = document.getElementById("particleNum1");
        inputParticleNum2 = document.getElementById("particleNum2");
        inputEffectName = document.getElementById("effectName");
        const canvas = document.querySelector("canvas");
        f.Debug.log("Canvas", canvas);
        f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.ERROR);
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        // setup viewport
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, new f.ComponentCamera(), canvas);
        f.Debug.log("Viewport", viewport);
        fAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        // setup particles
        let txtImage = new f.TextureImage("particle.png");
        let coat = new f.CoatTextured();
        coat.texture = txtImage;
        let material = new f.Material("Material", f.ShaderLitTextured, coat);
        // let material: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        let mesh = new f.MeshQuad();
        particlesSystem1 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(-1, 0, 0)), material, mesh);
        particlesSystem2 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(1, 0, 0)), material, mesh);
        particlesSystem1.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 0.2));
        particlesSystem1.getComponent(f.ComponentMesh).showToCamera = true;
        particlesSystem1.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(1, 0.5, 0.2);
        particlesSystem2.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 0.2));
        // particlesSystem2.getComponent(f.ComponentMesh).showToCamera = true;
        particlesSystem2.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(0.5, 1, 0.2);
        let particleEffect = new f.ParticleEffect();
        await particleEffect.load(inputEffectName.value);
        console.log(particleEffect);
        cmpParticleSystem1 = new f.ComponentParticleSystem(particleEffect, inputParticleNum1.valueAsNumber);
        cmpParticleSystem2 = new f.ComponentParticleSystem(particleEffect, inputParticleNum2.valueAsNumber);
        particlesSystem1.addComponent(cmpParticleSystem1);
        particlesSystem2.addComponent(cmpParticleSystem2);
        root.addChild(particlesSystem1);
        root.addChild(particlesSystem2);
        // setup input
        let changeSize = async (_event) => {
            if (cmpParticleSystem1.size != inputParticleNum1.valueAsNumber)
                cmpParticleSystem1.size = inputParticleNum1.valueAsNumber;
            if (cmpParticleSystem2.size != inputParticleNum2.valueAsNumber)
                cmpParticleSystem2.size = inputParticleNum2.valueAsNumber;
        };
        let changeEffect = async (_event) => {
            let newParticleEffect = new f.ParticleEffect();
            await newParticleEffect.load(inputEffectName.value);
            console.log(newParticleEffect);
            cmpParticleSystem1.particleEffect = newParticleEffect;
            cmpParticleSystem2.particleEffect = newParticleEffect;
        };
        inputParticleNum1.addEventListener("input", changeSize);
        inputParticleNum2.addEventListener("input", changeSize);
        inputEffectName.addEventListener("keydown", (_event) => {
            if (_event.key == "Enter")
                changeEffect(_event);
        });
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);
        function update(_event) {
            // console.log(particles.getComponent(f.ComponentTransform).local);
            viewport.draw();
        }
    }
})(ParticleSystemTest || (ParticleSystemTest = {}));
//# sourceMappingURL=ParticleSystemTest.js.map