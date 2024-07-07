/**
 * @typedef {[number, number]} Vec2
 */

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector('[data-canvas]');

canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight - 200;

const ctx = canvas.getContext('2d');
const { width, height } = canvas;

/** @type {HTMLElement} */
const scoreText = document.querySelector('[data-score]');
/** @type {HTMLElement} */
const timeText = document.querySelector('[data-time]');
/** @type {HTMLElement} */
const gameOverScreen = document.querySelector('[data-game-over]');

const getRandom = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * @param {Vec2} pos1
 * @param {Vec2} pos2
 */
const getDistance = ([x1, y1], [x2, y2]) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/**
 * @param {number} size
 */
const getBoundaries = (size) => ({
  x: {
    min: 0 + size + 1,
    max: width - size - 1,
  },
  y: {
    min: 0 + size + 1,
    max: height - size - 1,
  },
});

/**
 * @param {Vec2} vec
 * @returns {Vec2}
 */
const normalize = ([x, y]) => {
  const magnitude = Math.sqrt(x * x + y * y);

  return magnitude === 0 ? [x, y] : [x / magnitude, y / magnitude];
};

class Circle {
  /**
   * @param {Vec2} pos
   * @param {number} size
   * @param {string} stroke
   * @param {string} fill
   */
  constructor(pos, size, stroke, fill) {
    this.pos = pos;
    this.size = size;
    this.stroke = stroke;
    this.fill = fill;
  }

  render() {
    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.fill;
    ctx.line;
    ctx.beginPath();
    ctx.arc(...this.pos, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  getBoundaries() {
    return getBoundaries(this.size);
  }

  /**
   * @param {Vec2} dir
   * @param {number} speed
   */
  move(dir, speed) {
    const [newX, newY] = dir.map((val, i) => this.pos[i] + val * speed);
    const boundaries = this.getBoundaries();

    if (newX < boundaries.x.min) this.pos[0] = boundaries.x.min;
    else if (newX > boundaries.x.max) this.pos[0] = boundaries.x.max;
    else this.pos[0] = newX;

    if (newY < boundaries.y.min) this.pos[1] = boundaries.y.min;
    else if (newY > boundaries.y.max) this.pos[1] = boundaries.y.max;
    else this.pos[1] = newY;

    this.render();
  }
}

class Player extends Circle {
  /**
   * @param {Vec2} dir
   * @param {[pos: Vec2, size: number, stroke: string, fill: string]} args
   */
  constructor(dir, ...args) {
    super(...args);
    this.dir = dir;
  }

  move() {
    super.move(this.dir, 10);
  }
}

class Hole extends Circle {
  /** @type {Vec2} */
  #dir;
  /** @type {Vec2} */
  #startPos;
  /** @type {Vec2} */
  #minPos;
  /** @type {Vec2} */
  #maxPos;

  /**
   * @param {'none' | 'x' | 'y'} dir
   * @param {number} speed
   * @param {number} distance
   * @param {[pos: Vec2, size: number, stroke: string, fill: string]} args
   */
  constructor(dir, speed, distance, ...args) {
    super(...args);

    this.dir = dir;
    this.#dir = dir === 'none' ? [0, 0] : dir === 'x' ? [1, 0] : [0, 1];

    this.speed = speed;
    this.distance = distance;

    const boundaries = this.getBoundaries();

    this.#startPos = [...args[0]];
    this.#minPos = this.#startPos.map((val, i) =>
      Math.max(
        val - this.#dir[i] * this.distance,
        i === 0 ? boundaries.x.min : boundaries.y.min
      )
    );
    this.#maxPos = this.#startPos.map((val, i) =>
      Math.min(
        val + this.#dir[i] * this.distance,
        i === 0 ? boundaries.x.max : boundaries.y.max
      )
    );
  }

  move() {
    const isOut = this.pos.some(
      (val, i) =>
        this.#dir[i] && (val <= this.#minPos[i] || val >= this.#maxPos[i])
    );

    if (isOut) this.#dir = this.#dir.map((val) => val * -1);

    super.move(this.#dir, this.speed);
  }
}

class Portal {
  #isInside = false;

  /** @type {Circle[]} */
  circles;

  /**
   *
   * @param {Player} player
   */
  constructor(player) {
    const size = 40;
    const {
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
    } = getBoundaries(size);

    this.circles = [
      new Circle(
        [getRandom(minX, maxX), getRandom(minY, maxY)],
        size,
        '#27a7d8',
        '#27a7d8'
      ),
      new Circle(
        [getRandom(minX, maxX), getRandom(minY, maxY)],
        size,
        '#ff9a00',
        '#ff9a00'
      ),
    ];

    this.player = player;
  }

  render() {
    const pos1 = this.circles[0].pos;
    const pos2 = this.circles[1].pos;

    ctx.strokeStyle = '#30234230';
    ctx.lineWidth = 80;
    ctx.beginPath();
    ctx.moveTo(...pos1);
    ctx.lineTo(...pos2);
    ctx.stroke();

    this.circles.forEach((circle) => circle.render());
  }

  /**
   * @param {number} idx
   */
  getIsColliding(idx) {
    const circle = this.circles[idx];
    const distance = getDistance(circle.pos, this.player.pos);
    const collisionDistance = circle.size + this.player.size;

    return distance <= collisionDistance;
  }

  handleCollisions() {
    const collisions = [this.getIsColliding(0), this.getIsColliding(1)];

    if (collisions.every((col) => !col)) this.#isInside = false;

    if (this.#isInside) return;

    if (collisions[0]) {
      this.player.pos = [...this.circles[1].pos];
      this.#isInside = true;
    }

    if (collisions[1]) {
      this.player.pos = [...this.circles[0].pos];
      this.#isInside = true;
    }
  }
}

/**
 *
 * @param {number} amount
 */
const holeFactory = (amount) => {
  const getDir = () => {
    const random = getRandom(1, 3);

    switch (random) {
      case 1:
        return 'none';
      case 2:
        return 'x';
      case 3:
        return 'y';
      default:
        return 'none';
    }
  };

  return Array.from({ length: amount }, () => {
    const size = getRandom(25, 80);
    const {
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
    } = getBoundaries(size);

    const hole = new Hole(
      getDir(),
      parseInt((80 - size) / 5),
      getRandom(100, 500),
      [getRandom(minX, maxX), getRandom(minY, maxY)],
      size,
      '#302342',
      '#302342'
    );

    return hole;
  });
};

class GameManager {
  #score = 0;

  time = 60;

  /**
   * @param {Player} player
   * @param {Hole[]} holes
   */
  constructor(player, holes) {
    this.player = player;
    this.holes = holes;

    const interval = setInterval(() => {
      this.time--;
      timeText.innerText = this.time;

      if (this.time <= 0) {
        clearInterval(interval);
      }
    }, 1_000);
  }

  handleCollisions() {
    this.holes.forEach((hole, i) => {
      const distance = getDistance(hole.pos, this.player.pos);
      const collisionDistance = hole.size + this.player.size;

      if (distance < collisionDistance) {
        this.#score++;
        scoreText.innerText = this.#score;

        this.holes.splice(i, 1);
        this.holes.push(holeFactory(1)[0]);
      }
    });
  }
}

const init = () => {
  const {
    x: { min: minX, max: maxX },
    y: { min: minY, max: maxY },
  } = getBoundaries(20);
  const player = new Player(
    [0, 0],
    [getRandom(minX, maxX), getRandom(minY, maxY)],
    20,
    'white',
    '#ff3870'
  );
  const holes = holeFactory(10);
  const manager = new GameManager(player, holes);
  const portals = Array.from({ length: 3 }, () => new Portal(player));

  window.addEventListener('deviceorientation', (e) => {
    const { beta, gamma } = e;
    const dir = [gamma / 90, (beta - 90) / 90];

    player.dir = dir;
  });

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    holes.forEach((hole) => hole.move());
    portals.forEach((portal) => {
      portal.render();
      portal.handleCollisions();
    });
    player.move();
    manager.handleCollisions();

    if (manager.time <= 0) {
      gameOverScreen.style.display = 'flex';
      return;
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};
init();
