/**
 * @typedef {'a' | 'b' | 'd' | ' '} Sound
 */

/**
 * @typedef {Object} Timeline
 * @property {String} selector
 * @property {Sound[]} sounds
 * @property {boolean} isActive
 */

const SOUNDS_MAP = {
  a: new Audio('./sounds/clap.wav'),
  s: new Audio('./sounds/kick.wav'),
  d: new Audio('./sounds/hihat.wav'),
};
const TIMELINE_LENGTH = 60;
const TIMELINE_SPEED = 250;

const app = document.querySelector('#app');

/**
 * @type {Timeline[]}
 */
const timelines = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  sounds: new Array(TIMELINE_LENGTH).fill(null),
  isActive: false,
}));

let time = 0;
let timer = null;
let recordingTimeline = null;

const initTimeline = ({ id }) => {
  const timeline = document.createElement('div');
  timeline.classList.add('timeline');
  app.appendChild(timeline);

  const title = document.createElement('div');
  title.classList.add('title');
  title.innerText = `timeline ${id}`;
  timeline.appendChild(title);

  const squareWrapper = document.createElement('div');
  squareWrapper.classList.add('square-wrapper');
  timeline.appendChild(squareWrapper);

  const squares = Array.from({ length: TIMELINE_LENGTH }, (_, i) => {
    const square = document.createElement('div');

    square.classList.add('square');
    square.dataset.square = `${id}|${i}`;
    square.innerText = ' ';
    squareWrapper.appendChild(square);

    return square;
  });

  const record = document.createElement('button');
  record.dataset.record = '';
  record.innerText = '🔴';
  record.addEventListener('click', () => {
    if (recordingTimeline === id) {
      squares.forEach((square) => (square.style.borderColor = null));
      record.innerText = '🔴';
      clearInterval(timer);

      time = 0;
      timer = null;
      recordingTimeline = null;

      return;
    }

    if (recordingTimeline !== null) {
      document
        .querySelectorAll('[data-square]')
        .forEach((square) => (square.style.borderColor = null));
      document
        .querySelectorAll('[data-record]')
        .forEach((record) => (record.innerText = '🔴'));
      clearInterval(timer);

      time = 0;
      timer = null;
      recordingTimeline = null;
    }

    timelines[id].sounds = new Array(TIMELINE_LENGTH).fill(null);
    recordingTimeline = id;
    squares.forEach((square) => (square.innerText = ' '));
    squares[time].style.borderColor = 'red';
    record.innerText = '⬛';

    timer = setInterval(() => {
      time++;
      squares[time].style.borderColor = 'red';

      if (time > 0) squares[time - 1].style.borderColor = null;
      if (time >= squares.length - 1) {
        document
          .querySelectorAll('[data-square]')
          .forEach((square) => (square.style.borderColor = null));
        document
          .querySelectorAll('[data-record]')
          .forEach((record) => (record.innerText = '🔴'));
        clearInterval(timer);

        time = 0;
        timer = null;
        recordingTimeline = null;
      }
    }, TIMELINE_SPEED);
  });
  title.appendChild(record);

  const play = document.createElement('button');
  let timer = null;
  play.innerText = '▶️';
  play.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      squares.forEach((square) => (square.style.backgroundColor = null));
      timer = null;
      play.innerText = '▶️';
      record.disabled = false;

      return;
    }

    let time = 0;

    record.disabled = true;
    play.innerText = '⏹️';
    timer = setInterval(() => {
      const key = timelines[id].sounds[time];
      const sound = SOUNDS_MAP[key];

      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }

      squares[time].style.backgroundColor = 'yellowgreen';

      if (time > 0) squares[time - 1].style.backgroundColor = null;
      if (time >= TIMELINE_LENGTH - 1) {
        clearInterval(timer);
        squares.forEach((square) => (square.style.backgroundColor = null));
        timer = null;
        play.innerText = '▶️';
        record.disabled = false;

        return;
      }

      time++;
    }, TIMELINE_SPEED);
  });
  title.appendChild(play);
};

const initListeners = () => {
  addEventListener('keypress', ({ key }) => {
    const sound = SOUNDS_MAP[key];

    if (!sound || recordingTimeline === null) return;

    sound.currentTime = 0;
    sound.play();

    const square = document.querySelector(
      `[data-square="${recordingTimeline}|${time}"]`
    );

    timelines[recordingTimeline].sounds[time] = key;
    square.innerText = key;
  });
};

const init = () => {
  timelines.forEach(initTimeline);
  initListeners();
};
init();
