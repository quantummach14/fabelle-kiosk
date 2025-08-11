let interval: ReturnType<typeof setTimeout>;

export const debounce = (callback: () => void, delay = 400): void => {
  clearTimeout(interval);
  interval = setTimeout(() => {
    callback();
  }, delay);
};
