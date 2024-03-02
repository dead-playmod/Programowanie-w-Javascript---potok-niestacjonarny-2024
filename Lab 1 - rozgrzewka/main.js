const container = document.querySelector('[data-calc-container]');
const addBtn = document.querySelector('[data-calc-add]');
const output = document.querySelector('[data-calc-output]');

/** @type {HTMLInputElement[]} */
let inputs = [];

const calculate = () => {
  const values = inputs.length
    ? inputs.map(({ value }) => Number(value ?? 0))
    : 0;
  const sum = values.reduce((prev, curr) => prev + curr, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  output.innerText = `
    values = ${values.join(', ')}
    sum = ${sum}
    average = ${average}
    min = ${min}
    max = ${max} 
  `;
};

const setInputs = () => {
  inputs = [...document.querySelectorAll('[data-calc-input]')];
};

const addNewInput = () => {
  const newInput = document.createElement('input');
  const newBtn = document.createElement('button');
  const inputWrapper = document.createElement('div');

  newInput.type = 'number';
  newInput.setAttribute('data-calc-input', '');
  newInput.addEventListener('input', calculate);

  newBtn.innerText = '❌';
  newBtn.addEventListener('click', () => {
    newInput.remove();
    newBtn.remove();
    inputWrapper.remove();

    setInputs();
    calculate();
  });

  inputWrapper.classList.add('calc-input-wrapper');
  inputWrapper.appendChild(newInput);
  inputWrapper.appendChild(newBtn);

  container.appendChild(inputWrapper);

  setInputs();
  calculate();
};

const init = () => {
  for (let i = 0; i < 3; i++) addNewInput();

  addBtn.addEventListener('click', addNewInput);
  calculate();
};
init();
