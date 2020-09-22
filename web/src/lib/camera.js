// @flow strict
import { Vector2D } from '../lib/vector';

class Camera2D {
  position = new Vector2D(0,0);
  zoom = 1;

  constructor(position/*: Vector2D*/, zoom/*: number*/) {
    this.position = position;
    this.zoom = zoom;
  }

  movePosition(amountToMove/*: Vector2D*/) {
    return new Camera2D(this.position.add(amountToMove), this.zoom);
  }

  moveZoom(amountToZoom/*: number*/, zoomCenter/*: Vector2D*/) {
    return new Camera2D(this.position, this.zoom + amountToZoom);
  }

  transformPositionToScreenSpace(positionToTransform/*: Vector2D*/) {
    return positionToTransform.subtract(this.position).multiply(this.zoom);
  }
}

export {
  Camera2D,
};
