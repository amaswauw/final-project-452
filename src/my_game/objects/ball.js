"use strict";

import engine from "../../engine/index.js";
import Projectile from "../../engine/game_objects/projectile.js";
import Box from "./box.js";

class Ball extends Projectile    {
    constructor(renderable, lifetime, trailTexture, trailLifetime, trailInterval) {
        super(renderable, lifetime, trailTexture, trailLifetime, trailInterval);
        this.strength = 0.1;
        this.kDelta = 0.1;
        this.direction = 60;
        this.setReflectingPrototypes([Box])
        this.spacePressed = false;
    }

    update()    {
        super.update();
        if (engine.input.isKeyPressed(engine.input.keys.Space) && !this.spacePressed) {
            this.strength += this.kDelta;
        }
        if (engine.input.isKeyReleased(engine.input.keys.Space) && !this.spacePressed)  {
            super.setParabola(this.direction, this.strength, [0, -1], (9.8/600) * this.strength);
            this.spacePressed = true;
        }
        if (engine.input.isKeyClicked(engine.input.keys.R)) {
            this.getXform().setPosition(20, 75);
            this.mSpeed = 0;
            this.acceleration = 0;
            this.accDirection = [0, 0];
        }
        // console.log(this.getXform().getPosition())
    }
}

export default Ball;