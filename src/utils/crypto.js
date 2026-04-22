export const encrypt = (text) => {
  if (typeof text !== 'string') return text;
  // Simple Base64 encoding for this specific requirement (can be upgraded later)
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    return text;
  }
};

export const decrypt = (text) => {
  if (typeof text !== 'string') return text;
  try {
    return decodeURIComponent(atob(text));
  } catch (e) {
    return text;
  }
};
