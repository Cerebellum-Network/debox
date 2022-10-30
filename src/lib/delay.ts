export const delay = (timeout = 0) => new Promise((resolve) => {
  setTimeout(resolve, timeout);
});
