"use strict";

import GameObject from "./game_object.js";
import TrailRenderable from "../renderables/trail_renderable.js"
import TextureRenderable from "../renderables/texture_renderable_main.js";

class Projectile extends GameObject {
  constructor(renderable, _lifetime, _trailTexture = null, _trailLifetime = 0) {
    super(new TextureRenderable(renderable));
    this.lifetime = _lifetime;
    this.currentTime = performance.now();
    this.trailLifetime = this.trailLifetime;
    this.trailTexture = _trailTexture;
    this.acceleration = 0;
  }

  // Projectile Trail
  setTrail(trailRenderable) {
    this.trailRenderable = trailRenderable;
  }

  spawnTrail() {
    if (this.trailTexture) {
      console.log("Test");
    }
  } // Spawns trail behind main Renderable.

  // Projectile Acceleration Function
  setAcceleration(acc) {
    this.acceleration = acc;
  }

  // Lifetime
  setLifetime(lifetime) {
    this.lifetime = lifetime;
  }

  // Bounce
  bounce(gameObjectTypes = []) {}

  // Path types
  setStraight(target = null, speed = 0, acceleration = 0) {
    // sets tracking input
  }

  setTracking(target, rotation = 2 * Math.PI, speed = 0, acceleration = 0) {
    // sets path type to be 
  }
  setParabola(target = null, maxPrependicularAmplitude = 0, speed = 0, acceleration = 0) {} // sets path type to be parabolic
  setParabola(direction = null, speed = 0, forceDirection, forceMagnitude) {}

  // Behavior effects
  onSpawn() {} // Called from update() on first update call
  onTermination() {} // Called from update() on last update call
  inFlight() {} // Called from update() every call except for last and first

  update() {
    
  }    // accelerate this.mSpeed
  // calls spawnTrail()
  // checks collisions -> calls bounce(), onTermination()
  // onSpawn() inFlight(), onTermination() if conditions are met
}
export default Projectile;