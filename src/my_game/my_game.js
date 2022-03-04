"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../engine/index.js";

// user stuff
import Brain from "./objects/brain.js";
import Hero from "./objects/hero.js";
import Minion from "./objects/minion.js";
import TextureObject from "./objects/texture_object.js";
import Projectile from "../engine/game_objects/projectile.js"
import TrailRenderable from "../engine/renderables/trail_renderable.js";
import TextureRenderable from "../engine/renderables/texture_renderable_main.js";
// import { vec2 } from "../lib/gl-matrix.js";
// import { vec2 } from "../lib/gl-matrix.js";

class MyGame extends engine.Scene {
    constructor() {
        super();
        this.kMinionSprite = "assets/minion_sprite.png";
        this.kMinionPortal = "assets/minion_portal.png";
        this.kBeam = "assets/Terra_Blade_Beam.png";
        this.kBeam2 = "assets/second_beam.png";
        this.kT = "assets/projectile-png-7.png";
        this.kBg = "assets/bg.png";

        // The camera to view the scene
        this.mCamera = null;
        this.mBg = null;
        // the hero and the support objects
        this.mHero = null;
        this.mPortal = null;

        // Projectiles
        this.mProjectileSet = [];
        this.mProjectile = null;
        this.mProjectileT = null;
    }

    load() {
        engine.texture.load(this.kBeam); // loading texture of a projectile
        engine.texture.load(this.kT); // loading a trail for a projectile
        engine.texture.load(this.kBeam2);
        engine.texture.load(this.kMinionSprite);
        engine.texture.load(this.kMinionPortal);
        engine.texture.load(this.kBg);
    }

    unload() {
        engine.texture.unload(this.kBeam);
        engine.texture.load(this.kBeam2);
        engine.texture.unload(this.kT);
        engine.texture.unload(this.kMinionSprite);
        engine.texture.unload(this.kMinionPortal);
        engine.texture.unload(this.kBg);
    }

    init() {
       
        // Step A: set up the cameras
        this.mCamera = new engine.Camera(
            vec2.fromValues(50, 36), // position of the camera
            100,                       // width of camera
            [0, 0, 640, 480]           // viewport (orgX, orgY, width, height)
        );
        this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        // sets the background to gray

        // Large background image
        let bgR = new engine.SpriteRenderable(this.kBg);
        bgR.setElementPixelPositions(0, 1024, 0, 1024);
        bgR.getXform().setSize(150, 150);
        bgR.getXform().setPosition(50, 35);
        this.mBg = new engine.GameObject(bgR);

        // Objects in the scene
        this.mHero = new Hero(this.kMinionSprite);
        this.mPortal = new TextureObject(this.kMinionPortal, 50, 30, 10, 10);

        this.mProjectileT = new Projectile(this.kBeam2, Infinity, this.kT, 500, 10);
        this.mProjectileT.getXform().setSize(10, 8);
        this.mProjectileT.getXform().setPosition(10, 10);
       // this.mProjectileT.setTracking(vec2.fromValues(0, 0), null, null, 0.1, 0)
       this.mProjectileT.setTracking(this.mPortal, Math.PI/2, 0.01, 0)
    }

    _drawCamera(camera) {
        camera.setViewAndCameraMatrix();
        this.mBg.draw(camera);
        this.mHero.draw(camera);
        this.mPortal.draw(camera);
    }

    // This is the draw function, make sure to setup proper drawing environment, and more
    // importantly, make sure to _NOT_ change any state.
    draw() {
        // Step A: clear the canvas
        engine.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

        // Step  B: Draw with all three cameras
        this._drawCamera(this.mCamera);

        // draw all projectiles
        for (let i = 0; i < this.mProjectileSet.length; i++)    {
            if (this.mProjectileSet[i].mValid) {
                this.mProjectileSet[i].draw(this.mCamera);
            }
        }

        this.mProjectileT.draw(this.mCamera);
    }

    checkObjectLifespan() {
        // loop through to check
        for (let i = 0; i < this.mProjectileSet.length; i++) {
            if (!this.mProjectileSet[i].mValid) {
                this.mProjectileSet.splice(i, 1);
            }
        }
    }

    // The update function, updates the application state. Make sure to _NOT_ draw
    // anything from this function!
    update() {
        this.mCamera.update();  // for smoother camera movements
        
        // Spawn projectile at hero position
        if (engine.input.isKeyClicked(engine.input.keys.Space)) {
            this.mProjectile = new Projectile(this.kBeam, Infinity, this.kT, 500, 10);
            this.mProjectile.getXform().setSize(10, 8);
            this.mProjectile.getXform().setPosition(this.mHero.getXform().getXPos() + this.mHero.getXform().getWidth()/2, this.mHero.getXform().getYPos() + this.mHero.getXform().getHeight()/3.8);
            this.mProjectile.setStraight(null , null, Math.random() * Math.PI * 2, 0.3, 0.01)
            this.mProjectileSet.push(this.mProjectile);
        }
        
        for (let i = 0; i < this.mProjectileSet.length; i++)    {
            if (this.mProjectileSet[i].mValid) {
                this.mProjectileSet[i].update(this.mCamera);
            }
        }

        // TEST
        //
        this.mProjectileT.update();
        //
        // TEST

        this.mHero.update();
        
        
        // for WASD movement
        this.mPortal.update(     // for arrow movement
            engine.input.keys.Up,
            engine.input.keys.Down,
            engine.input.keys.Left,
            engine.input.keys.Right
        );
        // testing the mouse input
        if (engine.input.isButtonPressed(engine.input.eMouseButton.eLeft)) {
            if (this.mCamera.isMouseInViewport()) {
                this.mPortal.getXform().setXPos(this.mCamera.mouseWCX());
                this.mPortal.getXform().setYPos(this.mCamera.mouseWCY());
            }
        }
        if (engine.input.isButtonPressed(engine.input.eMouseButton.eMiddle)) {
            if (this.mHeroCam.isMouseInViewport()) {
                this.mHero.getXform().setXPos(this.mHeroCam.mouseWCX());
                this.mHero.getXform().setYPos(this.mHeroCam.mouseWCY());
            }
        }
        if (engine.input.isButtonClicked(engine.input.eMouseButton.eRight)) {
            this.mPortal.setVisibility(false);
        }

        if (engine.input.isButtonClicked(engine.input.eMouseButton.eMiddle)) {
            this.mPortal.setVisibility(true);
        }
        this.checkObjectLifespan();
    }
}

window.onload = function () {
    engine.init("GLCanvas");

    let myGame = new MyGame();
    myGame.start();
}
