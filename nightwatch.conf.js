module.exports = {
  // An array of folders (excluding subfolders) where your tests are located;
  // if this is not specified, the test source must be passed as the second argument to the test runner.
  src_folders: ["jobs"],

  webdriver: {
    start_process: true,
    port: 9515,
    server_path: require("chromedriver").path,
  },

  test_settings: {
    default: {
      launch_url: "https://nightwatchjs.org",
      desiredCapabilities: {
        browserName: "chrome",
        acceptInsecureCerts: true,
      },
      screenshots: {
        enabled: true,
        on_failure: true,
        path: "artifacts/screenshots",
      },
    },
  },
};
