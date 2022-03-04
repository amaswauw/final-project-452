"use strict";

import TextureRenderable from "./texture_renderable.js";

class TrailRenderable extends TextureRenderable {
  constructor(renderable, _lifeTime) {
    super(renderable);
    this.renderable = renderable;
    this.lifeTime = _lifeTime;
  }

  // stop rendering this trail renderable
  expire(currentTime) {
    if (currentTime > this.lifeTime) {
      return false;
    }
  }
}
export default TrailRenderable;