let memoryToken;

const STORAGE_KEY = "sunsetpost_visitor_token";

const createToken = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getVisitorToken = () => {
  if (memoryToken) return memoryToken;

  try {
    const storedToken = window.localStorage.getItem(STORAGE_KEY);
    if (storedToken) {
      memoryToken = storedToken;
      return memoryToken;
    }

    memoryToken = createToken();
    window.localStorage.setItem(STORAGE_KEY, memoryToken);
    return memoryToken;
  } catch {
    memoryToken = createToken();
    return memoryToken;
  }
};
