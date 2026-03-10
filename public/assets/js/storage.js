const KEY = 'armchair_renting_ui';

export function getUIState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function setUIState(next) {
  localStorage.setItem(KEY, JSON.stringify(next || {}));
}

