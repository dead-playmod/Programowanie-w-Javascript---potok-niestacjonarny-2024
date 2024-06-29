/**
 * @typedef {Object} Note
 * @property {Number} id
 * @property {String} title
 * @property {String} content
 * @property {String} tag
 * @property {String} color
 * @property {Boolean} pinned
 * @property {Number} createdAt
 */

const NOTES_KEY = 'notes';

const app = {
  /** @type {HTMLFormElement} */
  form: document.querySelector('[data-form]'),
  /** @type {HTMLInputElement} */
  title: document.querySelector('[data-title]'),
  /** @type {HTMLTextAreaElement} */
  content: document.querySelector('[data-content]'),
  /** @type {HTMLInputElement} */
  tag: document.querySelector('[data-tag]'),
  /** @type {HTMLInputElement} */
  pinned: document.querySelector('[data-pinned]'),
  /** @type {HTMLInputElement} */
  color: document.querySelector('[data-color]'),
  /** @type {HTMLDivElement} */
  notes: document.querySelector('[data-notes]'),
  /** @type {HTMLButtonElement} */
  add: document.querySelector('[data-add]'),
  /** @type {HTMLButtonElement} */
  cancel: document.querySelector('[data-cancel]'),
  /** @type {HTMLInputElement} */
  search: document.querySelector('[data-search]'),
};

const notes = {
  /** @type {Note[]} */
  get value() {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) ?? [];
  },

  set value(val) {
    localStorage.setItem(
      NOTES_KEY,
      JSON.stringify(
        val.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;

          return b.createdAt - a.createdAt;
        })
      )
    );
  },
};

/** @type {null | Number} */
let edit = null;
let searchStr = '';

/**
 *
 * @param {Number} i
 * @param {Note} value
 */
const setNote = (i, value) => {
  const notesCopy = [...notes.value];

  notesCopy[i] = value;
  notes.value = notesCopy;
};

/** @param {Note} note */
const addNote = (note) => {
  notes.value = [...notes.value, note];
};

/** @param {Note} note */
const removeNote = (i) => {
  const notesCopy = [...notes.value];

  notesCopy.splice(i, 1);
  notes.value = notesCopy;
  renderNotes();
};

/** @param {Number} i */
const pinNote = (i) => {
  const newNote = notes.value[i];
  newNote.pinned = !newNote.pinned;

  setNote(i, newNote);
  renderNotes();
};

const editNote = (i) => {
  const note = notes.value[i];

  app.title.value = note.title;
  app.tag.value = note.tag;
  app.content.value = note.content;
  app.pinned.checked = note.pinned;
  app.color.value = note.color;

  edit = i;

  app.add.innerText = 'edit note';
  app.cancel.style = '';
  app.title.focus();
};

const renderNotes = () => {
  app.notes.innerHTML = '';
  notes.value
    .filter(
      (note) =>
        note.title.includes(searchStr) ||
        note.content.includes(searchStr) ||
        note.tag.includes(searchStr)
    )
    .forEach((note, i) => {
      const div = document.createElement('div');
      const date = new Date(note.createdAt);

      div.style = `--border-color: ${note.color}50; --background-color: ${note.color}40;`;
      div.innerHTML = `
      <div class="note__top">
        <span class="note__title">${note.title}</span>

        <button class="note__pinned${
          note.pinned ? ' note__pinned--active' : ''
        }" data-pinned>
          <span>⭐</span>
        </button>
      </div>

      <span class="note__date">${date.toLocaleDateString()}</span>

      <span>${note.tag}</span>

      <p class="note__content">${note.content}</p>

      <div class="note__controls">
        <button data-edit>🖊️</button>
        <button data-remove>🗑️</button>
      </div>
    `;
      div.classList.add('note');

      div
        .querySelector('[data-pinned]')
        .addEventListener('click', () => pinNote(i));

      div
        .querySelector('[data-edit]')
        .addEventListener('click', () => editNote(i));

      div
        .querySelector('[data-remove]')
        .addEventListener('click', () => removeNote(i));

      app.notes.appendChild(div);
    });
};

const clearForm = () => {
  app.title.value = '';
  app.content.value = '';
  app.tag.value = '';
  app.pinned.checked = false;
  app.color.value = '#808080';
};

const submit = () => {
  const note = {
    title: app.title.value,
    content: app.content.value,
    tag: app.tag.value,
    pinned: app.pinned.checked,
    color: app.color.value,
    createdAt: Date.now(),
  };

  if (edit !== null) {
    setNote(edit, note);

    edit = null;

    app.cancel.style = 'display: none;';
    app.add.innerText = 'add note';
    app.add.innerText = 'add note';
  } else {
    addNote(note);
  }

  renderNotes();
  clearForm();
};

const init = () => {
  app.form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit();
  });
  app.cancel.addEventListener('click', () => {
    edit = null;
    app.cancel.style = 'display: none;';
    app.add.innerText = 'add note';
    clearForm();
  });
  app.search.addEventListener('input', (e) => {
    /** @type {HTMLInputElement} */
    const target = e.target;

    searchStr = target.value;
    renderNotes();
  });
  renderNotes();
};
init();
