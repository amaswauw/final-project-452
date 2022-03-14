"use strict";

import GameObject from "./game_object.js";
import TrailRenderable from "../renderables/trail_renderable.js"
import TextureRenderable from "../renderables/texture_renderable_main.js";
import engine from "../../engine/index.js";

class Projectile extends engine.GameObject {
  constructor(renderable, _lifetime, _trailTexture = null, _trailLifetime = 0, _trailInterval = 1000) {
    super(new TextureRenderable(renderable));
    this.lifetime = _lifetime;
    this.creationTime = performance.now();
    this.acceleration = 0;
    this.mMaxRotation = 0;
    this.facingDegree = 0;
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
    this.bouncingPrototypes = [];
    this.onSpawnCheck = true;
    this.mSpeed = 0;
    this.temp = vec2.fromValues(0, 0);
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

  setTrailSize(x, y) {
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

  setBouncingPrototypes(gameObjectPrototypes = []) {
    this.bouncingPrototypes = gameObjectPrototypes;
  }

  // Bounce
  bounce(gameObjectTypes = []) {
    for (let objtype of this.bouncingPrototypes) {
      for (let gameObject of GameObject.gameObjectSet) {
        if (gameObject instanceof objtype) {
          let h = [];
          if (this.pixelTouches(gameObject, h)) {
             this.setCurrentFrontDir(this.reflect(this.getCurrentFrontDir(), vec.normalize(this.temp, this.getCurrentFrontDir())))
          }
        } else {
          let h = [];
          if (this.pixelTouches(gameObject, h)) {
            this.onTermination();
          }
        }
      }
    }
   }

  reflect(vector, normal) {
    let reflect = vec2.clone(vector);
    reflect = vec2.scale(reflect, normal, -2 * vec2.dot(vector, normal));
    reflect = vec2.add(reflect, reflect, vector);
    // if (direction === "bottom") {
    //   reflect[1] = Math.abs(reflect[1])
    // } else if (direction === "top") {
    //   if (reflect[1] > 0) {
    //     reflect[1] = -reflect[1];
    //   }
    // }
    return reflect;
  }

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

      point[0] += (target.getXform().getWidth() / 2);
      point[1] += (target.getXform().getHeight() / 2);
      this.setCurrentFrontDir(point);

      let rot = Math.atan2(point[1] + this.getXform().getPosition()[1], point[0] + this.getXform().getPosition()[0]);
      this.getXform().setRotationInRad(rot);
    }
    //  if the target point is given
    else if (targetPoint != null) {
      this.setCurrentFrontDir(targetPoint);
      let rot = Math.atan2(targetPoint[1] + this.getXform().getPosition()[1], targetPoint[0] + this.getXform().getPosition()[0]);
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
  // maxRotation is in degrees per tick, ex) limiting to 20 degrees/second = 20/60 = 0.33
  setTracking(target, maxRotation = 360, speed = 0, acceleration = 0) {

    this.mSpeed = speed;
    this.acceleration = acceleration;
    this.mMaxRotation = maxRotation;
    this.targetPoint = null;
    if (target instanceof GameObject) {
      this.pathType = "tracking"
      this.target = target;
      this.setCurrentFrontDir(vec2.fromValues(1, 0));
    }
  }



  setParabolaD(direction = null, speed = 0, accDirection = [0, -1], accMagnitude = (9.8 / 10000)) {
    this.mSpeed = speed;
    this.pathType = "parabolic direction";
    if (direction) {
      let x = Math.cos(direction)
      let y = Math.sin(direction);
      this.setCurrentFrontDir(vec2.fromValues(x, y));
    }
    this.getXform().setRotationInRad(Math.atan(direction[1]/direction[0]));
    this.accDirection = accDirection;
    this.accMagnitude = accMagnitude;
  }

  // Behavior effects
  onSpawn() {
    this.mValid = true;
    this.spawnTrail();
  } // Called from update() on first update call

  onTermination() {
    this.mValid = false;
    this.mSpeed = 0;
    this.acceleration = 0;
    GameObject.gameObjectSet.removeFromSet(this);
  } // Called from update() on last update call

  inFlight() {
    this.spawnTrail();
  } // Called from update() every call except for last and first

  draw(camera) {
    if (this.mValid) {
      for (let i = 0; i < this.trailSet.length; i++) {
        if (this.trailSet[i].mValid) {
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
      this.onTermination();
    }
    if (this.onSpawnCheck) {
      this.onSpawn();
      this.onSpawnCheck = false;
    } else {
      this.inFlight();
    }

    this.checkObjectLifespan();


    let xf = this.getXform();

    // update the trails
    for (let i = 0; i < this.trailSet.length; i++) {
      if (this.trailSet[i].mValid)
        this.trailSet[i].update();
    }

    this.mSpeed += this.acceleration;
    if (this.pathType === "tracking") {
      

      let desiredPoint = vec2.fromValues(this.target.getXform().getCenterPos()[0], this.target.getXform().getCenterPos()[1]);
      let pCenter = vec2.fromValues(xf.getCenterPos()[0], xf.getCenterPos()[1])
      
     
      let centeredDesiredPoint = vec2.fromValues(desiredPoint[0] - pCenter[0], desiredPoint[1] - pCenter[1]);
      
      let radius= Math.max(xf.mScale[0],xf.mScale[1])/2
      let centeredFront = vec2.fromValues(radius*Math.cos(this.facingDegree*Math.PI/180),radius*Math.sin(this.facingDegree*Math.PI/180));
      
    
      let projectileAngle = Math.atan(centeredFront[1]/ centeredFront[0]) * 180 / Math.PI
      let targetAngle = Math.atan(centeredDesiredPoint[1]/centeredDesiredPoint[0]) * 180 / Math.PI
    
      // fix the quadrant problem of atan
      //quadrant 2
      if(centeredDesiredPoint[0]<0){
        targetAngle+=180
      }// quadrant 4
      else if(centeredDesiredPoint[1]<0){
        targetAngle+=360
      }
      if(centeredFront[0]<0){
        projectileAngle+=180
      }else if(centeredFront[1]<0){
        projectileAngle+=360
      }
     
      // have an option for turning backwards
      // if the projectile is in quadrant 1 and the target is in quadrant 4
      let q1toq4= (360-targetAngle+projectileAngle) * -1
      // if the projectile is in quadrant 4 and the target is in quadrant 1
      let q4toq1= (360-projectileAngle+targetAngle) 
      let deltaDegree = (targetAngle - projectileAngle)

      //console.log("neg",negDelta)
      //console.log("pos",deltaDegree)
      
      if (Math.abs(q1toq4)<Math.abs(deltaDegree)){
        deltaDegree = q1toq4
      }
      
      if (Math.abs(q4toq1)<Math.abs(deltaDegree)){
        deltaDegree = q4toq1
      }



      deltaDegree = Math.min(Math.abs(deltaDegree), this.mMaxRotation)*Math.sign(deltaDegree)
      
      //console.log("delta degree",deltaDegree)
     // console.log("facing degree",this.facingDegree)


      
      this.facingDegree+=deltaDegree;
     
      let x = Math.cos(this.facingDegree * Math.PI / 180)
      let y = Math.sin(this.facingDegree * Math.PI / 180)

      //console.log("dir",x,y)
      this.setCurrentFrontDir(vec2.fromValues(x, y))
      xf.setRotationInDegree(this.facingDegree)
     

    } else if (this.pathType === "parabolic tracking") {
    } else if (this.pathType === "parabolic direction") {
      // console.log(this.getXform().getCenterPos());
      // Change X position
      // x = starting position + velocity in the horizontal axis * time

      // Change Y Position
      // y = starting height + 1 / 2 (starting velocity + current velocity) * time

      //
      //
      // step 0.5 or possibly even step 0.5: find the x and y components of the acceleration
      // accDirection = [0, -1], accMagnitude = (9.8 / 60)
      // do the trig thing on accDirection to get the rot value
      // do same thing from step 1
      let accX = this.accDirection[0] * Math.acos(this.accMagnitude);
      let accY = this.accDirection[1] * Math.asin(this.accMagnitude);


      // step 1: get the direction in radians so technically rotation ig and then yeah
      // let rot =  this.getxform().getrotatio
      let rot = this.getXform().getRotationInRad();
      // console.log(rot);

      // step 2: calculate speed components given current speed acceleration dir and acceleration mag and rot
      // console.log(this.mSpeed)
      let speedX = this.mSpeed * Math.cos(rot) + accX;
      let speedY = this.mSpeed * Math.sin(rot) + accY;

      // console.log(this.mSpeed);

      // step 2.5: update direction
      let updatedRotation = Math.atan2(speedY, speedX);
      this.getXform().setRotationInRad(updatedRotation);
      this.setCurrentFrontDir(vec2.fromValues(speedX, speedY));

      // step 3: find general speed vector, set mSpeed to the newfound speed
      // console.log(speedX * speedX)
      this.mSpeed = Math.sqrt(Math.pow(speedX, 2) + Math.pow(speedY, 2));
    }
    this.bounce(GameObject.gameObjectSet);
    super.update();
  }
  

  static updateAllProjectiles(){
    for(let gameObject of GameObject.gameObjectSet.mSet){
      if(gameObject instanceof Projectile){
        gameObject.update()
      }
    }
    
  }

   static drawAllProjectiles(camera){
    for(let gameObject of GameObject.gameObjectSet.mSet){
      if(gameObject instanceof Projectile){
        gameObject.draw(camera)
      }
    }
    
  }



}
export default Projectile;