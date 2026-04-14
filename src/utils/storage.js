const STORAGE_KEYS = {
  CYCLE_DATA: 'pt_cycle_data',
  DAILY_LOGS: 'pt_daily_logs',
  SETTINGS: 'pt_settings',
  BBT_DATA: 'pt_bbt_data',
  THEME: 'pt_theme',
  USER_STATUS: 'pt_user_status',
};

export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };
