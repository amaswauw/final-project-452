"use strict";  // Operate in Strict mode such that variables must be declared before used!

import engine from "../../engine/index.js";

class Box extends engine.GameObject {
    constructor(spriteTexture) {
        super(null);
        this.mRenderComponent =  new engine.TextureRenderable(spriteTexture);
        this.mRenderComponent.setColor([1, 1, 1, 0]);
        this.mRenderComponent.getXform().setPosition(70, 55);
        this.mRenderComponent.getXform().setSize(20, 20);
    }
}

export default Box;