function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Circle(x, y, r) {
  Point.constructor.call(this, [x, y]);
  this.r = r;
  this.area = function () {
    return 3.14 * this.r * this.r;
  };
}

const c = new Circle(0, 0, 5);
console.log(c);
console.log(c.area);
