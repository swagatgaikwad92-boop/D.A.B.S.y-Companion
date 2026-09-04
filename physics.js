// Spring physics engine for organic, interruptible motion with mass
class Spring {
  constructor(val, tension = 120, friction = 14) {
    this.val = val;
    this.target = val;
    this.vel = 0;
    this.tension = tension;
    this.friction = friction;
  }
  
  update(dt = 0.016) {
    const force = (this.target - this.val) * this.tension;
    this.vel += (force - this.vel * this.friction) * dt;
    this.val += this.vel * dt;
    return this.val;
  }
}

