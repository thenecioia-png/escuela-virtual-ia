const PREFIX = 'evi_';

export const getStorage = (key, defaultValue = null) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorage = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const removeStorage = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
};
