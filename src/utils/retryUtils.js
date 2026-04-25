export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return response;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
};
