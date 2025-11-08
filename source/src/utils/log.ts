// TODO: define custom getter for the logger that allows any object access,
// but only actually logs info from the supported loggers

// @ts-nocheck

let logger = {
  // general debug logs
  debug(...args) {
    // console.log(...args);
  },

  // logs relevant to hot reloading
  hotReload(...args) {
    // console.log(...args);
  },

  file(...args) {
    // console.log(...args);
  },

  // logs relevant to network
  network(...args) {
    // console.log(...args);
  },

  // logs relevant to production
  production(...args) {
    console.log(...args);
  },

  git(...args) {
    console.log(...args);
  },
};

export default logger;
