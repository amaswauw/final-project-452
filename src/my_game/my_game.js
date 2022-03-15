"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../engine/index.js";

// user stuff
import Hero from "./objects/hero.js";
import Missile from "./objects/missile.js";
import Enemy from "./objects/enemy.js";
import FontRenderable from "../engine/renderables/font_renderable.js";
// import { vec2 } from "../lib/gl-matrix.js";
// import { vec2 } from "../lib/gl-matrix.js";

class MyGame extends engine.Scene {
    constructor() {
        super();

        // Assets
        this.kHeroShip = "assets/heroShip.png";
        this.kT = "assets/bullet_trail.png";
        this.kBg = "assets/bg.png";
        this.kRedMissile = "assets/goodMissile.png";
        this.kEnemyShip = "assets/enemyShip.png";
        this.kExplosion = "assets/explosion.png";
        this.kEnemyMissile = "assets/badMissile.png";

        // The camera to view the scene
        this.mCamera = null;
        this.mBg = null;

        // the hero and the support objects
        this.mHero = null;
        this.mText = null;
        this.mEnemySet = [];

        // Projectiles
        this.mHeroMissileSet = [];
        this.mEnemyMissileSet = [];

        // timer for autoSpawn
        this.autospawnTimer = null;
        this.timeInterval = 2000;
        this.timer = null;

        // timers for enemy missiles
        this.missileInterval = 3000;

        // Points
        this.points = 0;

    }

    load() {
        engine.texture.load(this.kT); // loading a trail for a projectile
        engine.texture.load(this.kHeroShip);
        engine.texture.load(this.kBg);
        engine.texture.load(this.kEnemyShip);
        engine.texture.load(this.kRedMissile);
        engine.texture.load(this.kExplosion);
        engine.texture.load(this.kEnemyMissile)
    }

    unload() {
        engine.texture.unload(this.kEnemyShip);
        engine.texture.unload(this.kT);
        engine.texture.unload(this.kHeroShip);
        engine.texture.unload(this.kBg);
        engine.texture.unload(this.kRedMissile);
        engine.texture.unload(this.kExplosion);
        engine.texture.unload(this.kEnemyMissile);
    }

    init() {
       
        // Step A: set up the cameras
        this.mCamera = new engine.Camera(
            vec2.fromValues(100, 75), // position of the camera
            200,                       // width of camera
            [0, 0, 1280, 960]           // viewport (orgX, orgY, width, height)
        );
        this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        // sets the background to gray

        // Large background image
        let bgR = new engine.SpriteRenderable(this.kBg);
        bgR.setElementPixelPositions(0, 1024, 0, 1024);
        bgR.getXform().setSize(275, 275);
        bgR.getXform().setPosition(100, 135);
        this.mBg = new engine.GameObject(bgR);

        // Objects in the scene
        this.mHero = new Hero(this.kHeroShip);
        this.mEnemy = new Enemy(this.kEnemyShip, this.mCamera);
        this.mEnemySet.push(this.mEnemy);

        this.mText = new FontRenderable("Score: " + this.points);
        this.mText.getXform().setPosition(10, 10);
        this.mText.setTextHeight(10);

        // Initialize AutoSpawner
        this.autospawnTimer = performance.now();
    }

    _drawCamera(camera) {
        camera.setViewAndCameraMatrix();
        this.mBg.draw(camera);
        
        // Draw Hero Missiles
        for (let i = 0; i < this.mHeroMissileSet.length; i++)   {
            this.mHeroMissileSet[i].draw(camera);
        }

        for (let missile of this.mEnemyMissileSet)  {
            missile.draw(camera);
        }

        // draw Objects
        this.mHero.draw(camera);
        for (let enemy of this.mEnemySet) {
            enemy.draw(camera);
        }
    }

    // This is the draw function, make sure to setup proper drawing environment, and more
    // importantly, make sure to _NOT_ change any state.
    draw() {
        // Step A: clear the canvas
        engine.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

        // Step  B: Draw with all three cameras
        this._drawCamera(this.mCamera);
        
    }

    // The update function, updates the application state. Make sure to _NOT_ draw
    // anything from this function!
    update() {
        // update objects
        this.mHero.update();    
        this.mEnemy.update();

        // helper update functions
        this.checkObjectLifespan();
        this.updateMissiles();
        this.spawnHeroMissiles(); 
        this.spawnEnemyMissiles();
        this.checkEnemyHit();   
        this.autoSpawnEnemy()
    }

    checkObjectLifespan() {
        // loop through to check
        for (let i = 0; i < this.mHeroMissileSet.length; i++)   {
            if (!this.mHeroMissileSet[i].mValid)    {
                this.mHeroMissileSet.splice(i, 1);
            }
        }
        for (let i = 0; i < this.mEnemySet.length; i++) {
            if (!this.mEnemySet[i].mValid)  {
                this.mEnemySet.splice(i, 1)
            }
        }
    }

    updateMissiles()    {
        for (let i = 0; i < this.mHeroMissileSet.length; i++)   {
            this.mHeroMissileSet[i].update();
        }
        for (let i = 0; i < this.mEnemyMissileSet.length; i++)  {
            this.mEnemyMissileSet[i].update();
        }
    }

    spawnHeroMissiles() {
        if (engine.input.isKeyClicked(engine.input.keys.Space)) {
            // get xform from Hero and calculate missile spawn position
            let xform = this.mHero.getXform();
            
            // create Missile
            let missile = new Missile(this.kRedMissile, 3000, this.kT, Infinity, 10);
            missile.getXform().setSize(6, 3);
            missile.getXform().setPosition(xform.getXPos(), xform.getYPos());
            missile.setStraight(null, null, xform.getRotationInRad() , 0.6, 0.005);

            // Push missile into missile set 
            this.mHeroMissileSet.push(missile);
        }
    }

    spawnEnemyMissiles()    {
        for (let i = 0; i < this.mEnemySet.length; i++) {
            if (!this.mEnemySet[i].poo) {
                let xform = this.mEnemySet[i].getXform();
                
                // create Missile
                let missile = new Missile(this.kEnemyMissile, 3000, this.kT, Infinity, 10);
                missile.getXform().setSize(5, 4);
                missile.getXform().setPosition(xform.getXPos(), xform.getYPos());
                missile.setStraight(this.mHero, null, null, 0.5, 0);

                // Push missile into missile set 
                this.mEnemyMissileSet.push(missile);
                this.mEnemySet[i].poo = true;
            }
        }
    }

    checkEnemyHit() {
        let hitPos = [];

        for (let i = 0; i < this.mHeroMissileSet.length; i++)   {
            for (let j = 0; j < this.mEnemySet.length; j++) {
                if (this.mHeroMissileSet[i].pixelTouches(this.mEnemySet[j], hitPos))  {
                    this.mEnemySet[j].mValid = false;
                    this.points++;
                    console.log(this.points);
                }
            }
        }
    }

    autoSpawnEnemy()    {
        this.timeInterval += 2000;
        setTimeout(() => {
            let enemy = new Enemy(this.kEnemyShip, this.mCamera);
            this.mEnemySet.push(enemy);
        }, this.timeInterval);
    }
}

window.onload = function () {
    engine.init("GLCanvas");

    let myGame = new MyGame();
    myGame.start();
}
