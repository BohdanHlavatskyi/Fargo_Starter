const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

function createElement() {
  return {
    innerHTML: '',
    hidden: false,
    value: '',
    textContent: '',
    dataset: {},
    style: {},
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    appendChild() {},
    setAttribute() {},
    onclick: null
  };
}

const elements = {
  '#project-grid': createElement(),
  '#modal-backdrop': { ...createElement(), hidden: true },
  '#modal-content': createElement(),
  '#toast': createElement(),
  '#category-row': createElement(),
  '#language-select': { ...createElement(), value: 'en' },
  '#open-register': createElement(),
  '#hero-start': createElement(),
  '#community-register': createElement(),
  '#chat-preview': createElement(),
  '#donor-join': createElement(),
  '#open-login': createElement(),
  '#close-modal': createElement(),
  '#filter-trigger': createElement()
};

const localStorage = {
  data: {},
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
  },
  setItem(key, value) {
    this.data[key] = String(value);
  }
};

const document = {
  documentElement: { lang: 'en' },
  body: { style: {} },
  querySelector(selector) {
    return elements[selector] || null;
  },
  querySelectorAll() {
    return [];
  }
};

const context = {
  console,
  localStorage,
  document,
  window: { localStorage, indexedDB: null },
  setTimeout,
  clearTimeout,
  Date
};

vm.createContext(context);
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context, { filename: 'app.js' });

assert(Array.isArray(context.projects) && context.projects.length > 0, 'Expected seeded projects in app.js');
assert(Array.isArray(context.categories) && context.categories.length > 0, 'Expected seeded categories in app.js');
assert(context.projects.every(project => typeof project.summary === 'string' && project.summary.trim().length > 0), 'Each project needs a summary description');
assert(context.projects.every(project => Array.isArray(project.gallery) && project.gallery.length > 0), 'Each project needs gallery images');
assert(context.projects.every(project => project.medals && Array.isArray(project.medals)), 'Each project needs medal data');
assert(context.adminCredentials && context.adminCredentials.email === 'bohdan.hlavatskyi@my.utsa.edu', 'Expected admin email to be configured');
assert(context.adminCredentials && context.adminCredentials.password === '@GlavaStudent04@', 'Expected admin password to be configured');
assert(Array.isArray(context.pendingAccounts), 'Pending accounts list should exist');
assert(Array.isArray(context.pendingProjects), 'Pending projects list should exist');
assert(typeof context.openProfile === 'function', 'Expected profile page handler to exist');
assert(typeof context.editProfile === 'function', 'Expected profile editor to exist');
assert(typeof context.deleteProject === 'function', 'Expected admin project deletion handler to exist');
assert(Array.isArray(context.accounts), 'Approved users list should exist');

console.log(`Seed data loaded: ${context.projects.length} projects, ${context.categories.length} categories`);
