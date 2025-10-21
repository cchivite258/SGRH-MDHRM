const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};


export default class LocalStorage {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  getItems() {
    const data = window.localStorage.getItem(this.key) || "{}";
    return JSON.parse(data);
  }

  setItems(value: any) {
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }

  removeItem() {
    window.localStorage.removeItem(this.key);
  }
}
