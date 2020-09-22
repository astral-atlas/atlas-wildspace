// @flow strict

class Vector2D {
  x = 0;
  y = 0;

  constructor(x/*: number*/, y/*: number*/) {
    this.x = x;
    this.y = y;
  }

  negate() {
    return new Vector2D(
      -this.x,
      -this.y
    );
  }

  add(vectorToAdd/*: Vector2D*/) {
    return new Vector2D(
      this.x + vectorToAdd.x,
      this.y + vectorToAdd.y
    );
  }

  subtract(vectorToSubtract/*:Vector2D*/) {
    return this.add(vectorToSubtract.negate());
  }

  multiply(scalarToMultiplyBy/*: number*/) {
    return new Vector2D(
      this.x * scalarToMultiplyBy,
      this.y * scalarToMultiplyBy
    );
  }

  toString() {
    return `Vector2D(${this.x}, ${this.y})`;
  }
}

export {
  Vector2D,
};
