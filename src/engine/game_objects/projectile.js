"use strict";

import GameObject from "./game_object.js";
import TrailRenderable from "../renderables/trail_renderable.js"
import TextureRenderable from "../renderables/texture_renderable_main.js";
import engine from "../../engine/index.js";
import * as input from "../input.js";

class Projectile extends engine.GameObject {
  constructor(renderable, _lifetime, _trailTexture = null, _trailLifetime = 0, _trailInterval = 1000) {
    super(new TextureRenderable(renderable));
    this.lifetime = _lifetime;
    this.creationTime = performance.now();
    this.acceleration = 0;
    this.mMaxRotation = 0;
    this.targetPoint = null;
    this.pathType = "";

    //  Variables For Trails
    this.trailInterval = _trailInterval;
    this.trailLifetime = _trailLifetime;
    this.trailRenderable = _trailTexture;
    this.trailSet = [];
    this.trailTimer = 0;
    this.mValid = true;
    this.trailSize = [];
  }

  // Projectile Trail
  setTrail(trailRenderable) {
    this.trailRenderable = trailRenderable;
  }

  // Spawns trail behind main renderable
  spawnTrail() {
    if (this.trailRenderable && this.mValid) {
      if (this.trailSet.length === 0) {
        this.trailSet.push(new TrailRenderable(this.trailRenderable, this.trailLifetime, this.getXform()), this.trailSize);
      } else if (this.trailTimer - this.trailSet[this.trailSet.length - 1].mCreateTime >= this.trailInterval) {
        this.trailSet.push(new TrailRenderable(this.trailRenderable, this.trailLifetime, this.getXform()), this.trailSize);
      }
      this.trailTimer = performance.now();
      //console.log(this.trailSet)
    }
  }

  setTrailSize(x, y)  {
    this.trailSize = [x, y]
  }

  // Projectile Acceleration Function
  setAcceleration(acc) {
    this.acceleration = acc;
  }

  // Lifetime
  setLifetime(lifetime) {
    this.lifetime = lifetime;
  }

  // Bounce
  bounce(gameObjectTypes = []) { }

  // Path types
  // supports straight at a target object
  // target point
  // target direction

  setStraight(target = null, targetPoint = null, targetDirection = null, speed = 0, acceleration = 0) {
    this.mSpeed = speed;
    this.acceleration = acceleration;
    this.pathType = "straight"
    //  if a game object target is given
    if (target instanceof GameObject) {
      let point = target.getXform().getPosition();

      point[0]+=(target.getXform().getWidth()/2);
      point[1]+=(target.getXform().getHeight()/2);
      this.setCurrentFrontDir(point);

      let rot = Math.atan2(point[1]  + this.getXform().getPosition()[1], point[0] + this.getXform().getPosition()[0]);
      this.getXform().setRotationInRad(rot);
    }
    //  if the target point is given
    else if (targetPoint != null) {
      this.setCurrentFrontDir(targetPoint);
      let rot = Math.atan2(targetPoint[1]  + this.getXform().getPosition()[1], targetPoint[0] + this.getXform().getPosition()[0]);
      this.getXform().setRotationInRad(rot);

    }
    // target direction is a radian
    else if (targetDirection != null) {
      let x = Math.cos(targetDirection)
      let y = Math.sin(targetDirection);
      this.setCurrentFrontDir(vec2.fromValues(x, y));

      //  Rotate the renderable

      this.getXform().setRotationInRad(targetDirection);

    }

  }
  // supports target object
  // supports target mouse
  setTracking(target, maxRotation = 2 * Math.PI, speed = 0, acceleration = 0) {
    
    this.mSpeed = speed;
    this.acceleration = acceleration;
    this.mMaxRotation = maxRotation;
    this.targetPoint = null;
    this.tracking = true;
    if (target instanceof GameObject) {
      this.pathType = "tracking"
      this.target = target;
      this.mCurrentFrontDir = vec2.fromValues(this.getXform().getXPos()+this.getXform().getWidth(), this.getXform().getYPos() + this.getXform().getHeight()/2)
    } else {
      this.pathType = "mouse tracking"
      console.log()
    }




  }
  setParabola(target = null, maxPrependicularAmplitude = 0, speed = 0, acceleration = 0) { } // sets path type to be parabolic
  setParabola(direction = null, speed = 0, forceDirection, forceMagnitude) { }

  // Behavior effects
  onSpawn() { } // Called from update() on first update call
  onTermination() { } // Called from update() on last update call
  inFlight() { } // Called from update() every call except for last and first

  draw(camera)  {
    if (this.mValid) {
      for (let i = 0; i < this.trailSet.length; i++)  {
        if (this.trailSet[i].mValid)  {
          this.trailSet[i].draw(camera);
        }
      }
      super.draw(camera);
    }
  }

  checkObjectLifespan() {
    // loop through to check
    for (let i = 0; i < this.trailSet.length; i++) {
        if (!this.trailSet[i].mValid) {
            this.trailSet.splice(i, 1);
        }
    }
}

  update() {
    if (performance.now() - this.creationTime > this.lifetime) {
      this.mValid = false;
    }

    this.checkObjectLifespan();

    super.update();
    this.spawnTrail();
    let xf = this.getXform();

    // update the trails
    for (let i = 0; i < this.trailSet.length; i++) {
      if (this.trailSet[i].mValid)
        this.trailSet[i].update();
    }
    
    this.mSpeed += this.acceleration;
    if (this.pathType == "tracking") {
      let desiredPoint = vec2.fromValues(this.target.getXform().getPosition()[0], this.target.getXform().getPosition()[1]);
      desiredPoint[0]+=(this.target.getXform().getWidth()/2);
      desiredPoint[1]+=(this.target.getXform().getHeight()/2);
      let pCenter = vec2.fromValues(xf.getCenterPos()[0],xf.getCenterPos()[1])
      //console.log(pCenter)
      let centeredDesiredPoint = vec2.fromValues(desiredPoint[0] - pCenter[0], desiredPoint[1] - pCenter[1]);
      //console.log(centeredDesiredPoint)
      let centeredFront = vec2.fromValues(this.mCurrentFrontDir[0] - pCenter[0], this.mCurrentFrontDir[1] - pCenter[1]); 
      
      //console.log(xf.getCenterPos(), this.target.getXform().getCenterPos())
      let fAngle = Math.atan(centeredFront[1]/centeredFront[0])
      let pAngle = Math.atan(centeredDesiredPoint[1]/centeredDesiredPoint[0])
      //console.log(fAngle/Math.PI*180, pAngle/Math.PI*180)
      let deltaRad =  Math.round((pAngle - fAngle + Math.PI/4)* 180 / Math.PI)
     
      if (this.target.getXform().getXPos() < xf.getXPos()) {
        deltaRad += 180;
      }
      //vec2.rotate(this.getCurrentFrontDir(), this.getCurrentFrontDir(), deltaRad);
     // this.getXform().incRotationByRad(deltaRad);
      // engine.GameObject.prototype.update.call
      /*
        this.mBrain.rotateObjPointTo(this.mHero.getXform().getPosition(), 0.01);
        engine.GameObject.prototype.update.call(this.mBrain);
      */
     /*
     */
      console.log(deltaRad)
      this.setCurrentFrontDir(vec2.rotate(this.getCurrentFrontDir(), this.getCurrentFrontDir(), deltaRad * Math.PI/180))
      xf.setRotationInDegree(deltaRad);
      
    } else if (this.pathType == "mouse tracking") {
      let point = vec2.fromValues(input.getMousePosX(), input.getMousePosY());
      this.setCurrentFrontDir(point);

      let rot = Math.atan2(point[1]  + this.getXform().getPosition()[1], point[0] + this.getXform().getPosition()[0]);
      this.getXform().setRotationInRad(rot);
    }
  }    // accelerate this.mSpeed
  // calls spawnTrail()
  // checks collisions -> calls bounce(), onTermination()
  // onSpawn() inFlight(), onTermination() if conditions are met
}
export default Projectile;