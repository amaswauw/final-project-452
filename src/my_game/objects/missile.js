"use strict";

import Projectile from "../../engine/game_objects/projectile.js";

class Missile extends Projectile    {
    constructor(renderable, lifetime, trailTexture, trailLifetime, trailInterval) {
        super(renderable, lifetime, trailTexture, trailLifetime, trailInterval);
    }

    update()    {
        super.update();
    }
}

export default Missile;