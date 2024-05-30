type SliderNodes = {
  slider: HTMLElement;
  slideWrapper: HTMLElement;
  slides: HTMLElement[];
  controls: HTMLElement;
  currentSlide: number;
  autoPlayTime: number;
  isAutoPlay: boolean;
};

type SliderInit = {
  sliderSelector?: string;
  slidesSelector?: string;
  controlsSelector?: string;
};

type MoveAmount = {
  by?: number;
  to?: number;
};

type Move = (amount: MoveAmount) => void;

const AUTO_PLAY_TIME = 300;

const addClasses = ({
  slider,
  slideWrapper,
  slides,
  controls,
}: SliderNodes) => {
  slider?.classList.add('slider');
  slideWrapper?.classList.add('slide-wrapper');
  controls?.classList.add('controls');
  slides?.forEach((slide) => {
    slide.classList.add('slide');
  });
};

const internalMove = (nodes: SliderNodes, { by, to }: MoveAmount) => {
  const { slider, slides, slideWrapper } = nodes;
  const maxSlide = slides.length - 1;
  const width = slider.clientWidth;

  nodes.currentSlide = (() => {
    if (to) return to;

    if (!by) return 0;

    const nextSlide = nodes.currentSlide + by;

    switch (true) {
      case nextSlide > maxSlide:
        return 0;
      case nextSlide < 0:
        return maxSlide;
      default:
        return nextSlide;
    }
  })();

  nodes.autoPlayTime = 0;
  slideWrapper.style.left = `-${nodes.currentSlide * width}px`;
};

const createBullets = (nodes: SliderNodes) => {
  const bulletWrapper = document.createElement('div');
  bulletWrapper.classList.add('bullet-wrapper');

  const bullets = nodes.slides.map(() => document.createElement('button'));
  const checkBullets = () =>
    bullets.forEach((bullet, i) => {
      bullet.innerText = nodes.currentSlide === i ? '●' : '○';
    });

  checkBullets();
  bullets.forEach((bullet, i) => {
    bullet.classList.add('bullet');
    bullet.addEventListener('click', () => {
      internalMove(nodes, { to: i });
      checkBullets();
    });

    bulletWrapper.appendChild(bullet);
  });

  return {
    bulletWrapper,
    checkBullets,
  };
};

const initControls = (nodes: SliderNodes) => {
  const prevButton = document.createElement('button');
  const nextButton = document.createElement('button');

  const { bulletWrapper, checkBullets } = createBullets(nodes);
  const move = (amount: MoveAmount) => {
    internalMove(nodes, amount);
    checkBullets();
  };

  prevButton.innerText = '◀';
  prevButton.addEventListener('click', () => {
    move({ by: -1 });
    checkBullets();
  });

  nextButton.innerText = '▶';
  nextButton.addEventListener('click', () => {
    move({ by: 1 });
    checkBullets();
  });

  nodes.controls.appendChild(prevButton);
  nodes.controls.appendChild(bulletWrapper);
  nodes.controls.appendChild(nextButton);

  return { move };
};

const autoPlay = (nodes: SliderNodes, move: Move) => {
  nodes.autoPlayTime += 1;

  const progressPercentage = (nodes.autoPlayTime / AUTO_PLAY_TIME) * 100;
  nodes.slider.style.setProperty(
    '--auto-play-progress',
    progressPercentage.toString()
  );

  if (nodes.autoPlayTime >= AUTO_PLAY_TIME) {
    move({ by: 1 });
  }

  if (!nodes.isAutoPlay) return;

  requestAnimationFrame(() => autoPlay(nodes, move));
};

const initAutoPlay = (nodes: SliderNodes, move: Move) => {
  const button = document.createElement('button');

  button.addEventListener('click', () => {
    nodes.isAutoPlay = !nodes.isAutoPlay;
    button.innerText = nodes.isAutoPlay ? '▢' : '▷';

    if (nodes.isAutoPlay) autoPlay(nodes, move);
  });
  button.innerText = '▢';
  button.classList.add('auto-play-button');

  nodes.controls.appendChild(button);

  autoPlay(nodes, move);
};

export const initSlider = ({
  sliderSelector = '[data-slider]',
  slidesSelector = `${sliderSelector}>[data-slides]`,
  controlsSelector = `${sliderSelector}>[data-controls]`,
}: SliderInit = {}) => {
  const nodes = {
    get slider() {
      return document.querySelector<HTMLElement>(sliderSelector)!;
    },
    get slideWrapper() {
      return document.querySelector<HTMLElement>(slidesSelector)!;
    },
    get slides() {
      return [...document.querySelectorAll<HTMLElement>(`${slidesSelector}>*`)];
    },
    get controls() {
      return document.querySelector<HTMLElement>(controlsSelector)!;
    },

    get currentSlide() {
      return Number(this.slider.dataset.currentSlide ?? 0);
    },
    set currentSlide(value: number) {
      this.slider.dataset.currentSlide = value.toString();
    },

    autoPlayTime: 0,
    isAutoPlay: true,
  };

  nodes.currentSlide = 0;
  addClasses(nodes);

  const { move } = initControls(nodes);

  initAutoPlay(nodes, move);
};
