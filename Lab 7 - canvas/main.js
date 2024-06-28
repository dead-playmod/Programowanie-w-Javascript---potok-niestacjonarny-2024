/**
 * @typedef {[Number, Number]} Vec2
 */

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector('[data-canvas]');
let { width, height } = canvas;
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#ba85ff';
ctx.strokeStyle = '#11095c';

/** @type {HTMLButtonElement} */
const startBtn = document.querySelector('[data-start]');
/** @type {HTMLButtonElement} */
const resetBtn = document.querySelector('[data-reset]');

/** @type {HTMLInputElement} */
const widthInput = document.querySelector('[data-width]');
/** @type {HTMLInputElement} */
const heightInput = document.querySelector('[data-height]');

/**
 * @param {Number} min
 * @param {Number} max
 */
const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

class Ball {
  /**
   * @param {Number} size
   * @param {Number} speed
   * @param {Vec2} pos
   * @param {Vec2} dir
   */
  constructor(size, speed, pos, dir) {
    this.size = size;
    this.speed = speed;
    this.pos = pos;
    this.dir = dir;
  }

  get x() {
    return this.pos[0];
  }
  set x(val) {
    this.pos[0] = val;
  }

  get y() {
    return this.pos[1];
  }
  set y(val) {
    this.pos[1] = val;
  }

  get dirX() {
    return this.dir[0];
  }
  set dirX(val) {
    this.dir[0] = val;
  }

  get dirY() {
    return this.dir[1];
  }
  set dirY(val) {
    this.dir[1] = val;
  }

  move() {
    if (this.x <= this.size + 1 || this.x >= width - this.size - 1)
      this.dirX *= -1;

    this.x = this.x + this.dirX * this.speed;

    if (this.y <= this.size + 1 || this.y >= height - this.size - 1)
      this.dirY *= -1;

    this.y = this.y + this.dirY * this.speed;
  }

  renderBall() {
    ctx.line;
    ctx.beginPath();
    ctx.arc(...this.pos, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

const ballFactory = (amount) => {
  const balls = Array.from({ length: amount }, () => {
    const size = getRandom(5, 10);
    const speed = getRandom(3, 5);
    const pos = [
      getRandom(size + 2, width - (size + 2)),
      getRandom(size + 2, height - (size + 2)),
    ];
    const dir = [
      (getRandom(0, 20) - 10) / 10 || 0.1,
      (getRandom(0, 20) - 10) / 10 || 0.1,
    ];

    return new Ball(size, speed, pos, dir);
  });

  return balls;
};

/**
 *
 * @param {Ball} ball1
 * @param {Ball} ball2
 */
const getDistance = ({ x: x1, y: y1 }, { x: x2, y: y2 }) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/**
 *
 * @param {Ball[]} balls
 */
const renderLines = (balls) => {
  /**
   * @type {[Number, Number][]}
   */
  const lines = [];

  for (const i of balls.keys()) {
    for (const j of balls.keys()) {
      const isInArray = lines.find(
        ([k, l]) => (k === i && l === j) || (k === j && l === i)
      );

      const distance = getDistance(balls[i], balls[j]);

      if (i === j || isInArray || distance >= 150) continue;

      lines.push([i, j]);
    }
  }

  lines.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(...balls[i].pos);
    ctx.lineTo(...balls[j].pos);
    ctx.stroke();
  });
};

/**
 * @typedef {Object} State
 * @property {'stopped' | 'started'} animation
 * @property {Ball[]} balls
 */

/**
 * @param {State} state
 */
const animate = (state) => {
  const { animation, balls } = state;

  if (animation === 'started') {
    ctx.clearRect(0, 0, width, height);

    balls.forEach((ball) => {
      ball.move();
    });

    renderLines(balls);

    balls.forEach((ball) => {
      ball.renderBall();
    });
  }

  requestAnimationFrame(() => animate(state));
};

const init = () => {
  /** @type {State} */
  const state = { animation: 'stopped', balls: ballFactory(10) };

  startBtn.addEventListener('click', () => {
    state.animation = state.animation === 'started' ? 'stopped' : 'started';
  });
  resetBtn.addEventListener('click', () => {
    state.balls = ballFactory(10);
    state.animation = 'started';
  });

  widthInput.addEventListener('input', () => {
    width = canvas.width = Math.max(widthInput.value, 420);
  });
  heightInput.addEventListener('input', () => {
    height = canvas.height = Math.max(heightInput.value, 280);
  });

  animate(state);
};
init();
