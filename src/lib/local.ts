type KnowKey = 'address' | 'secret' | 'bucket';

export function get(key: KnowKey): string | undefined {
  try {
    const data = JSON.parse(localStorage.getItem(String(process.env.REACT_APP_NAME)) ?? '');
    return data[key] && String(data[key]);
  } catch (e) {
    return undefined;
  }
}
export function set(key: KnowKey, value: string): void {
  try {
    const data = JSON.parse(localStorage.getItem(String(process.env.REACT_APP_NAME)) ?? '');
    data[key] = value;
    localStorage.setItem(String(process.env.REACT_APP_NAME), JSON.stringify(data));
  } catch (e) {
    const data = { [key]: value };
    localStorage.setItem(String(process.env.REACT_APP_NAME), JSON.stringify(data));
  }
}

export function forget(key: KnowKey) {
  try {
    const data = JSON.parse(localStorage.getItem(String(process.env.REACT_APP_NAME)) ?? '');
    delete data[key];
    localStorage.setItem(String(process.env.REACT_APP_NAME), JSON.stringify(data));
    // eslint-disable-next-line no-empty
  } catch (e) {}
}
