// Polyfill process for browser
window.process = {
  env: {
    NODE_ENV: "production", // Set your environment mode
  },
};
